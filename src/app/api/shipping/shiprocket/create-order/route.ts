import { NextRequest, NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import PaymentSettings from '@/models/PaymentSettings'
import Shipment from '@/models/Shipment'
import Order from '@/models/Order'

export const dynamic = 'force-dynamic'

const STORE_ID = 'default'

// Shiprocket API helper
class ShiprocketAPI {
  private token: string | null = null
  private tokenExpiry: Date | null = null
  private email: string
  private password: string
  private baseUrl = 'https://apiv2.shiprocket.in/v1/external'

  constructor(email: string, password: string) {
    this.email = email
    this.password = password
  }

  async authenticate(): Promise<string> {
    // Check if token is still valid
    if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.token
    }

    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: this.email,
        password: this.password,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Shiprocket authentication failed')
    }

    const data = await response.json()
    this.token = data.token
    // Token valid for 10 days, but we'll refresh after 9 days
    this.tokenExpiry = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000)
    
    return this.token
  }

  async request(endpoint: string, method: string = 'GET', body?: any) {
    const token = await this.authenticate()

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Shiprocket API request failed')
    }

    return data
  }

  async createOrder(orderData: any) {
    return this.request('/orders/create/adhoc', 'POST', orderData)
  }

  async generateAWB(shipmentId: number, courierId?: number) {
    return this.request('/courier/assign/awb', 'POST', {
      shipment_id: shipmentId,
      courier_id: courierId,
    })
  }

  async generateLabel(shipmentId: number) {
    return this.request('/courier/generate/label', 'POST', {
      shipment_id: [shipmentId],
    })
  }

  async generateInvoice(orderId: number) {
    return this.request('/orders/print/invoice', 'POST', {
      ids: [orderId],
    })
  }

  async getTrackingDetails(awb: string) {
    return this.request(`/courier/track/awb/${awb}`)
  }

  async getShipmentDetails(shipmentId: number) {
    return this.request(`/shipments/${shipmentId}`)
  }

  async cancelOrder(orderId: number) {
    return this.request('/orders/cancel', 'POST', {
      ids: [orderId],
    })
  }

  async getCourierServiceability(params: {
    pickup_postcode: string
    delivery_postcode: string
    weight: number
    cod: number
  }) {
    const query = new URLSearchParams({
      pickup_postcode: params.pickup_postcode,
      delivery_postcode: params.delivery_postcode,
      weight: params.weight.toString(),
      cod: params.cod.toString(),
    }).toString()
    return this.request(`/courier/serviceability?${query}`)
  }

  async requestPickup(shipmentId: number) {
    return this.request('/courier/generate/pickup', 'POST', {
      shipment_id: [shipmentId],
    })
  }
}

