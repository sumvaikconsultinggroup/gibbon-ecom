import { NextRequest, NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import PaymentSettings from '@/models/PaymentSettings'
import Payment from '@/models/Payment'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const STORE_ID = 'default'

// POST /api/payments/payu/create-order
export async function POST(request: NextRequest) {
  try {
    await connectDb()
    
    const body = await request.json()
    const {
      orderId,
      amount,
      productInfo,
      customerInfo,
      surl,
      furl,
    } = body

    if (!orderId || !amount || !customerInfo?.email || !customerInfo?.firstName) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get payment settings
    const settings = await PaymentSettings.findOne({ storeId: STORE_ID })
    
    if (!settings?.payu?.enabled) {
      return NextResponse.json(
        { success: false, message: 'PayU is not enabled' },
        { status: 400 }
      )
    }

    if (!settings.payu.merchantKey || !settings.payu.merchantSalt) {
      return NextResponse.json(
        { success: false, message: 'PayU credentials not configured' },
        { status: 400 }
      )
    }

    const { merchantKey, merchantSalt } = settings.payu
    
    // Generate transaction ID
    const txnid = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    
    // Generate hash
    // Hash formula: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
    const hashString = `${merchantKey}|${txnid}|${amount}|${productInfo || 'Order Payment'}|${customerInfo.firstName}|${customerInfo.email}|||||||||||${merchantSalt}`
    
    const hash = crypto
      .createHash('sha512')
      .update(hashString)
      .digest('hex')

    // Create payment record
    const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    
    await Payment.create({
      paymentId,
      orderId,
      provider: 'payu',
      amount,
      currency: 'INR',
      status: 'pending',
      providerOrderId: txnid,
      customerEmail: customerInfo.email,
      customerPhone: customerInfo.phone || '',
      customerName: `${customerInfo.firstName} ${customerInfo.lastName || ''}`.trim(),
      statusHistory: [{ status: 'pending', timestamp: new Date() }],
    })

    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || 'http://localhost:3000'
    
    return NextResponse.json({
      success: true,
      payuData: {
        key: merchantKey,
        txnid,
        amount: amount.toString(),
        productinfo: productInfo || 'Order Payment',
        firstname: customerInfo.firstName,
        lastname: customerInfo.lastName || '',
        email: customerInfo.email,
        phone: customerInfo.phone || '',
        surl: surl || `${baseUrl}/api/payments/payu/callback`,
        furl: furl || `${baseUrl}/api/payments/payu/callback`,
        hash,
        payuUrl: settings.payu.testMode
          ? 'https://test.payu.in/_payment'
          : 'https://secure.payu.in/_payment',
      },
      paymentId,
      orderId,
    })

  } catch (error: any) {
    console.error('Create PayU order error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
