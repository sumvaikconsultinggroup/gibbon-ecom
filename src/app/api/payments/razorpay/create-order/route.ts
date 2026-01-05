import { NextRequest, NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import PaymentSettings from '@/models/PaymentSettings'
import Payment from '@/models/Payment'
import Order from '@/models/Order'

export const dynamic = 'force-dynamic'

const STORE_ID = 'default'

// POST /api/payments/razorpay/create-order
export async function POST(request: NextRequest) {
  try {
    await connectDb()
    
    const body = await request.json()
    const { orderId, amount, currency = 'INR', customerInfo } = body

    if (!orderId || !amount) {
      return NextResponse.json(
        { success: false, message: 'Order ID and amount are required' },
        { status: 400 }
      )
    }

    // Get payment settings
    const settings = await PaymentSettings.findOne({ storeId: STORE_ID })
    
    if (!settings?.razorpay?.enabled) {
      return NextResponse.json(
        { success: false, message: 'Razorpay is not enabled' },
        { status: 400 }
      )
    }

    if (!settings.razorpay.keyId || !settings.razorpay.keySecret) {
      return NextResponse.json(
        { success: false, message: 'Razorpay credentials not configured' },
        { status: 400 }
      )
    }

    // Create Razorpay order using REST API
    const auth = Buffer.from(`${settings.razorpay.keyId}:${settings.razorpay.keySecret}`).toString('base64')
    
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to paise
        currency: currency,
        receipt: orderId,
        payment_capture: settings.razorpay.autoCapture ? 1 : 0,
        notes: {
          orderId: orderId,
        },
      }),
    })

    if (!razorpayResponse.ok) {
      const errorData = await razorpayResponse.json()
      console.error('Razorpay order creation failed:', errorData)
      return NextResponse.json(
        { success: false, message: errorData.error?.description || 'Failed to create Razorpay order' },
        { status: 400 }
      )
    }

    const razorpayOrder = await razorpayResponse.json()

    // Create payment record
    const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    
    await Payment.create({
      paymentId,
      orderId,
      provider: 'razorpay',
      amount,
      currency,
      status: 'pending',
      providerOrderId: razorpayOrder.id,
      customerEmail: customerInfo?.email || '',
      customerPhone: customerInfo?.phone || '',
      customerName: customerInfo?.name || customerInfo?.firstName || '',
      statusHistory: [{ status: 'pending', timestamp: new Date() }],
    })

    return NextResponse.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: settings.razorpay.keyId,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      paymentId,
      orderId,
    })

  } catch (error: any) {
    console.error('Create Razorpay order error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
