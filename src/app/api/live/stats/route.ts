import { NextRequest, NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import LiveSession from '@/models/LiveSession'
import LiveEvent from '@/models/LiveEvent'
import LiveStats from '@/models/LiveStats'
import Order from '@/models/Order'

export const dynamic = 'force-dynamic'

// GET /api/live/stats - Get real-time statistics
export async function GET(request: NextRequest) {
  try {
    await connectDb()
    
    const now = new Date()
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000)
    const todayStart = new Date(now.setHours(0, 0, 0, 0))
    
    // Get active sessions (last 30 minutes)
    const activeSessions = await LiveSession.find({
      lastActiveAt: { $gte: thirtyMinutesAgo }
    }).sort({ lastActiveAt: -1 })
    
    // Calculate stats
    const activeVisitors = activeSessions.length
    const activeCarts = activeSessions.filter(s => s.cartItems > 0).length
    const activeCartValue = activeSessions.reduce((sum, s) => sum + (s.cartValue || 0), 0)
    const inCheckout = activeSessions.filter(s => s.status === 'checkout').length
    
    // Get today's stats
    const today = new Date().toISOString().split('T')[0]
    let dailyStats = await LiveStats.findOne({ date: today })
    
    if (!dailyStats) {
      dailyStats = {
        ordersCount: 0,
        revenue: 0,
        cartsAbandoned: 0,
        abandonedValue: 0,
        totalVisitors: 0,
      }
    }
    
    // Get today's actual orders from Order collection
    const todayOrders = await Order.find({
      createdAt: { $gte: todayStart }
    })
    
    const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0)
    const todayOrderCount = todayOrders.length
    
    // Get yesterday's stats for comparison
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const yesterdayStats = await LiveStats.findOne({ date: yesterday })
    
    // Calculate conversion rate
    const totalVisitorsToday = dailyStats.totalVisitors || activeVisitors
    const conversionRate = totalVisitorsToday > 0 
      ? ((todayOrderCount / totalVisitorsToday) * 100).toFixed(1) 
      : '0'
    
    // Get abandoned carts (sessions with items that ended without purchase)
    const abandonedToday = await LiveSession.countDocuments({
      status: 'abandoned',
      updatedAt: { $gte: todayStart }
    })
    
    // Device breakdown of active sessions
    const deviceBreakdown = {
      desktop: activeSessions.filter(s => s.device === 'desktop').length,
      mobile: activeSessions.filter(s => s.device === 'mobile').length,
      tablet: activeSessions.filter(s => s.device === 'tablet').length,
    }
    
    // Top cities from active sessions
    const cityCount: Record<string, number> = {}
    activeSessions.forEach(s => {
      if (s.city) {
        cityCount[s.city] = (cityCount[s.city] || 0) + 1
      }
    })
    const topCities = Object.entries(cityCount)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
    
    return NextResponse.json({
      // Real-time metrics
      activeVisitors,
      activeCarts,
      activeCartValue,
      inCheckout,
      
      // Today's metrics
      todayRevenue,
      todayOrders: todayOrderCount,
      abandonedCarts: abandonedToday || dailyStats.cartsAbandoned || 0,
      abandonedValue: dailyStats.abandonedValue || 0,
      
      // Conversion
      conversionRate: parseFloat(conversionRate as string),
      
      // Yesterday comparison
      yesterdayRevenue: yesterdayStats?.revenue || 0,
      revenueChange: yesterdayStats?.revenue 
        ? (((todayRevenue - yesterdayStats.revenue) / yesterdayStats.revenue) * 100).toFixed(1)
        : '0',
      
      // Breakdowns
      deviceBreakdown,
      topCities,
      
      // Timestamp
      timestamp: new Date().toISOString(),
    })
    
  } catch (error) {
    console.error('Live stats error:', error)
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 })
  }
}
