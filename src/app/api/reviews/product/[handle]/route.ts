import { NextRequest, NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import Review from '@/models/Review'

interface RouteParams {
  params: Promise<{ handle: string }>
}

// GET - Get approved reviews for a product (Public API)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { handle } = await params
    await connectDb()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    const skip = (page - 1) * limit
    
    // Build sort
    const sort: any = {}
    if (sortBy === 'helpful') {
      sort.helpfulCount = -1
    } else {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1
    }
    
    // Fetch only approved reviews
    const [reviews, total] = await Promise.all([
      Review.find({ productHandle: handle, status: 'approved' })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({ productHandle: handle, status: 'approved' })
    ])
    
    // Calculate rating stats
    const stats = await Review.aggregate([
      { $match: { productHandle: handle, status: 'approved' } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          verified: { $sum: { $cond: ['$isVerifiedPurchase', 1, 0] } },
          fiveStar: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          fourStar: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          threeStar: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          twoStar: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          oneStar: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
        }
      }
    ])
    
    const ratingStats = stats[0] || {
      avgRating: 0,
      totalReviews: 0,
      verified: 0,
      fiveStar: 0,
      fourStar: 0,
      threeStar: 0,
      twoStar: 0,
      oneStar: 0
    }
    
    // Serialize reviews (remove sensitive fields)
    const serializedReviews = reviews.map((r: any) => ({
      _id: r._id.toString(),
      customerName: r.customerName,
      rating: r.rating,
      title: r.title,
      content: r.content,
      images: r.images || [],
      isVerifiedPurchase: r.isVerifiedPurchase,
      helpfulCount: r.helpfulCount || 0,
      createdAt: r.createdAt?.toISOString()
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
      stats: {
        avgRating: Math.round((ratingStats.avgRating || 0) * 10) / 10,
        totalReviews: ratingStats.totalReviews,
        verifiedCount: ratingStats.verified,
        distribution: [
          { star: 5, count: ratingStats.fiveStar },
          { star: 4, count: ratingStats.fourStar },
          { star: 3, count: ratingStats.threeStar },
          { star: 2, count: ratingStats.twoStar },
          { star: 1, count: ratingStats.oneStar }
        ]
      }
    })
  } catch (error: any) {
    console.error('Error fetching product reviews:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
