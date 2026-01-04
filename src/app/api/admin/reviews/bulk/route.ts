import { NextRequest, NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import Review from '@/models/Review'

// Bulk actions for reviews
export async function POST(request: NextRequest) {
  try {
    await connectDb()
    
    const body = await request.json()
    const { action, reviewIds } = body
    
    if (!action || !reviewIds || !Array.isArray(reviewIds) || reviewIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Action and review IDs are required' },
        { status: 400 }
      )
    }
    
    let result
    
    switch (action) {
      case 'approve':
        result = await Review.updateMany(
          { _id: { $in: reviewIds } },
          {
            $set: {
              status: 'approved',
              reviewedBy: 'Admin',
              reviewedAt: new Date()
            }
          }
        )
        break
        
      case 'reject':
        result = await Review.updateMany(
          { _id: { $in: reviewIds } },
          {
            $set: {
              status: 'rejected',
              reviewedBy: 'Admin',
              reviewedAt: new Date()
            }
          }
        )
        break
        
      case 'delete':
        result = await Review.deleteMany({ _id: { $in: reviewIds } })
        break
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
    
    return NextResponse.json({
      success: true,
      message: `${action} completed for ${result.modifiedCount || result.deletedCount} reviews`
    })
  } catch (error: any) {
    console.error('Error in bulk action:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
