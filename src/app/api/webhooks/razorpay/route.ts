import { NextRequest, NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import PaymentSettings from '@/models/PaymentSettings'
import Payment from '@/models/Payment'
import Order from '@/models/Order'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const STORE_ID = 'default'

// POST /api/webhooks/razorpay - Razorpay webhook handler
export async function POST(request: NextRequest) {
  try {
    await connectDb()
    
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json({ success: false, message: 'Missing signature' }, { status: 400 })
    }

    // Get webhook secret
    const settings = await PaymentSettings.findOne({ storeId: STORE_ID })
    
    if (!settings?.razorpay?.webhookSecret) {
      console.warn('Razorpay webhook secret not configured')
      // Still process the webhook but log warning
    } else {
      // Verify signature
      const expectedSignature = crypto
        .createHmac('sha256', settings.razorpay.webhookSecret)
        .update(body)
        .digest('hex')

      if (expectedSignature !== signature) {
        console.error('Invalid Razorpay webhook signature')
        return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 400 })
      }
    }

    const event = JSON.parse(body)
    const { event: eventType, payload } = event

    console.log('Razorpay webhook event:', eventType)

    switch (eventType) {
      case 'payment.captured': {
        const paymentEntity = payload.payment.entity
        const razorpayOrderId = paymentEntity.order_id
        const razorpayPaymentId = paymentEntity.id
        const amount = paymentEntity.amount / 100 // Convert from paise

        // Update payment
        const payment = await Payment.findOneAndUpdate(
          { providerOrderId: razorpayOrderId },
          {
            $set: {
              status: 'captured',
              providerPaymentId: razorpayPaymentId,
              capturedAt: new Date(),
              paymentMethod: {
                type: paymentEntity.method,
                cardNetwork: paymentEntity.card?.network,
                cardLast4: paymentEntity.card?.last4,
                bankCode: paymentEntity.bank,
                walletName: paymentEntity.wallet,
                upiId: paymentEntity.vpa,
              },
            },
            $push: {
              statusHistory: { status: 'captured', timestamp: new Date() },
              webhookEvents: {
                eventType,
                eventId: event.id,
                receivedAt: new Date(),
                payload: paymentEntity,
              }
            }
          },
          { new: true }
        )

        if (payment) {
          // Update order
          await Order.findOneAndUpdate(
            { orderId: payment.orderId },
            {
              $set: {
                status: 'confirmed',
                'paymentDetails.status': 'paid',
                'paymentDetails.transactionId': razorpayPaymentId,
                'paymentDetails.paidAt': new Date(),
              },
              $push: {
                timeline: {
                  id: `${Date.now()}`,
                  event: 'payment_captured',
                  description: `Payment of ₹${amount} captured via Razorpay webhook`,
                  createdAt: new Date(),
                }
              }
            }
          )
        }
        break
      }

      case 'payment.failed': {
        const paymentEntity = payload.payment.entity
        const razorpayOrderId = paymentEntity.order_id

        await Payment.findOneAndUpdate(
          { providerOrderId: razorpayOrderId },
          {
            $set: {
              status: 'failed',
              errorCode: paymentEntity.error_code,
              errorMessage: paymentEntity.error_description,
              failedAt: new Date(),
            },
            $push: {
              statusHistory: { 
                status: 'failed', 
                timestamp: new Date(),
                reason: paymentEntity.error_description
              },
              webhookEvents: {
                eventType,
                eventId: event.id,
                receivedAt: new Date(),
                payload: paymentEntity,
              }
            }
          }
        )
        break
      }

      case 'refund.processed': {
        const refundEntity = payload.refund.entity
        const paymentId = refundEntity.payment_id
        const refundAmount = refundEntity.amount / 100

        const payment = await Payment.findOne({ providerPaymentId: paymentId })
        if (payment) {
          const totalRefunded = (payment.amountRefunded || 0) + refundAmount
          const newStatus = totalRefunded >= payment.amount ? 'refunded' : 'partially_refunded'

          await Payment.findOneAndUpdate(
            { providerPaymentId: paymentId },
            {
              $set: {
                status: newStatus,
                amountRefunded: totalRefunded,
              },
              $push: {
                refunds: {
                  refundId: refundEntity.id,
                  amount: refundAmount,
                  status: 'processed',
                  reason: refundEntity.notes?.reason || 'Refund processed',
                  createdAt: new Date(refundEntity.created_at * 1000),
                  processedAt: new Date(),
                },
                webhookEvents: {
                  eventType,
                  eventId: event.id,
                  receivedAt: new Date(),
                  payload: refundEntity,
                }
              }
            }
          )

          // Update order
          await Order.findOneAndUpdate(
            { orderId: payment.orderId },
            {
              $set: {
                status: newStatus === 'refunded' ? 'refunded' : 'confirmed',
                'paymentDetails.status': newStatus,
              },
              $push: {
                timeline: {
                  id: `${Date.now()}`,
                  event: 'refund_processed',
                  description: `Refund of ₹${refundAmount} processed`,
                  createdAt: new Date(),
                }
              }
            }
          )
        }
        break
      }

      default:
        console.log('Unhandled Razorpay webhook event:', eventType)
    }

    return NextResponse.json({ success: true, received: true })

  } catch (error: any) {
    console.error('Razorpay webhook error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
