import { NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import HomeSection from '@/models/HomeSection'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

const JWT_SECRET = process.env.JWT_SECRET || 'gibbon-admin-secret-ad5f7eaf7fc29d4d02762686eecdabc3'

async function verifyAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  if (!token) return null
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb()
    const { id } = await params
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 })
    }
    
    const section = await HomeSection.findById(id)
      .populate('products', 'title handle images variants')
      .lean()
    
    if (!section) {
      return NextResponse.json({ success: false, error: 'Section not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: { ...section, _id: (section as any)._id.toString() }
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin()
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    
    await connectDb()
    const { id } = await params
    const body = await request.json()
    
    const section = await HomeSection.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).populate('products', 'title handle images variants')
    
    if (!section) {
      return NextResponse.json({ success: false, error: 'Section not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: { ...section.toObject(), _id: section._id.toString() }
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin()
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    
    await connectDb()
    const { id } = await params
    
    await HomeSection.findByIdAndDelete(id)
    
    return NextResponse.json({ success: true, message: 'Section deleted' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
