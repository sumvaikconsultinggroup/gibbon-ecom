import { NextRequest, NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import Order from '@/models/Order'

// POST /api/admin/orders/[orderId]/invoice - Generate invoice
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    const body = await request.json()
    await connectDb()

    // Find order
    let order = await Order.findOne({ orderId })
    if (!order) {
      order = await Order.findById(orderId)
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Generate invoice number
    const invoiceNumber = order.invoiceNumber || `INV-${new Date().getFullYear()}-${order.orderId.split('-').pop()}`
    
    // Build invoice data
    const invoiceData = {
      invoiceNumber,
      orderId: order.orderId,
      date: new Date().toISOString(),
      dueDate: new Date().toISOString(),
      
      company: {
        name: 'Gibbon Nutrition',
        address: '123 Business Park',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        gstin: 'XXXXXXXXXXXX', // Add real GSTIN
        phone: '+91 9876543210',
        email: 'orders@gibbonnutrition.com',
      },
      
      customer: {
        name: `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim(),
        email: order.customer?.email || '',
        phone: order.customer?.phone || '',
        address: order.billingAddress || order.shippingAddress,
      },
      
      items: order.items?.map((item: any) => ({
        name: item.name,
        sku: item.sku || '',
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      })) || [],
      
      subtotal: order.subtotal || order.totalAmount,
      discount: order.discount || 0,
      discountCode: order.discountCode,
      shipping: order.shipping || 0,
      taxes: order.taxes || 0,
      total: order.totalAmount,
      
      payment: {
        method: order.paymentMethod,
        status: order.paymentDetails?.status || 'pending',
        transactionId: order.paymentDetails?.transactionId,
      },
    }

    // Update order with invoice info
    order.invoiceNumber = invoiceNumber
    order.invoiceGeneratedAt = new Date()
    
    // Add timeline event
    order.timeline = order.timeline || []
    order.timeline.push({
      type: 'status',
      title: 'Invoice Generated',
      description: `Invoice ${invoiceNumber} generated`,
      user: body.user || 'Admin',
    })

    await order.save()

    return NextResponse.json({
      success: true,
      invoice: invoiceData,
    })
  } catch (error) {
    console.error('Error generating invoice:', error)
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 })
  }
}

// GET /api/admin/orders/[orderId]/invoice - Get invoice
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    await connectDb()

    // Find order
    let order = await Order.findOne({ orderId }).lean()
    if (!order) {
      order = await Order.findById(orderId).lean()
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (!order.invoiceNumber) {
      return NextResponse.json({ error: 'Invoice not generated yet' }, { status: 404 })
    }

    // Return invoice data
    const invoiceData = {
      invoiceNumber: order.invoiceNumber,
      orderId: order.orderId,
      date: order.invoiceGeneratedAt || order.createdAt,
      
      company: {
        name: 'Gibbon Nutrition',
        address: '123 Business Park',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        gstin: 'XXXXXXXXXXXX',
        phone: '+91 9876543210',
        email: 'orders@gibbonnutrition.com',
      },
      
      customer: {
        name: `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim(),
        email: order.customer?.email || '',
        phone: order.customer?.phone || '',
        address: order.billingAddress || order.shippingAddress,
      },
      
      items: order.items?.map((item: any) => ({
        name: item.name,
        sku: item.sku || '',
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      })) || [],
      
      subtotal: order.subtotal || order.totalAmount,
      discount: order.discount || 0,
      shipping: order.shipping || 0,
      taxes: order.taxes || 0,
      total: order.totalAmount,
      
      payment: {
        method: order.paymentMethod,
        status: order.paymentDetails?.status || 'pending',
        transactionId: order.paymentDetails?.transactionId,
      },
    }

    return NextResponse.json(invoiceData)
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 })
  }
}
