import CartNotification from '@/models/CartNotification'
import mongoose from 'mongoose'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'gibbon-user-secret-key-change-in-production'

export async function PATCH(req) {
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

    const { action, item } = await req.json()
    const userId = decoded.userId

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI)
    }

    // Remove product from cart
    if (action === 'remove') {
      await CartNotification.updateOne(
        { userId },
        { $pull: { products: { productId: item.productId } } }
      )

      // Check if cart is empty now
      const updatedCart = await CartNotification.findOne({ userId })

      if (!updatedCart || updatedCart.products.length === 0) {
        // Delete entire abandoned cart document
        await CartNotification.deleteOne({ userId })
      }
    }

    // Update quantity
    if (action === 'updateQty') {
      await CartNotification.updateOne(
        { userId, 'products.productId': item.productId },
        { $set: { 'products.$.quantity': item.quantity } }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Cart mutation failed:', err)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
