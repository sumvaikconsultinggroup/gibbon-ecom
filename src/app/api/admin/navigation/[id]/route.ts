import { NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import NavigationItem from '@/models/NavigationItem'
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

// GET - Fetch single navigation item
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb()
    const { id } = await params
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID format' },
        { status: 400 }
      )
    }
    
    const item = await NavigationItem.findById(id)
      .populate('featuredProducts', 'title handle images variants')
      .lean()
    
    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Navigation item not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: {
        ...item,
        _id: (item as any)._id.toString(),
        parent: (item as any).parent?.toString() || null
      }
    })
  } catch (error: any) {
    console.error('Error fetching navigation item:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch navigation item' },
      { status: 500 }
    )
  }
}

// PUT - Update navigation item
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
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID format' },
        { status: 400 }
      )
    }
    
    const existingItem = await NavigationItem.findById(id)
    if (!existingItem) {
      return NextResponse.json(
        { success: false, error: 'Navigation item not found' },
        { status: 404 }
      )
    }
    
    // Update fields
    const updateData: any = {}
    const allowedFields = [
      'name', 'href', 'order', 'isActive', 'type', 'parent', 'icon', 'badge',
      'badgeColor', 'description', 'image', 'showInHeader', 'showInFooter',
      'showInMobile', 'openInNewTab', 'cssClass', 'featuredProducts'
    ]
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }
    
    // Update slug if name changed
    if (body.name && body.name !== existingItem.name) {
      const newSlug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      const existingSlug = await NavigationItem.findOne({ slug: newSlug, _id: { $ne: id } })
      updateData.slug = existingSlug ? `${newSlug}-${Date.now()}` : newSlug
    }
    
    const updatedItem = await NavigationItem.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('featuredProducts', 'title handle images variants')
    
    return NextResponse.json({
      success: true,
      data: {
        ...updatedItem!.toObject(),
        _id: updatedItem!._id.toString(),
        parent: updatedItem!.parent?.toString() || null
      }
    })
  } catch (error: any) {
    console.error('Error updating navigation item:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update navigation item' },
      { status: 500 }
    )
  }
}

// DELETE - Delete navigation item and its children
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
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID format' },
        { status: 400 }
      )
    }
    
    const item = await NavigationItem.findById(id)
    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Navigation item not found' },
        { status: 404 }
      )
    }
    
    // Delete all children recursively
    const deleteChildren = async (parentId: string) => {
      const children = await NavigationItem.find({ parent: parentId })
      for (const child of children) {
        await deleteChildren(child._id.toString())
        await NavigationItem.findByIdAndDelete(child._id)
      }
    }
    
    await deleteChildren(id)
    await NavigationItem.findByIdAndDelete(id)
    
    return NextResponse.json({
      success: true,
      message: 'Navigation item and its children deleted successfully'
    })
  } catch (error: any) {
    console.error('Error deleting navigation item:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete navigation item' },
      { status: 500 }
    )
  }
}
