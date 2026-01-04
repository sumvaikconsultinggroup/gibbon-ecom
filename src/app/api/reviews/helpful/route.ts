import { NextRequest, NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import Review from '@/models/Review'

// POST - Vote a review as helpful
export async function POST(request: NextRequest) {
  try {
    await connectDb()
    
    const body = await request.json()
    const { reviewId, voterId } = body
    
    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required' },
        { status: 400 }
      )
    }
    
    // Get voter identifier (could be user ID or IP)
    const finalVoterId = voterId || request.headers.get('x-forwarded-for') || 'anonymous'
    
    const review = await Review.findById(reviewId)
    
    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      )
    }
    
    // Check if already voted
    if (review.helpfulVotes.includes(finalVoterId)) {
      return NextResponse.json(
        { success: false, error: 'You have already marked this review as helpful' },
        { status: 400 }
      )
    }
    
    // Add vote
    review.helpfulVotes.push(finalVoterId)
    review.helpfulCount = review.helpfulVotes.length
    await review.save()
    
    return NextResponse.json({
      success: true,
      helpfulCount: review.helpfulCount
    })
  } catch (error: any) {
    console.error('Error voting helpful:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
