import CartNotification from '@/models/CartNotification'
import { currentUser } from '@clerk/nextjs/server'
import mongoose from 'mongoose'
import { NextResponse } from 'next/server'

export async function PATCH(req) {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { action, item } = await req.json()
    const userId = clerkUser.id

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
