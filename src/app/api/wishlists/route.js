import { NextResponse } from 'next/server'
import { connectToDB } from '@/utils/db'
import User from '../../../models/User'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'gibbon-user-secret-key-change-in-production'

async function getUserFromToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get('user_token')?.value
  
  if (!token) return null
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded
  } catch {
    return null
  }
}

export async function GET() {
  try {
    const authUser = await getUserFromToken()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDB()

    const user = await User.findById(authUser.userId)

    if (!user) {
      // If user doesn't exist in our DB, they have no wishlist
      return NextResponse.json({ wishlist: [] })
    }

    const wishlist = user.wishlist || []

    return NextResponse.json({ wishlist })
  } catch (error) {
    console.error('Error fetching wishlist:', error)
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const authUser = await getUserFromToken()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDB()

    const { productId } = await request.json()

    console.log('Adding to wishlist:', { productId })

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Create wishlist item with just productId (matching LikeButton expectation)
    const wishlistItem = { productId }

    const updatedUser = await User.findByIdAndUpdate(
      authUser.userId,
      {
        $addToSet: { wishlist: wishlistItem },
      },
      { new: true }
    )

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Product added to wishlist',
      wishlist: updatedUser.wishlist 
    })
  } catch (error) {
    console.error('Error adding to wishlist:', error)
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const authUser = await getUserFromToken()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDB()

    const { productId } = await request.json()

    console.log('Removing from wishlist:', { productId })

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    const updatedUser = await User.findByIdAndUpdate(
      authUser.userId,
      { $pull: { wishlist: { productId: productId } } },
      { new: true }
    )

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Product removed from wishlist',
      wishlist: updatedUser.wishlist || [] 
    })
  } catch (error) {
    console.error('Error removing from wishlist:', error)
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 })
  }
}