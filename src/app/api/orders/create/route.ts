import { NextRequest, NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import Order from '@/models/Order'
import { v4 as uuidv4 } from 'uuid'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export const dynamic = 'force-dynamic'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Helper to get user from token
async function getUserFromToken() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) return null
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded
  } catch {
    return null
  }
}

// Generate order number
function generateOrderNumber(): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `GN${year}${month}${random}`
}

// POST /api/orders/create - Create a new order
export async function POST(request: NextRequest) {
  try {
    await connectDb()
    
    const body = await request.json()
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      subtotal,
      discount,
      discountCode,
      shippingCost,
      tax,
      totalAmount,
      customerInfo,
      notes,
    } = body

    // Validate required fields
    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, message: 'No items in order' }, { status: 400 })
    }

    if (!shippingAddress) {
      return NextResponse.json({ success: false, message: 'Shipping address is required' }, { status: 400 })
    }

    if (!customerInfo?.email) {
      return NextResponse.json({ success: false, message: 'Customer email is required' }, { status: 400 })
    }

    // Get user if logged in
    const user = await getUserFromToken()

    // Generate unique IDs
    const orderId = `ORD-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`
    const orderNumber = generateOrderNumber()

    // Format items
    const orderItems = items.map((item: any) => ({
      productId: item.productId,
      variantId: item.variantId || item.variant?.id,
      title: item.name || item.title,
      variantTitle: item.variant?.name || item.variantTitle,
      sku: item.sku,
      quantity: item.quantity,
      price: item.price,
      compareAtPrice: item.compareAtPrice || item.comapreAtPrice,
      image: item.imageUrl || item.image,
      weight: item.weight,
    }))

    // Calculate totals if not provided
    const calculatedSubtotal = subtotal || orderItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
    const calculatedTotal = totalAmount || (calculatedSubtotal - (discount || 0) + (shippingCost || 0) + (tax || 0))

    // Create order
    const order = new Order({
      orderId,
      orderNumber,
      
      customer: {
        userId: user?.id,
        email: customerInfo.email,
        firstName: customerInfo.firstName || customerInfo.name?.split(' ')[0] || '',
        lastName: customerInfo.lastName || customerInfo.name?.split(' ').slice(1).join(' ') || '',
        phone: customerInfo.phone,
        acceptsMarketing: customerInfo.acceptsMarketing || false,
      },
      
      items: orderItems,
      
      shippingAddress: {
        firstName: shippingAddress.firstName || customerInfo.firstName || '',
        lastName: shippingAddress.lastName || customerInfo.lastName || '',
        company: shippingAddress.company,
        address1: shippingAddress.address1 || shippingAddress.address || '',
        address2: shippingAddress.address2,
        city: shippingAddress.city,
        state: shippingAddress.state,
        country: shippingAddress.country || 'India',
        zipCode: shippingAddress.zipCode || shippingAddress.zipcode || shippingAddress.pincode || '',
        phone: shippingAddress.phone || customerInfo.phone,
      },
      
      billingAddress: billingAddress ? {
        firstName: billingAddress.firstName || customerInfo.firstName || '',
        lastName: billingAddress.lastName || customerInfo.lastName || '',
        company: billingAddress.company,
        address1: billingAddress.address1 || billingAddress.address || '',
        address2: billingAddress.address2,
        city: billingAddress.city,
        state: billingAddress.state,
        country: billingAddress.country || 'India',
        zipCode: billingAddress.zipCode || billingAddress.zipcode || billingAddress.pincode || '',
        phone: billingAddress.phone,
      } : undefined,
      
      subtotal: calculatedSubtotal,
      discount: discount || 0,
      discountCode: discountCode,
      shippingCost: shippingCost || 0,
      tax: tax || 0,
      totalAmount: calculatedTotal,
      currency: 'INR',
      
      status: paymentMethod === 'cod' ? 'confirmed' : 'pending',
      
      paymentDetails: {
        method: paymentMethod || 'cod',
        status: paymentMethod === 'cod' ? 'pending' : 'pending',
        amount: calculatedTotal,
      },
      
      fulfillmentStatus: 'unfulfilled',
      
      timeline: [{
        id: uuidv4(),
        event: 'order_created',
        description: 'Order was placed',
        createdAt: new Date(),
      }],
      
      notes: notes ? [{
        id: uuidv4(),
        content: notes,
        author: 'Customer',
        isInternal: false,
        createdAt: new Date(),
      }] : [],
      
      source: 'web',
      requiresShipping: true,
    })

    await order.save()

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      order: {
        orderId: order.orderId,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.totalAmount,
        paymentMethod: paymentMethod,
      },
    })

  } catch (error: any) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create order' },
      { status: 500 }
    )
  }
}
