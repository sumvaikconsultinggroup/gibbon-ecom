import { NextRequest, NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import Order from '@/models/Order'

export const dynamic = 'force-dynamic'

// GET /api/orders/[orderId] - Get single order details
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    await connectDb()
    
    const { orderId } = await params

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Try to find by orderId first, then by _id
    let order = await Order.findOne({ orderId }).lean()
    
    if (!order) {
      // Try finding by orderNumber
      order = await Order.findOne({ orderNumber: orderId }).lean()
    }

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      )
    }

    // Format order for response
    const formattedOrder = {
      ...order,
      _id: undefined,
      id: order._id?.toString(),
    }

    return NextResponse.json({
      success: true,
      order: formattedOrder,
    })

  } catch (error: any) {
    console.error('Get order error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch order' },
      { status: 500 }
    )
  }
}
