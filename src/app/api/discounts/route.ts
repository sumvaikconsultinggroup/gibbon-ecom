import connectDb from '@/lib/mongodb'
import PromoCode from '@/models/PromoCode'
import { NextResponse } from 'next/server'

// GET all discounts
export async function GET() {
  try {
    await connectDb()
    const discounts = await PromoCode.find({}).sort({ createdAt: -1 }).lean()
    
    // Remove _id for serialization
    const cleanedDiscounts = discounts.map(d => ({
      ...d,
      _id: d._id?.toString(),
    }))
    
    return NextResponse.json({ success: true, discounts: cleanedDiscounts })
  } catch (error) {
    console.error('Error fetching discounts:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch discounts' }, { status: 500 })
  }
}

// POST create new discount
export async function POST(request: Request) {
  try {
    await connectDb()
    const body = await request.json()
    
    const { code, discountType, discountValue, minOrderAmount, usageLimit, expiresAt, isActive, appliesTo, productIds, categoryNames } = body
    
    // Check if code already exists
    const existing = await PromoCode.findOne({ code: code.toUpperCase() })
    if (existing) {
      return NextResponse.json({ success: false, message: 'Discount code already exists' }, { status: 400 })
    }
    
    const discount = await PromoCode.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minOrderAmount: minOrderAmount || 0,
      usageLimit,
      usageCount: 0,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      isActive: isActive ?? true,
      appliesTo: appliesTo || 'all',
      productIds,
      categoryNames,
    })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Discount created successfully',
      discount: { ...discount.toObject(), _id: discount._id.toString() }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating discount:', error)
    return NextResponse.json({ success: false, message: 'Failed to create discount' }, { status: 500 })
  }
}
