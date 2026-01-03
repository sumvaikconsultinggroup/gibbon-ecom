import { NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import HomeBanner from '@/models/HomeBanner'
import HomeSection from '@/models/HomeSection'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

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

// Reorder banners
export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin()
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    
    await connectDb()
    const { type, items } = await request.json()
    
    if (!Array.isArray(items)) {
      return NextResponse.json({ success: false, error: 'Items must be an array' }, { status: 400 })
    }
    
    const Model = type === 'banners' ? HomeBanner : HomeSection
    
    const updatePromises = items.map((item: { id: string, order: number }) => 
      Model.findByIdAndUpdate(item.id, { order: item.order })
    )
    
    await Promise.all(updatePromises)
    
    return NextResponse.json({ success: true, message: 'Items reordered' })
  } catch (error: any) {
    console.error('Error reordering:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
