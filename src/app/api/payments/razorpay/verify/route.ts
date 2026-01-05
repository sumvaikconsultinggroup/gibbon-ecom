import { NextRequest, NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import PaymentSettings from '@/models/PaymentSettings'
import Payment from '@/models/Payment'
import Order from '@/models/Order'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const STORE_ID = 'default'

// POST /api/payments/razorpay/verify
export async function POST(request: NextRequest) {
  try {
    await connectDb()
    
    const body = await request.json()
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, message: 'Missing payment verification parameters' },
        { status: 400 }
      )
    }

    // Get payment settings
    const settings = await PaymentSettings.findOne({ storeId: STORE_ID })
    
    if (!settings?.razorpay?.keySecret) {
      return NextResponse.json(
        { success: false, message: 'Razorpay secret not configured' },
        { status: 400 }
      )
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', settings.razorpay.keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      // Update payment as failed
      await Payment.findOneAndUpdate(
        { providerOrderId: razorpay_order_id },
        {
          $set: {
            status: 'failed',
            errorMessage: 'Invalid payment signature',
            failedAt: new Date(),
          },
          $push: {
            statusHistory: { status: 'failed', timestamp: new Date(), reason: 'Invalid signature' }
          }
        }
      )

      return NextResponse.json(
        { success: false, message: 'Invalid payment signature' },
        { status: 400 }
      )
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { providerOrderId: razorpay_order_id },
      {
        $set: {
          status: 'captured',
          providerPaymentId: razorpay_payment_id,
          providerSignature: razorpay_signature,
          capturedAt: new Date(),
        },
        $push: {
          statusHistory: { status: 'captured', timestamp: new Date() }
        }
      },
      { new: true }
    )

    if (payment) {
      // Update order status
      await Order.findOneAndUpdate(
        { orderId: payment.orderId },
        {
          $set: {
            status: 'confirmed',
            'paymentDetails.status': 'paid',
            'paymentDetails.transactionId': razorpay_payment_id,
            'paymentDetails.paidAt': new Date(),
          },
          $push: {
            timeline: {
              id: `${Date.now()}`,
              event: 'payment_captured',
              description: `Payment of ₹${payment.amount} captured via Razorpay`,
              createdAt: new Date(),
            }
          }
        }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      orderId: payment?.orderId || orderId,
      paymentId: payment?.paymentId,
    })

  } catch (error: any) {
    console.error('Verify Razorpay payment error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
