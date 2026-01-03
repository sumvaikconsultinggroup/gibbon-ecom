import { NextRequest } from 'next/server'
import connectDb from '@/lib/mongodb'
import LiveSession from '@/models/LiveSession'
import LiveEvent from '@/models/LiveEvent'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/live/stream - Server-Sent Events stream for real-time updates
export async function GET(request: NextRequest) {
  await connectDb()
  
  const encoder = new TextEncoder()
  let intervalId: NodeJS.Timeout | null = null
  
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial data
      const sendUpdate = async () => {
        try {
          const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
          
          // Get active visitors
          const visitors = await LiveSession.find({
            lastActiveAt: { $gte: thirtyMinutesAgo }
          }).sort({ lastActiveAt: -1 }).limit(50).lean()
          
          // Get recent events (last 30 seconds)
          const thirtySecondsAgo = new Date(Date.now() - 30 * 1000)
          const recentEvents = await LiveEvent.find({
            timestamp: { $gte: thirtySecondsAgo }
          }).sort({ timestamp: -1 }).limit(10).lean()
          
          // Calculate stats
          const activeVisitors = visitors.length
          const activeCarts = visitors.filter((v: any) => v.cartItems > 0).length
          const activeCartValue = visitors.reduce((sum: number, v: any) => sum + (v.cartValue || 0), 0)
          const inCheckout = visitors.filter((v: any) => v.status === 'checkout').length
          
          const data = {
            type: 'update',
            stats: {
              activeVisitors,
              activeCarts,
              activeCartValue,
              inCheckout,
            },
            visitors: visitors.map((v: any) => ({
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
            })),
            events: recentEvents.map((e: any) => ({
              id: e._id?.toString(),
              type: e.type,
              visitor: e.city || 'Unknown',
              data: e.data || {},
              timestamp: e.timestamp,
            })),
            timestamp: new Date().toISOString(),
          }
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch (error) {
          console.error('SSE update error:', error)
        }
      }
      
      // Send initial update
      await sendUpdate()
      
      // Send updates every 3 seconds
      intervalId = setInterval(sendUpdate, 3000)
      
      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        if (intervalId) {
          clearInterval(intervalId)
        }
        controller.close()
      })
    },
    cancel() {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  })
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
