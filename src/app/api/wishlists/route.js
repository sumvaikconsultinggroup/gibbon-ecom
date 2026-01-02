import { currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { connectToDB } from '@/utils/db'
import User from '../../../models/User'

export async function GET() {
  try {
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDB()

    const user = await User.findOne({ clerkId: clerkUser.id })

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
    const clerkUser = await currentUser()

    if (!clerkUser) {
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

    const updatedUser = await User.findOneAndUpdate(
      { clerkId: clerkUser.id },
      {
        $addToSet: { wishlist: wishlistItem },
        $setOnInsert: {
          clerkId: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress,
          imageUrl: clerkUser.imageUrl,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
        },
      },
      { upsert: true, new: true }
    )

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
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDB()

    const { productId } = await request.json()

    console.log('Removing from wishlist:', { productId })

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    const updatedUser = await User.findOneAndUpdate(
      { clerkId: clerkUser.id },
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