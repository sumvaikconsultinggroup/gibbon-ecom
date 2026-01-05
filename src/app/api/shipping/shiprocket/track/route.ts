import { NextRequest, NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import PaymentSettings from '@/models/PaymentSettings'
import Shipment from '@/models/Shipment'

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

// GET /api/shipping/shiprocket/track?awb=xxx or ?shipmentId=xxx
export async function GET(request: NextRequest) {
  try {
    await connectDb()
    
    const { searchParams } = new URL(request.url)
    const awb = searchParams.get('awb')
    const shipmentId = searchParams.get('shipmentId')

    if (!awb && !shipmentId) {
      return NextResponse.json(
        { success: false, message: 'AWB or Shipment ID is required' },
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

    let trackingAwb = awb

    // If shipmentId provided, get AWB from shipment
    if (!trackingAwb && shipmentId) {
      const shipment = await Shipment.findOne({ shipmentId })
      if (!shipment?.awbNumber) {
        return NextResponse.json(
          { success: false, message: 'AWB not found for this shipment' },
          { status: 404 }
        )
      }
      trackingAwb = shipment.awbNumber
    }

    // Initialize Shiprocket API
    const shiprocket = new ShiprocketAPI(
      settings.shiprocket.email,
      settings.shiprocket.password
    )

    // Get tracking details
    const trackingResponse = await shiprocket.request(`/courier/track/awb/${trackingAwb}`)

    // Update shipment with latest tracking info
    if (shipmentId) {
      const trackingData = trackingResponse.tracking_data?.shipment_track?.[0]
      
      await Shipment.findOneAndUpdate(
        { shipmentId },
        {
          $set: {
            lastTrackedAt: new Date(),
            status: mapShiprocketStatus(trackingData?.current_status),
            trackingUrl: trackingResponse.tracking_data?.track_url,
          },
          $push: {
            trackingHistory: {
              timestamp: new Date(),
              status: trackingData?.current_status,
              description: trackingData?.current_status_description,
              location: trackingData?.current_location,
            }
          }
        }
      )
    }

    return NextResponse.json({
      success: true,
      tracking: trackingResponse.tracking_data,
    })

  } catch (error: any) {
    console.error('Track shipment error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to track shipment' },
      { status: 500 }
    )
  }
}

// Map Shiprocket status to our status
function mapShiprocketStatus(shiprocketStatus: string): string {
  const statusMap: Record<string, string> = {
    'PENDING': 'pending',
    'NEW': 'processing',
    'READY TO SHIP': 'ready_to_ship',
    'PICKUP SCHEDULED': 'ready_to_ship',
    'PICKED UP': 'picked_up',
    'IN TRANSIT': 'in_transit',
    'OUT FOR DELIVERY': 'out_for_delivery',
    'DELIVERED': 'delivered',
    'CANCELLED': 'cancelled',
    'RTO INITIATED': 'returned',
    'RTO DELIVERED': 'returned',
    'UNDELIVERED': 'failed',
  }
  return statusMap[shiprocketStatus?.toUpperCase()] || 'pending'
}
