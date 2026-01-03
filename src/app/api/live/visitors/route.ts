import { NextRequest, NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import LiveSession from '@/models/LiveSession'

export const dynamic = 'force-dynamic'

// GET /api/live/visitors - Get active visitors
export async function GET(request: NextRequest) {
  try {
    await connectDb()
    
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
    
    const visitors = await LiveSession.find({
      lastActiveAt: { $gte: thirtyMinutesAgo }
    })
    .sort({ lastActiveAt: -1 })
    .limit(50)
    .lean()
    
    // Transform for frontend
    const transformedVisitors = visitors.map(v => ({
      id: v.sessionId,
      location: {
        city: v.city || 'Unknown',
        country: v.country || 'Unknown',
        lat: v.latitude || 0,
        lng: v.longitude || 0,
      },
      currentPage: v.currentPage || '/',
      device: v.device || 'desktop',
      duration: Math.floor((Date.now() - new Date(v.startedAt).getTime()) / 1000),
      cartItems: v.cartItems || 0,
      cartValue: v.cartValue || 0,
      status: v.status || 'browsing',
      lastActive: v.lastActiveAt,
      pageViews: v.pageViews || 1,
      referrer: v.referrer,
    }))
    
    return NextResponse.json({ visitors: transformedVisitors })
    
  } catch (error) {
    console.error('Visitors error:', error)
    return NextResponse.json({ error: 'Failed to get visitors' }, { status: 500 })
  }
}
