import { NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import Order from '@/models/Order'
import Product from '@/models/product.model'
import User from '@/models/User'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, format, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, parseISO } from 'date-fns'

const JWT_SECRET = process.env.JWT_SECRET || 'gibbon-admin-secret-ad5f7eaf7fc29d4d02762686eecdabc3'

async function verifyAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  if (!token) return null
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

function getDateRange(period: string, startDate?: string, endDate?: string) {
  const now = new Date()
  
  switch (period) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) }
    case 'yesterday':
      const yesterday = subDays(now, 1)
      return { start: startOfDay(yesterday), end: endOfDay(yesterday) }
    case 'last7days':
      return { start: startOfDay(subDays(now, 6)), end: endOfDay(now) }
    case 'last30days':
      return { start: startOfDay(subDays(now, 29)), end: endOfDay(now) }
    case 'thisMonth':
      return { start: startOfMonth(now), end: endOfDay(now) }
    case 'lastMonth':
      const lastMonth = subDays(startOfMonth(now), 1)
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) }
    case 'thisYear':
      return { start: startOfYear(now), end: endOfDay(now) }
    case 'custom':
      if (startDate && endDate) {
        return { start: startOfDay(parseISO(startDate)), end: endOfDay(parseISO(endDate)) }
      }
      return { start: startOfDay(subDays(now, 29)), end: endOfDay(now) }
    default:
      return { start: startOfDay(subDays(now, 29)), end: endOfDay(now) }
  }
}

function getPreviousPeriodRange(start: Date, end: Date) {
  const duration = end.getTime() - start.getTime()
  return {
    start: new Date(start.getTime() - duration),
    end: new Date(end.getTime() - duration)
  }
}

