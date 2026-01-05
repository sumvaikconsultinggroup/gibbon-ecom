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
}

// POST /api/shipping/shiprocket/generate-awb
export async function POST(request: NextRequest) {
  try {
    await connectDb()
    
    const body = await request.json()
    const { shipmentId, courierId } = body

    if (!shipmentId) {
      return NextResponse.json(
        { success: false, message: 'Shipment ID is required' },
        { status: 400 }
      )
    }

    // Get shipping settings
    const settings = await PaymentSettings.findOne({ storeId: STORE_ID })
    
    if (!settings?.shiprocket?.enabled || !settings.shiprocket.email || !settings.shiprocket.password) {
      return NextResponse.json(
        { success: false, message: 'Shiprocket not configured' },
        { status: 400 }
      )
    }

    // Get shipment
    const shipment = await Shipment.findOne({ shipmentId })
    
    if (!shipment) {
      return NextResponse.json(
        { success: false, message: 'Shipment not found' },
        { status: 404 }
      )
    }

    if (!shipment.providerShipmentId) {
      return NextResponse.json(
        { success: false, message: 'Shiprocket shipment ID not found' },
        { status: 400 }
      )
    }

    // Initialize Shiprocket API
    const shiprocket = new ShiprocketAPI(
      settings.shiprocket.email,
      settings.shiprocket.password
    )

    // Generate AWB
    const awbResponse = await shiprocket.request('/courier/assign/awb', 'POST', {
      shipment_id: parseInt(shipment.providerShipmentId),
      courier_id: courierId,
    })

    // Update shipment
    await Shipment.findOneAndUpdate(
      { shipmentId },
      {
        $set: {
          awbNumber: awbResponse.response?.data?.awb_code,
          courierName: awbResponse.response?.data?.courier_name,
          courierId: awbResponse.response?.data?.courier_company_id,
          status: 'ready_to_ship',
        },
        $push: {
          statusHistory: { status: 'ready_to_ship', timestamp: new Date() }
        }
      }
    )

    // Update order
    await Order.findOneAndUpdate(
      { orderId: shipment.orderId },
      {
        $set: {
          fulfillmentStatus: 'ready_to_ship',
          'shippingDetails.awbNumber': awbResponse.response?.data?.awb_code,
          'shippingDetails.courierName': awbResponse.response?.data?.courier_name,
        },
        $push: {
          timeline: {
            id: `${Date.now()}`,
            event: 'awb_generated',
            description: `AWB generated: ${awbResponse.response?.data?.awb_code}`,
            createdAt: new Date(),
          }
        }
      }
    )

    return NextResponse.json({
      success: true,
      awb: awbResponse.response?.data?.awb_code,
      courierName: awbResponse.response?.data?.courier_name,
    })

  } catch (error: any) {
    console.error('Generate AWB error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to generate AWB' },
      { status: 500 }
    )
  }
}
