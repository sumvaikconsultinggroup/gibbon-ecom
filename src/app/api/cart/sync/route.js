import CartNotification from '@/models/CartNotification'
import mongoose from 'mongoose'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import User from '@/models/User'

const JWT_SECRET = process.env.JWT_SECRET || 'gibbon-user-secret-key-change-in-production'

export async function POST(req) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('user_token')?.value
    
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    
    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userId = decoded.userId
    const body = await req.json()
    const items = body?.items || []

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI)
    }

    // Get user info from database
    const user = await User.findById(userId)
    const email = user?.email || ''
    const userName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
    const phoneNumber = user?.phone || ''

    const products = items.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      imageUrl: item.imageUrl || '',
      handle: item.handle || '',
      variant: item.variant || null   
    }))

    await CartNotification.findOneAndUpdate(
      { userId },
      {
        userId,
        email,
        userName,
        phoneNumber,
        products,
        isActive: true,
        isSent: false
      },
      { upsert: true, new: true }
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Sync cart error:', err)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
