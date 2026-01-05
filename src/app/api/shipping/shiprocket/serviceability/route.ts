import { NextRequest, NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import PaymentSettings from '@/models/PaymentSettings'

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

// GET /api/shipping/shiprocket/serviceability?pickup=xxx&delivery=xxx&weight=xxx&cod=0
export async function GET(request: NextRequest) {
  try {
    await connectDb()
    
    const { searchParams } = new URL(request.url)
    const pickup = searchParams.get('pickup')
    const delivery = searchParams.get('delivery')
    const weight = searchParams.get('weight') || '0.5'
    const cod = searchParams.get('cod') || '0'

    if (!pickup || !delivery) {
      return NextResponse.json(
        { success: false, message: 'Pickup and delivery pincodes are required' },
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

    // Initialize Shiprocket API
    const shiprocket = new ShiprocketAPI(
      settings.shiprocket.email,
      settings.shiprocket.password
    )

    // Check serviceability
    const query = new URLSearchParams({
      pickup_postcode: pickup,
      delivery_postcode: delivery,
      weight: weight,
      cod: cod,
    }).toString()

    const serviceabilityResponse = await shiprocket.request(`/courier/serviceability?${query}`)

    // Format available couriers
    const couriers = serviceabilityResponse.data?.available_courier_companies?.map((courier: any) => ({
      id: courier.courier_company_id,
      name: courier.courier_name,
      rate: courier.rate,
      estimatedDays: courier.estimated_delivery_days,
      deliveryDate: courier.etd,
      cod: courier.cod === 1,
      codCharges: courier.cod_charges,
      freightCharge: courier.freight_charge,
      rtoCharges: courier.rto_charges,
    })) || []

    return NextResponse.json({
      success: true,
      serviceable: couriers.length > 0,
      couriers,
      recommendedCourierId: serviceabilityResponse.data?.recommended_courier_company_id,
    })

  } catch (error: any) {
    console.error('Serviceability check error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to check serviceability' },
      { status: 500 }
    )
  }
}
