import { NextRequest, NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import LiveEvent from '@/models/LiveEvent'

export const dynamic = 'force-dynamic'

// GET /api/live/events - Get recent events
export async function GET(request: NextRequest) {
  try {
    await connectDb()
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const types = searchParams.get('types')?.split(',') || null
    
    const query: any = {}
    if (types && types.length > 0) {
      query.type = { $in: types }
    }
    
    const events = await LiveEvent.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean()
    
    // Transform for frontend
    const transformedEvents = events.map(e => ({
      id: e._id?.toString() || e.sessionId + e.timestamp,
      type: e.type,
      visitor: e.city || 'Unknown',
      data: e.data || {},
      timestamp: e.timestamp,
    }))
    
    return NextResponse.json({ events: transformedEvents })
    
  } catch (error) {
    console.error('Events error:', error)
    return NextResponse.json({ error: 'Failed to get events' }, { status: 500 })
  }
}
