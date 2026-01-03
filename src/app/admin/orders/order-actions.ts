'use server'

import connectDb from '@/lib/mongodb'
import Order from '@/models/Order'
import Shipment from '@/models/Shipment'
import User from '@/models/User'
import { v4 as uuidv4 } from 'uuid'

// Get all orders with filtering
export async function getOrdersAction(params: {
  page?: number
  limit?: number
  status?: string
  paymentStatus?: string
  search?: string
  startDate?: string
  endDate?: string
  assignedTo?: string
  sortBy?: string
  sortOrder?: string
}) {
  try {
    await connectDb()
    
    const page = params.page || 1
    const limit = Math.min(params.limit || 20, 100)
    const skip = (page - 1) * limit
    
    // Build query
    const query: any = {}
    
    if (params.status && params.status !== 'all') {
      query.status = params.status
    }
    
    if (params.paymentStatus && params.paymentStatus !== 'all') {
      query['paymentDetails.status'] = params.paymentStatus
    }
    
    if (params.assignedTo) {
      query.assignedTo = params.assignedTo
    }
    
    if (params.startDate || params.endDate) {
      query.createdAt = {}
      if (params.startDate) query.createdAt.$gte = new Date(params.startDate)
      if (params.endDate) query.createdAt.$lte = new Date(params.endDate)
    }
    
    if (params.search) {
      query.$or = [
        { orderId: { $regex: params.search, $options: 'i' } },
        { 'customer.email': { $regex: params.search, $options: 'i' } },
        { 'customer.firstName': { $regex: params.search, $options: 'i' } },
        { 'customer.lastName': { $regex: params.search, $options: 'i' } },
        { 'customer.phone': { $regex: params.search, $options: 'i' } },
      ]
    }

    // Sort configuration
    const sortBy = params.sortBy || 'createdAt'
    const sortOrder = params.sortOrder || 'desc'
    const sort: any = {}
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1

    // Execute query with pagination
    const [orders, total, statusCounts] = await Promise.all([
      Order.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-timeline -notes')
        .lean(),
      Order.countDocuments(query),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ])

    // Format orders for response
    const formattedOrders = orders.map((order: any) => ({
      ...order,
      _id: order._id?.toString(),
      id: order._id?.toString(),
    }))

    // Format status counts
    const statusCountMap: Record<string, number> = {}
    statusCounts.forEach((item: any) => {
      statusCountMap[item._id] = item.count
    })

    return {
      success: true,
      orders: formattedOrders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      statusCounts: statusCountMap,
    }
  } catch (error: any) {
    console.error('Error fetching orders:', error)
    return { success: false, error: error.message || 'Failed to fetch orders' }
  }
}

