import { NextRequest, NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import LiveSession from '@/models/LiveSession'
import LiveEvent from '@/models/LiveEvent'
import LiveStats from '@/models/LiveStats'
import { getGeoFromIP } from '@/lib/geolocation'

// Detect device from user agent
function detectDevice(userAgent: string): 'desktop' | 'mobile' | 'tablet' {
  const ua = userAgent.toLowerCase()
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet'
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile'
  return 'desktop'
}

// Get browser from user agent
function detectBrowser(userAgent: string): string {
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Chrome')) return 'Chrome'
  if (userAgent.includes('Safari')) return 'Safari'
  if (userAgent.includes('Edge')) return 'Edge'
  if (userAgent.includes('Opera')) return 'Opera'
  return 'Other'
}

// POST /api/track - Track events from frontend
export async function POST(request: NextRequest) {
  try {
    await connectDb()
    
    const body = await request.json()
    const { sessionId, visitorId, type, data } = body
    
    if (!sessionId || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const userAgent = request.headers.get('user-agent') || ''
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    // Get or create session
    let session = await LiveSession.findOne({ sessionId })
    
    if (!session) {
      // Get geolocation from IP
      const geo = await getGeoFromIP(ip)
      
      // Create new session
      session = new LiveSession({
        sessionId,
        visitorId,
        ip,
        device: detectDevice(userAgent),
        browser: detectBrowser(userAgent),
        userAgent,
        currentPage: data?.page || '/',
        referrer: data?.referrer,
        utmSource: data?.utmSource,
        utmMedium: data?.utmMedium,
        utmCampaign: data?.utmCampaign,
        // Geolocation data
        city: geo.city,
        region: geo.region,
        country: geo.country,
        latitude: geo.lat,
        longitude: geo.lng,
      })
      await session.save()
      
      // Update daily stats
      const today = new Date().toISOString().split('T')[0]
      await LiveStats.findOneAndUpdate(
        { date: today },
        { 
          $inc: { 
            totalVisitors: 1,
            [`devices.${session.device}`]: 1,
          } 
        },
        { upsert: true }
      )
    }
    
    // Update session based on event type
    const updateData: any = {
      lastActiveAt: new Date(),
      currentPage: data?.page || session.currentPage,
    }
    
    switch (type) {
      case 'page_view':
        updateData.$inc = { pageViews: 1 }
        break
        
      case 'add_to_cart':
        updateData.status = 'cart'
        updateData.cartItems = (session.cartItems || 0) + (data?.quantity || 1)
        updateData.cartValue = (session.cartValue || 0) + (data?.productPrice || 0) * (data?.quantity || 1)
        if (data?.productId) {
          updateData.$push = {
            cartProducts: {
              productId: data.productId,
              name: data.productName,
              price: data.productPrice,
              quantity: data.quantity || 1,
            }
          }
        }
        break
        
      case 'remove_from_cart':
        updateData.cartItems = Math.max(0, (session.cartItems || 0) - (data?.quantity || 1))
        updateData.cartValue = Math.max(0, (session.cartValue || 0) - (data?.productPrice || 0) * (data?.quantity || 1))
        if (updateData.cartItems === 0) {
          updateData.status = 'browsing'
          updateData.cartProducts = []
        }
        break
        
      case 'checkout_start':
        updateData.status = 'checkout'
        break
        
      case 'purchase':
        updateData.status = 'purchased'
        updateData.cartItems = 0
        updateData.cartValue = 0
        updateData.cartProducts = []
        
        // Update daily stats for conversion
        const todayPurchase = new Date().toISOString().split('T')[0]
        await LiveStats.findOneAndUpdate(
          { date: todayPurchase },
          { 
            $inc: { 
              ordersCount: 1,
              revenue: data?.orderTotal || 0,
              checkoutsCompleted: 1,
            } 
          },
          { upsert: true }
        )
        break
        
      case 'cart_abandon':
        updateData.status = 'abandoned'
        const todayAbandon = new Date().toISOString().split('T')[0]
        await LiveStats.findOneAndUpdate(
          { date: todayAbandon },
          { 
            $inc: { 
              cartsAbandoned: 1,
              abandonedValue: session.cartValue || 0,
            } 
          },
          { upsert: true }
        )
        break
    }
    
    // Update session
    if (updateData.$inc || updateData.$push) {
      const { $inc, $push, ...setData } = updateData
      await LiveSession.updateOne(
        { sessionId },
        { $set: setData, ...(($inc && { $inc }) || {}), ...(($push && { $push }) || {}) }
      )
    } else {
      await LiveSession.updateOne({ sessionId }, { $set: updateData })
    }
    
    // Create event record
    const event = new LiveEvent({
      sessionId,
      visitorId,
      type,
      data,
      city: session.city,
      country: session.country,
    })
    await event.save()
    
    return NextResponse.json({ success: true, sessionId })
    
  } catch (error) {
    console.error('Track error:', error)
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 })
  }
}
