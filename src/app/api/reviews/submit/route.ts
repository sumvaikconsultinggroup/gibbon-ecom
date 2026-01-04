import { NextRequest, NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import Review from '@/models/Review'
import Product from '@/models/product.model'
import Order from '@/models/Order'

// POST - Submit a new review (Public - requires approval)
export async function POST(request: NextRequest) {
  try {
    await connectDb()
    
    const body = await request.json()
    const {
      productHandle,
      customerName,
      customerEmail,
      rating,
      title,
      content,
      images
    } = body
    
    // Validate required fields
    if (!productHandle || !customerName || !customerEmail || !rating || !title || !content) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      )
    }
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(customerEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }
    
    // Get product info
    const product = await Product.findOne({ handle: productHandle, isDeleted: false }).lean()
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }
    
    // Check if user already submitted a review for this product
    const existingReview = await Review.findOne({
      productHandle,
      customerEmail: customerEmail.toLowerCase()
    })
    
    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'You have already submitted a review for this product' },
        { status: 400 }
      )
    }
    
    // Check for verified purchase
    let isVerifiedPurchase = false
    let foundOrderId = null
    
    const order = await Order.findOne({
      'customer.email': customerEmail.toLowerCase(),
      'items.productId': (product as any)._id,
      status: { $in: ['delivered', 'shipped', 'confirmed'] }
    }).lean()
    
    if (order) {
      isVerifiedPurchase = true
      foundOrderId = (order as any).orderId
    }
    
    // Create review (pending approval)
    const review = await Review.create({
      productId: (product as any)._id,
      productHandle: (product as any).handle,
      productTitle: (product as any).title,
      customerName: customerName.trim(),
      customerEmail: customerEmail.toLowerCase().trim(),
      rating: parseInt(rating),
      title: title.trim(),
      content: content.trim(),
      images: images || [],
      status: 'pending', // Requires admin approval
      isVerifiedPurchase,
      orderId: foundOrderId,
      source: 'website',
      helpfulCount: 0,
      helpfulVotes: []
    })
    
    return NextResponse.json({
      success: true,
      message: 'Thank you for your review! It will be visible after approval.',
      data: {
        _id: review._id.toString(),
        status: review.status,
        isVerifiedPurchase: review.isVerifiedPurchase
      }
    })
  } catch (error: any) {
    console.error('Error submitting review:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit review. Please try again.' },
      { status: 500 }
    )
  }
}
