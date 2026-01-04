import { NextRequest, NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import Review from '@/models/Review'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST - Vote a review as helpful
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    await connectDb()
    
    // Get voter identifier (could be user ID or IP)
    const body = await request.json()
    const voterId = body.voterId || request.headers.get('x-forwarded-for') || 'anonymous'
    
    const review = await Review.findById(id)
    
    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      )
    }
    
    // Check if already voted
    if (review.helpfulVotes.includes(voterId)) {
      return NextResponse.json(
        { success: false, error: 'You have already marked this review as helpful' },
        { status: 400 }
      )
    }
    
    // Add vote
    review.helpfulVotes.push(voterId)
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