// POST /api/shipping/shiprocket/create-order
export async function POST(request: NextRequest) {
  try {
    await connectDb()
    
    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Get shipping settings
    const settings = await PaymentSettings.findOne({ storeId: STORE_ID })
    
    if (!settings?.shiprocket?.enabled) {
      return NextResponse.json(
        { success: false, message: 'Shiprocket is not enabled' },
        { status: 400 }
      )
    }

    if (!settings.shiprocket.email || !settings.shiprocket.password) {
      return NextResponse.json(
        { success: false, message: 'Shiprocket credentials not configured' },
        { status: 400 }
      )
    }

    // Get order details
    const order = await Order.findOne({ orderId })
    
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if shipment already exists
    const existingShipment = await Shipment.findOne({ orderId })
    if (existingShipment?.providerShipmentId) {
      return NextResponse.json(
        { success: false, message: 'Shipment already created for this order' },
        { status: 400 }
      )
    }

    // Initialize Shiprocket API
    const shiprocket = new ShiprocketAPI(
      settings.shiprocket.email,
      settings.shiprocket.password
    )

    // Prepare order data for Shiprocket
    const shiprocketOrderData = {
      order_id: order.orderNumber,
      order_date: new Date(order.createdAt).toISOString().split('T')[0],
      pickup_location: settings.shiprocket.pickupLocation || 'Primary',
      channel_id: settings.shiprocket.channelId || '',
      comment: order.notes?.[0]?.content || '',
      billing_customer_name: order.customer.firstName,
      billing_last_name: order.customer.lastName || '',
      billing_address: order.billingAddress?.address1 || order.shippingAddress.address1,
      billing_address_2: order.billingAddress?.address2 || order.shippingAddress.address2 || '',
      billing_city: order.billingAddress?.city || order.shippingAddress.city,
      billing_pincode: order.billingAddress?.zipCode || order.shippingAddress.zipCode,
      billing_state: order.billingAddress?.state || order.shippingAddress.state,
      billing_country: order.billingAddress?.country || order.shippingAddress.country || 'India',
      billing_email: order.customer.email,
      billing_phone: order.customer.phone,
      shipping_is_billing: !order.billingAddress,
      shipping_customer_name: order.shippingAddress.firstName,
      shipping_last_name: order.shippingAddress.lastName || '',
      shipping_address: order.shippingAddress.address1,
      shipping_address_2: order.shippingAddress.address2 || '',
      shipping_city: order.shippingAddress.city,
      shipping_pincode: order.shippingAddress.zipCode,
      shipping_state: order.shippingAddress.state,
      shipping_country: order.shippingAddress.country || 'India',
      shipping_email: order.customer.email,
      shipping_phone: order.shippingAddress.phone || order.customer.phone,
      order_items: order.items.map((item: any) => ({
        name: item.title,
        sku: item.sku || item.productId,
        units: item.quantity,
        selling_price: item.price,
        discount: 0,
        tax: 0,
        hsn: '',
      })),
      payment_method: order.paymentDetails.method === 'cod' ? 'COD' : 'Prepaid',
      sub_total: order.subtotal,
      length: body.length || 10,
      breadth: body.breadth || 10,
      height: body.height || 10,
      weight: body.weight || 0.5,
    }

    // Create order in Shiprocket
    const shiprocketResponse = await shiprocket.createOrder(shiprocketOrderData)

    // Create shipment record
    const shipmentId = `SHP_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    
    const shipment = await Shipment.create({
      shipmentId,
      orderId,
      provider: 'shiprocket',
      providerShipmentId: shiprocketResponse.shipment_id?.toString(),
      providerOrderId: shiprocketResponse.order_id?.toString(),
      package: {
        weight: body.weight || 0.5,
        length: body.length || 10,
        width: body.breadth || 10,
        height: body.height || 10,
      },
      pickupAddress: {
        name: settings.shiprocket.pickupName || 'Gibbon Nutrition',
        phone: settings.shiprocket.pickupPhone || '',
        address: settings.shiprocket.pickupAddress || '',
        city: settings.shiprocket.pickupCity || '',
        state: settings.shiprocket.pickupState || '',
        pincode: settings.shiprocket.pickupPincode || '',
        country: 'India',
      },
      deliveryAddress: {
        name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName || ''}`.trim(),
        phone: order.shippingAddress.phone || order.customer.phone,
        email: order.customer.email,
        address: order.shippingAddress.address1,
        address2: order.shippingAddress.address2,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        pincode: order.shippingAddress.zipCode,
        country: order.shippingAddress.country || 'India',
      },
      status: 'processing',
      statusHistory: [{ status: 'processing', timestamp: new Date() }],
      shippingMethod: order.paymentDetails.method === 'cod' ? 'cod' : 'standard',
      isCod: order.paymentDetails.method === 'cod',
      codAmount: order.paymentDetails.method === 'cod' ? order.totalAmount : undefined,
      items: order.items.map((item: any) => ({
        productId: item.productId,
        productName: item.title,
        sku: item.sku,
        quantity: item.quantity,
        price: item.price,
      })),
    })

    // Update order with shipment info
    await Order.findOneAndUpdate(
      { orderId },
      {
        $set: {
          fulfillmentStatus: 'processing',
          'shippingDetails.provider': 'shiprocket',
          'shippingDetails.shipmentId': shipmentId,
        },
        $push: {
          timeline: {
            id: `${Date.now()}`,
            event: 'shipment_created',
            description: 'Shipment created in Shiprocket',
            createdAt: new Date(),
          }
        }
      }
    )

    return NextResponse.json({
      success: true,
      message: 'Shiprocket order created successfully',
      shipment: {
        shipmentId,
        providerShipmentId: shiprocketResponse.shipment_id,
        providerOrderId: shiprocketResponse.order_id,
      },
    })

  } catch (error: any) {
    console.error('Create Shiprocket order error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create Shiprocket order' },
      { status: 500 }
    )
  }
}
