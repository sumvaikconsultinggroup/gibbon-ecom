import connectDb from '@/lib/mongodb'
import PromoCode from '@/models/PromoCode'
import { NextResponse } from 'next/server'
import mongoose from 'mongoose'

// GET single discount
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDb()
    const discount = await PromoCode.findById(params.id).lean()
    
    if (!discount) {
      return NextResponse.json({ success: false, message: 'Discount not found' }, { status: 404 })
    }
    
    return NextResponse.json({ 
      success: true, 
      discount: { ...discount, _id: discount._id?.toString() } 
    })
  } catch (error) {
    console.error('Error fetching discount:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch discount' }, { status: 500 })
  }
}

// PUT update discount
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDb()
    const body = await request.json()
    
    const { code, discountType, discountValue, minOrderAmount, usageLimit, expiresAt, isActive, appliesTo, productIds, categoryNames } = body
    
    // Check if new code conflicts with existing (excluding current)
    if (code) {
      const existing = await PromoCode.findOne({ 
        code: code.toUpperCase(), 
        _id: { $ne: params.id } 
      })
      if (existing) {
        return NextResponse.json({ success: false, message: 'Discount code already exists' }, { status: 400 })
      }
    }
    
    const updateData: any = {}
    if (code) updateData.code = code.toUpperCase()
    if (discountType) updateData.discountType = discountType
    if (discountValue !== undefined) updateData.discountValue = discountValue
    if (minOrderAmount !== undefined) updateData.minOrderAmount = minOrderAmount
    if (usageLimit !== undefined) updateData.usageLimit = usageLimit
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null
    if (isActive !== undefined) updateData.isActive = isActive
    if (appliesTo) updateData.appliesTo = appliesTo
    if (productIds) updateData.productIds = productIds
    if (categoryNames) updateData.categoryNames = categoryNames
    
    const discount = await PromoCode.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true }
    ).lean()
    
    if (!discount) {
      return NextResponse.json({ success: false, message: 'Discount not found' }, { status: 404 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Discount updated successfully',
      discount: { ...discount, _id: discount._id?.toString() }
    })
  } catch (error) {
    console.error('Error updating discount:', error)
    return NextResponse.json({ success: false, message: 'Failed to update discount' }, { status: 500 })
  }
}

// DELETE discount
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDb()
    const discount = await PromoCode.findByIdAndDelete(params.id)
    
    if (!discount) {
      return NextResponse.json({ success: false, message: 'Discount not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, message: 'Discount deleted successfully' })
  } catch (error) {
    console.error('Error deleting discount:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete discount' }, { status: 500 })
  }
}
