import connectDb from '@/lib/mongodb'
import Order from '@/models/Order'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const orderData = await request.json()

    if (!orderData.items || !orderData.totalAmount || !orderData.shippingAddress) {
      return NextResponse.json({ error: 'Missing required order fields' }, { status: 400 })
    }

    await connectDb()

    const newOrder = new Order({
      ...orderData,
      userId: orderData.userId || 'guest',
    })

    await newOrder.save()

    return NextResponse.json(newOrder, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    await connectDb()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1)
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
    const skip = (page - 1) * limit

    const query = userId ? { userId } : {}
    
    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-paymentDetails.transactionId')
        .lean(),
      Order.countDocuments(query),
    ])

    return NextResponse.json({
      orders,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Order history fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch order history' }, { status: 500 })
  }
}
