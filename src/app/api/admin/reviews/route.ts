import { NextRequest, NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import Review from '@/models/Review'
import Product from '@/models/product.model'
import Order from '@/models/Order'

// GET - List all reviews with filters
export async function GET(request: NextRequest) {
  try {
    await connectDb()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const rating = searchParams.get('rating')
    const productHandle = searchParams.get('product')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    // Build query
    const query: any = {}
    
    if (status && status !== 'all') {
      query.status = status
    }
    
    if (rating && rating !== 'all') {
      query.rating = parseInt(rating)
    }
    
    if (productHandle && productHandle !== 'all') {
      query.productHandle = productHandle
    }
    
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ]
    }
    
    // Build sort
    const sort: any = {}
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1
    
    const skip = (page - 1) * limit
    
    const [reviews, total] = await Promise.all([
      Review.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(query)
    ])
    
    // Get stats
    const [stats] = await Review.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
          avgRating: { $avg: '$rating' },
          verified: { $sum: { $cond: ['$isVerifiedPurchase', 1, 0] } }
        }
      }
    ])
    
    // Get unique products for filter
    const products = await Review.distinct('productHandle')
    const productList = await Product.find(
      { handle: { $in: products } },
      { handle: 1, title: 1, _id: 0 }
    ).lean()
    
    // Serialize
    const serializedReviews = reviews.map((r: any) => ({
      ...r,
      _id: r._id.toString(),
      productId: r.productId.toString(),
      createdAt: r.createdAt?.toISOString(),
      updatedAt: r.updatedAt?.toISOString(),
      reviewedAt: r.reviewedAt?.toISOString()
    }))
    
    return NextResponse.json({
      success: true,
      data: serializedReviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats: stats || { total: 0, approved: 0, pending: 0, rejected: 0, avgRating: 0, verified: 0 },
      products: productList
    })
  } catch (error: any) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - Create a new review (Admin manual creation)
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
      images,
      status,
      isVerifiedPurchase,
      adminNotes
    } = body
    
    // Validate required fields
    if (!productHandle || !customerName || !customerEmail || !rating || !title || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Get product info
    const product = await Product.findOne({ handle: productHandle }).lean()
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }
    
    // Check for verified purchase if requested
    let verifiedPurchase = isVerifiedPurchase || false
    let foundOrderId = null
    
    if (!verifiedPurchase) {
      // Check if customer has purchased this product
      const order = await Order.findOne({
        'customer.email': customerEmail.toLowerCase(),
        'items.productId': (product as any)._id,
        status: { $in: ['delivered', 'shipped', 'confirmed'] }
      }).lean()
      
      if (order) {
        verifiedPurchase = true
        foundOrderId = (order as any).orderId
      }
    }
    
    // Create review
    const review = await Review.create({
      productId: (product as any)._id,
      productHandle: (product as any).handle,
      productTitle: (product as any).title,
      customerName,
      customerEmail: customerEmail.toLowerCase(),
      rating,
      title,
      content,
      images: images || [],
      status: status || 'approved', // Admin-created reviews default to approved
      isVerifiedPurchase: verifiedPurchase,
      orderId: foundOrderId,
      source: 'manual',
      reviewedBy: 'Admin',
      reviewedAt: new Date()
    })
    
    return NextResponse.json({
      success: true,
      data: {
        ...review.toObject(),
        _id: review._id.toString(),
        productId: review.productId.toString()
      }
    })
  } catch (error: any) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