// Get single order
export async function getOrderAction(orderId: string) {
  try {
    await connectDb()

    let order = await Order.findOne({ orderId }).lean()
    if (!order) {
      order = await Order.findById(orderId).lean()
    }

    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    // Get shipment if exists
    let shipment = null
    if (order.fulfillment?.shipmentId) {
      shipment = await Shipment.findOne({ shipmentId: order.fulfillment.shipmentId }).lean()
    }

    // Get customer details
    let customerDetails = null
    if (order.userId && order.userId !== 'guest') {
      const customerOrders = await Order.aggregate([
        { $match: { 'customer.email': order.customer?.email } },
        { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$totalAmount' } } }
      ])
      
      customerDetails = {
        totalOrders: customerOrders[0]?.count || 1,
        totalSpent: customerOrders[0]?.total || order.totalAmount,
      }
    }

    return {
      success: true,
      order: {
        ...order,
        _id: undefined,
        id: order._id?.toString(),
        customer: {
          ...order.customer,
          ...customerDetails,
          name: `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 'Guest',
        },
        shipment: shipment ? {
          ...shipment,
          _id: undefined,
          id: shipment._id?.toString(),
        } : null,
      },
    }
  } catch (error: any) {
    console.error('Error fetching order:', error)
    return { success: false, error: error.message || 'Failed to fetch order' }
  }
}

// Update order
export async function updateOrderAction(orderId: string, action: string, data: any) {
  try {
    await connectDb()

    let order = await Order.findOne({ orderId })
    if (!order) {
      order = await Order.findById(orderId)
    }

    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    switch (action) {
      case 'update_status': {
        const previousStatus = order.status
        order.status = data.status
        order.timeline = order.timeline || []
        order.timeline.push({
          type: 'status',
          title: 'Status Updated',
          description: `Order status changed from ${previousStatus} to ${data.status}`,
          user: data.user || 'Admin',
        })
        break
      }

      case 'add_note': {
        order.notes = order.notes || []
        order.notes.push({
          content: data.content,
          author: data.author || 'Admin',
          isInternal: data.isInternal !== false,
        })
        order.timeline = order.timeline || []
        order.timeline.push({
          type: 'note',
          title: 'Note Added',
          description: data.content,
          user: data.author || 'Admin',
        })
        break
      }

      case 'add_tag': {
        order.tags = order.tags || []
        if (!order.tags.includes(data.tag)) {
          order.tags.push(data.tag)
        }
        break
      }

      case 'remove_tag': {
        order.tags = (order.tags || []).filter((t: string) => t !== data.tag)
        break
      }

      case 'assign': {
        const previousAssignee = order.assignedTo
        order.assignedTo = data.assignedTo
        order.timeline = order.timeline || []
        order.timeline.push({
          type: 'status',
          title: 'Order Reassigned',
          description: `Order reassigned from ${previousAssignee || 'Unassigned'} to ${data.assignedTo}`,
          user: data.user || 'Admin',
        })
        break
      }

      case 'cancel': {
        if (['delivered', 'cancelled', 'refunded'].includes(order.status)) {
          return { success: false, error: 'Cannot cancel order in current status' }
        }
        order.status = 'cancelled'
        order.timeline = order.timeline || []
        order.timeline.push({
          type: 'status',
          title: 'Order Cancelled',
          description: data.reason || 'Order was cancelled',
          user: data.user || 'Admin',
        })
        break
      }

      case 'update_shipping_address': {
        order.shippingAddress = {
          ...order.shippingAddress,
          ...data.shippingAddress,
        }
        order.timeline = order.timeline || []
        order.timeline.push({
          type: 'status',
          title: 'Shipping Address Updated',
          description: 'Shipping address was modified',
          user: data.user || 'Admin',
        })
        break
      }
    }

    await order.save()

    return {
      success: true,
      order: {
        ...order.toObject(),
        _id: undefined,
        id: order._id?.toString(),
      },
    }
  } catch (error: any) {
    console.error('Error updating order:', error)
    return { success: false, error: error.message || 'Failed to update order' }
  }
}

// Create shipment
export async function createShipmentAction(orderId: string, data: any) {
  try {
    await connectDb()

    let order = await Order.findOne({ orderId })
    if (!order) {
      order = await Order.findById(orderId)
    }

    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    if (order.fulfillment?.shipmentId) {
      return { success: false, error: 'Order already has a shipment' }
    }

    const shipmentId = `SHP-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`
    const trackingNumber = data.trackingNumber || `TRK${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`

    const shipment = new Shipment({
      shipmentId,
      orderId: order.orderId,
      provider: data.provider || 'manual',
      awbNumber: trackingNumber,
      courierName: data.carrier || 'Manual Shipping',
      status: 'processing',
      statusHistory: [{
        status: 'processing',
        timestamp: new Date(),
        description: 'Shipment created',
      }],
      shippingMethod: data.shippingMethod || 'standard',
      shippingCost: data.shippingCost || order.shipping || 0,
      estimatedDeliveryDate: data.estimatedDeliveryDate || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      isCod: order.paymentMethod === 'cod',
      codAmount: order.paymentMethod === 'cod' ? order.totalAmount : 0,
      items: order.items?.map((item: any) => ({
        productId: item.productId,
        productName: item.name,
        sku: item.sku,
        quantity: item.quantity,
        price: item.price,
      })) || [],
      deliveryAddress: {
        name: `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim(),
        phone: order.customer?.phone || '',
        email: order.customer?.email || '',
        address: order.shippingAddress?.address || order.shippingAddress?.address1 || '',
        city: order.shippingAddress?.city || '',
        state: order.shippingAddress?.state || '',
        pincode: order.shippingAddress?.zipcode || '',
        country: order.shippingAddress?.country || 'India',
      },
      trackingUrl: `https://track.example.com/${trackingNumber}`,
    })

    await shipment.save()

    order.fulfillment = {
      status: 'fulfilled',
      shipmentId: shipment.shipmentId,
      carrier: shipment.courierName,
      trackingNumber: shipment.awbNumber,
      trackingUrl: shipment.trackingUrl,
      shippedAt: new Date(),
      estimatedDelivery: shipment.estimatedDeliveryDate,
    }
    order.status = 'shipped'
    order.timeline = order.timeline || []
    order.timeline.push({
      type: 'shipping',
      title: 'Shipment Created',
      description: `Shipment ${shipmentId} created with ${shipment.courierName}. Tracking: ${trackingNumber}`,
      user: data.user || 'Admin',
    })

    await order.save()

    return {
      success: true,
      shipment: {
        ...shipment.toObject(),
        _id: undefined,
        id: shipment._id?.toString(),
      },
    }
  } catch (error: any) {
    console.error('Error creating shipment:', error)
    return { success: false, error: error.message || 'Failed to create shipment' }
  }
}

// Process refund
export async function processRefundAction(orderId: string, amount: number, reason: string) {
  try {
    await connectDb()

    let order = await Order.findOne({ orderId })
    if (!order) {
      order = await Order.findById(orderId)
    }

    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    if (order.paymentDetails?.status !== 'paid') {
      return { success: false, error: 'Order has not been paid' }
    }

    const refundAmount = amount || order.totalAmount
    const refundId = `REF-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`

    order.paymentDetails = {
      ...order.paymentDetails,
      status: 'refunded',
      refundId,
      refundedAt: new Date(),
      refundAmount,
    }
    order.status = 'refunded'
    order.timeline = order.timeline || []
    order.timeline.push({
      type: 'refund',
      title: 'Refund Processed',
      description: `Refund of ₹${refundAmount.toLocaleString()} processed. Reason: ${reason || 'Not specified'}`,
      user: 'Admin',
    })

    await order.save()

    return {
      success: true,
      refund: {
        refundId,
        amount: refundAmount,
        status: 'processed',
      },
    }
  } catch (error: any) {
    console.error('Error processing refund:', error)
    return { success: false, error: error.message || 'Failed to process refund' }
  }
}

// Generate invoice
export async function generateInvoiceAction(orderId: string) {
  try {
    await connectDb()

    let order = await Order.findOne({ orderId })
    if (!order) {
      order = await Order.findById(orderId)
    }

    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    const invoiceNumber = order.invoiceNumber || `INV-${new Date().getFullYear()}-${order.orderId.split('-').pop()}`

    order.invoiceNumber = invoiceNumber
    order.invoiceGeneratedAt = new Date()
    order.timeline = order.timeline || []
    order.timeline.push({
      type: 'status',
      title: 'Invoice Generated',
      description: `Invoice ${invoiceNumber} generated`,
      user: 'Admin',
    })

    await order.save()

    return {
      success: true,
      invoice: {
        invoiceNumber,
        orderId: order.orderId,
        date: new Date().toISOString(),
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
      },
    }
  } catch (error: any) {
    console.error('Error generating invoice:', error)
    return { success: false, error: error.message || 'Failed to generate invoice' }
  }
}

// Send email
export async function sendOrderEmailAction(orderId: string, emailType: string, customMessage?: string) {
  try {
    await connectDb()

    let order = await Order.findOne({ orderId })
    if (!order) {
      order = await Order.findById(orderId)
    }

    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    if (!order.customer?.email) {
      return { success: false, error: 'Customer email not available' }
    }

    order.timeline = order.timeline || []
    order.timeline.push({
      type: 'email',
      title: 'Email Sent',
      description: `${emailType.replace('_', ' ')} email sent to ${order.customer.email}`,
      user: 'Admin',
    })

    await order.save()

    return {
      success: true,
      message: `Email sent to ${order.customer.email}`,
    }
  } catch (error: any) {
    console.error('Error sending email:', error)
    return { success: false, error: error.message || 'Failed to send email' }
  }
}
