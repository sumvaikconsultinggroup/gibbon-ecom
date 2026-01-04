import { NextRequest, NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import StoreSettings from '@/models/StoreSettings'

export const dynamic = 'force-dynamic'

const STORE_ID = 'default'

// GET /api/admin/settings - Get store settings
export async function GET() {
  try {
    await connectDb()
    
    let settings = await StoreSettings.findOne({ storeId: STORE_ID }).lean()
    
    if (!settings) {
      // Create default settings if not exists
      const newSettings = await StoreSettings.create({ storeId: STORE_ID })
      settings = newSettings.toObject()
    }
    
    return NextResponse.json({
      success: true,
      settings: {
        ...settings,
        _id: undefined,
        id: settings._id?.toString(),
      },
    })
  } catch (error: any) {
    console.error('Error fetching store settings:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/settings - Update store settings
export async function PUT(request: NextRequest) {
  try {
    await connectDb()
    
    const body = await request.json()
    
    // Only allow updating specific fields
    const allowedFields = ['storeName', 'storeEmail', 'storePhone', 'storeAddress', 'currency', 'timezone', 'logoUrl']
    const updateData: any = {}
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }
    
    const settings = await StoreSettings.findOneAndUpdate(
      { storeId: STORE_ID },
      { $set: updateData },
      { new: true, upsert: true }
    ).lean()
    
    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      settings: {
        ...settings,
        _id: undefined,
        id: settings?._id?.toString(),
      },
    })
  } catch (error: any) {
    console.error('Error updating store settings:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update settings' },
      { status: 500 }
    )
  }
}