export async function GET(request: Request) {
  try {
    const admin = await verifyAdmin()
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectDb()
    
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'last30days'
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined
    
    const { start, end } = getDateRange(period, startDate, endDate)
    const previousPeriod = getPreviousPeriodRange(start, end)
    
    // Current period orders
    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end }
    }).lean()
    
    // Previous period orders for comparison
    const previousOrders = await Order.find({
      createdAt: { $gte: previousPeriod.start, $lte: previousPeriod.end }
    }).lean()
    
    // Calculate metrics
    const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || o.total || 0), 0)
    const previousRevenue = previousOrders.reduce((sum: number, o: any) => sum + (o.totalAmount || o.total || 0), 0)
    
    const totalOrders = orders.length
    const previousOrderCount = previousOrders.length
    
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const previousAvgOrderValue = previousOrderCount > 0 ? previousRevenue / previousOrderCount : 0
    
    // Order status breakdown
    const statusBreakdown: Record<string, number> = {}
    orders.forEach((o: any) => {
      const status = o.status || 'pending'
      statusBreakdown[status] = (statusBreakdown[status] || 0) + 1
    })
    
    // Revenue by day/week/month for chart
    const revenueByDate: Record<string, { date: string; revenue: number; orders: number }> = {}
    
    // Determine grouping based on date range
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    let dateFormat = 'MMM dd'
    let intervals: Date[] = []
    
    if (daysDiff <= 1) {
      // Hourly for single day
      for (let i = 0; i < 24; i++) {
        const hour = `${i.toString().padStart(2, '0')}:00`
        revenueByDate[hour] = { date: hour, revenue: 0, orders: 0 }
      }
      orders.forEach((o: any) => {
        const hour = format(new Date(o.createdAt), 'HH') + ':00'
        if (revenueByDate[hour]) {
          revenueByDate[hour].revenue += o.totalAmount || o.total || 0
          revenueByDate[hour].orders += 1
        }
      })
    } else if (daysDiff <= 31) {
      // Daily
      intervals = eachDayOfInterval({ start, end })
      intervals.forEach(date => {
        const key = format(date, 'MMM dd')
        revenueByDate[key] = { date: key, revenue: 0, orders: 0 }
      })
      orders.forEach((o: any) => {
        const key = format(new Date(o.createdAt), 'MMM dd')
        if (revenueByDate[key]) {
          revenueByDate[key].revenue += o.totalAmount || o.total || 0
          revenueByDate[key].orders += 1
        }
      })
    } else if (daysDiff <= 90) {
      // Weekly
      intervals = eachWeekOfInterval({ start, end })
      intervals.forEach(date => {
        const key = 'Week ' + format(date, 'w')
        revenueByDate[key] = { date: key, revenue: 0, orders: 0 }
      })
      orders.forEach((o: any) => {
        const key = 'Week ' + format(new Date(o.createdAt), 'w')
        if (revenueByDate[key]) {
          revenueByDate[key].revenue += o.totalAmount || o.total || 0
          revenueByDate[key].orders += 1
        }
      })
    } else {
      // Monthly
      intervals = eachMonthOfInterval({ start, end })
      intervals.forEach(date => {
        const key = format(date, 'MMM yyyy')
        revenueByDate[key] = { date: key, revenue: 0, orders: 0 }
      })
      orders.forEach((o: any) => {
        const key = format(new Date(o.createdAt), 'MMM yyyy')
        if (revenueByDate[key]) {
          revenueByDate[key].revenue += o.totalAmount || o.total || 0
          revenueByDate[key].orders += 1
        }
      })
    }
    
    // Top products by revenue
    const productRevenue: Record<string, { name: string; revenue: number; quantity: number }> = {}
    orders.forEach((o: any) => {
      (o.items || o.lineItems || []).forEach((item: any) => {
        const id = item.productId?.toString() || item.product?.toString() || 'unknown'
        const name = item.title || item.name || item.productTitle || 'Unknown Product'
        if (!productRevenue[id]) {
          productRevenue[id] = { name, revenue: 0, quantity: 0 }
        }
        productRevenue[id].revenue += (item.price || 0) * (item.quantity || 1)
        productRevenue[id].quantity += item.quantity || 1
      })
    })
    
    const topProducts = Object.values(productRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
    
    // Payment method breakdown
    const paymentMethods: Record<string, number> = {}
    orders.forEach((o: any) => {
      const method = o.paymentMethod || o.payment?.method || 'unknown'
      paymentMethods[method] = (paymentMethods[method] || 0) + (o.totalAmount || o.total || 0)
    })
    
    // Customer stats
    const [totalCustomers, newCustomersCount] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      User.countDocuments({ 
        role: { $ne: 'admin' },
        createdAt: { $gte: start, $lte: end }
      })
    ])
    
    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
    
    // Low stock products
    const lowStockProducts = await Product.find({
      $or: [
        { 'variants.inventory': { $lte: 10, $gte: 0 } },
        { inventory: { $lte: 10, $gte: 0 } }
      ]
    })
      .limit(10)
      .select('title handle variants inventory images')
      .lean()
    
    // Calculate trends (percentage change from previous period)
    const revenueTrend = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0
    const ordersTrend = previousOrderCount > 0 ? ((totalOrders - previousOrderCount) / previousOrderCount) * 100 : 0
    const aovTrend = previousAvgOrderValue > 0 ? ((avgOrderValue - previousAvgOrderValue) / previousAvgOrderValue) * 100 : 0
    
    return NextResponse.json({
      success: true,
      data: {
        period: { start: start.toISOString(), end: end.toISOString() },
        summary: {
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalOrders,
          avgOrderValue: Math.round(avgOrderValue * 100) / 100,
          totalCustomers,
          newCustomers: newCustomersCount,
          trends: {
            revenue: Math.round(revenueTrend * 10) / 10,
            orders: Math.round(ordersTrend * 10) / 10,
            aov: Math.round(aovTrend * 10) / 10
          }
        },
        charts: {
          revenueOverTime: Object.values(revenueByDate),
          orderStatus: Object.entries(statusBreakdown).map(([status, count]) => ({ status, count })),
          topProducts,
          paymentMethods: Object.entries(paymentMethods).map(([method, revenue]) => ({ method, revenue }))
        },
        recentOrders: recentOrders.map((o: any) => ({
          _id: o._id.toString(),
          orderNumber: o.orderNumber || o._id.toString().slice(-8),
          customer: o.customer?.name || o.shippingAddress?.name || 'Guest',
          email: o.customer?.email || o.email || '',
          total: o.totalAmount || o.total || 0,
          status: o.status || 'pending',
          paymentStatus: o.paymentStatus || 'pending',
          createdAt: o.createdAt
        })),
        lowStockProducts: lowStockProducts.map((p: any) => ({
          _id: p._id.toString(),
          title: p.title,
          handle: p.handle,
          image: p.images?.[0]?.src,
          inventory: p.variants?.[0]?.inventory ?? p.inventory ?? 0
        }))
      }
    })
  } catch (error: any) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
