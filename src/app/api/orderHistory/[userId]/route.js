import { NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import Order from '@/models/Order'

export async function GET(request, { params }) {
  try {
    const { userId } = await params

    await connectDb()

    const query = { userId: userId }
    const orders = await Order.find(query).sort({ createdAt: -1 }).lean()

    // Remove _id for serialization
    const cleanedOrders = orders.map(order => ({
      ...order,
      _id: order._id?.toString(),
    }))

    return NextResponse.json(cleanedOrders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 })
  }
}
