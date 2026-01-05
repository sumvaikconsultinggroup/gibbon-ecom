import { NextRequest, NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import PaymentSettings from '@/models/PaymentSettings'
import Payment from '@/models/Payment'
import Order from '@/models/Order'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const STORE_ID = 'default'

// POST /api/payments/payu/callback - PayU callback handler
export async function POST(request: NextRequest) {
  try {
    await connectDb()
    
    const formData = await request.formData()
    
    // Extract PayU response parameters
    const status = formData.get('status') as string
    const txnid = formData.get('txnid') as string
    const amount = formData.get('amount') as string
    const productinfo = formData.get('productinfo') as string
    const firstname = formData.get('firstname') as string
    const email = formData.get('email') as string
    const mihpayid = formData.get('mihpayid') as string
    const hash = formData.get('hash') as string
    const mode = formData.get('mode') as string
    const error_Message = formData.get('error_Message') as string
    const bank_ref_num = formData.get('bank_ref_num') as string
    const unmappedstatus = formData.get('unmappedstatus') as string

    // Get payment settings for verification
    const settings = await PaymentSettings.findOne({ storeId: STORE_ID })
    
    if (!settings?.payu?.merchantSalt) {
      // Redirect to failure page
      const failUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/payment/failure/${txnid}?error=config`
      return NextResponse.redirect(failUrl)
    }

    // Verify hash (reverse hash)
    // Reverse hash: sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
    const reverseHashString = `${settings.payu.merchantSalt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${settings.payu.merchantKey}`
    
    const calculatedHash = crypto
      .createHash('sha512')
      .update(reverseHashString)
      .digest('hex')

    // Find payment record
    const payment = await Payment.findOne({ providerOrderId: txnid })
    
    if (!payment) {
      const failUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/payment/failure/${txnid}?error=not_found`
      return NextResponse.redirect(failUrl)
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''

    if (status === 'success' && hash === calculatedHash) {
      // Payment successful
      await Payment.findOneAndUpdate(
        { providerOrderId: txnid },
        {
          $set: {
            status: 'captured',
            providerPaymentId: mihpayid,
            capturedAt: new Date(),
            paymentMethod: {
              type: mode as any,
              bankName: formData.get('bankcode') as string,
            },
            metadata: {
              bank_ref_num,
              mode,
              unmappedstatus,
            },
          },
          $push: {
            statusHistory: { status: 'captured', timestamp: new Date() }
          }
        }
      )

      // Update order
      await Order.findOneAndUpdate(
        { orderId: payment.orderId },
        {
          $set: {
            status: 'confirmed',
            'paymentDetails.status': 'paid',
            'paymentDetails.transactionId': mihpayid,
            'paymentDetails.paidAt': new Date(),
          },
          $push: {
            timeline: {
              id: `${Date.now()}`,
              event: 'payment_captured',
              description: `Payment of ₹${amount} captured via PayU`,
              createdAt: new Date(),
            }
          }
        }
      )

      // Redirect to success page
      return NextResponse.redirect(`${baseUrl}/payment/success/${txnid}`)
    } else {
      // Payment failed or hash mismatch
      await Payment.findOneAndUpdate(
        { providerOrderId: txnid },
        {
          $set: {
            status: 'failed',
            errorMessage: error_Message || 'Payment failed',
            failedAt: new Date(),
          },
          $push: {
            statusHistory: { 
              status: 'failed', 
              timestamp: new Date(),
              reason: error_Message || (hash !== calculatedHash ? 'Hash verification failed' : 'Unknown error')
            }
          }
        }
      )

      // Update order
      await Order.findOneAndUpdate(
        { orderId: payment.orderId },
        {
          $set: {
            'paymentDetails.status': 'failed',
          },
          $push: {
            timeline: {
              id: `${Date.now()}`,
              event: 'payment_failed',
              description: error_Message || 'Payment failed',
              createdAt: new Date(),
            }
          }
        }
      )

      return NextResponse.redirect(`${baseUrl}/payment/failure/${txnid}?error=${encodeURIComponent(error_Message || 'Payment failed')}`)
    }

  } catch (error: any) {
    console.error('PayU callback error:', error)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    return NextResponse.redirect(`${baseUrl}/payment/failure/unknown?error=server_error`)
  }
}

// GET handler for redirect
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const txnid = searchParams.get('txnid')
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''
  
  if (txnid) {
    return NextResponse.redirect(`${baseUrl}/payment/failure/${txnid}?error=invalid_method`)
  }
  return NextResponse.redirect(`${baseUrl}/payment/failure/unknown`)
}
