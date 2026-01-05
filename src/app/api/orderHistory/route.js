import connectDb from '@/lib/mongodb'
import Order from '@/models/Order'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Helper to get user from token
async function getUserFromToken() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) return null
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded
  } catch {
    return null
  }
}

export async function POST(request) {
  try {
    await connectDb()
    
    const orderData = await request.json()

    if (!orderData.items || !orderData.totalAmount || !orderData.shippingAddress) {
      return NextResponse.json({ error: 'Missing required order fields' }, { status: 400 })
    }

    // Get user if logged in
    const user = await getUserFromToken()

    const newOrder = new Order({
      ...orderData,
      'customer.userId': user?.id,
      'customer.email': orderData.customer?.email || orderData.email,
    })

    await newOrder.save()

    return NextResponse.json({ 
      success: true, 
      order: {
        ...newOrder.toObject(),
        _id: newOrder._id.toString(),
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    await connectDb()

    const { searchParams } = new URL(request.url)
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1)
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
    const skip = (page - 1) * limit

    // Get user from token
    const user = await getUserFromToken()
    
    // Build query
    const query = {}
    
    // If user is logged in, filter by their email or userId
    if (user) {
      query.$or = [
        { 'customer.userId': user.id },
        { 'customer.email': user.email },
      ]
    } else {
      // If not logged in, check for email in query params (for guest checkout)
      const email = searchParams.get('email')
      if (email) {
        query['customer.email'] = email
      } else {
        // No user and no email - return empty
        return NextResponse.json({
          orders: [],
          pagination: { total: 0, page, pages: 0 },
        })
      }
    }
    
    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-paymentDetails.transactionId -timeline -notes')
        .lean(),
      Order.countDocuments(query),
    ])

    // Format orders for response (remove _id)
    const formattedOrders = orders.map(order => ({
      ...order,
      _id: order._id?.toString(),
      id: order._id?.toString(),
    }))

    return NextResponse.json({
      orders: formattedOrders,
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
