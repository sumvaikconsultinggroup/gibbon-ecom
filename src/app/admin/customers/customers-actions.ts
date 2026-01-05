'use server'

import connectDb from '@/lib/mongodb'
import User from '@/models/User'
import Order from '@/models/Order'

export interface CustomerData {
  id: string
  name: string
  email: string
  phone?: string
  totalOrders: number
  totalSpent: number
  lastOrder?: string
  createdAt: string
  status: 'active' | 'inactive'
  addresses?: any[]
  walletBalance?: number
}

export interface CustomerStats {
  totalCustomers: number
  activeCustomers: number
  newCustomersThisMonth: number
  averageOrderValue: number
}

// Get all customers with their order stats
export async function getCustomers(params: {
  search?: string
  status?: 'all' | 'active' | 'inactive'
  page?: number
  limit?: number
} = {}): Promise<{
  success: boolean
  customers: CustomerData[]
  stats: CustomerStats
  total: number
}> {
  try {
    await connectDb()
    
    const { search, status = 'all', page = 1, limit = 20 } = params
    
    // Build filter
    const filter: any = { role: 'customer' }
    
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { billing_fullname: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ]
    }
    
    // Get total count
    const totalCount = await User.countDocuments(filter)
    
    // Get customers with pagination
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
    
    // Get order stats for each customer
    const customerEmails = users.map(u => u.email).filter(Boolean)
    const orderStats = await Order.aggregate([
      { $match: { 'customer.email': { $in: customerEmails } } },
      {
        $group: {
          _id: '$customer.email',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totals.total' },
          lastOrder: { $max: '$createdAt' }
        }
      }
    ])
    
    const orderStatsMap = new Map(orderStats.map(s => [s._id, s]))
    
    // Transform to CustomerData
    const customers: CustomerData[] = users.map(user => {
      const stats = orderStatsMap.get(user.email) || { totalOrders: 0, totalSpent: 0, lastOrder: null }
      const name = user.billing_fullname || 
                   [user.firstName, user.lastName].filter(Boolean).join(' ') || 
                   user.email?.split('@')[0] || 
                   'Unknown'
      
      // Consider customer inactive if no orders in 90 days
      const lastOrderDate = stats.lastOrder ? new Date(stats.lastOrder) : null
      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
      const isActive = lastOrderDate ? lastOrderDate > ninetyDaysAgo : false
      
      return {
        id: user._id?.toString() || '',
        name,
        email: user.email || '',
        phone: user.phone || user.billing_phone,
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent || 0,
        lastOrder: stats.lastOrder ? new Date(stats.lastOrder).toISOString().split('T')[0] : undefined,
        createdAt: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : '',
        status: isActive ? 'active' : 'inactive',
        addresses: user.billing_address || [],
        walletBalance: user.wallet?.points || 0,
      }
    })
    
    // Filter by status if needed
    const filteredCustomers = status === 'all' 
      ? customers 
      : customers.filter(c => c.status === status)
    
    // Calculate stats
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const allUsers = await User.find({ role: 'customer' }).lean()
    const activeCount = customers.filter(c => c.status === 'active').length
    const newThisMonth = allUsers.filter(u => new Date(u.createdAt) >= startOfMonth).length
    
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0)
    const totalOrders = customers.reduce((sum, c) => sum + c.totalOrders, 0)
    
    const stats: CustomerStats = {
      totalCustomers: totalCount,
      activeCustomers: activeCount,
      newCustomersThisMonth: newThisMonth,
      averageOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
    }
    
    return {
      success: true,
      customers: filteredCustomers,
      stats,
      total: totalCount,
    }
  } catch (error) {
    console.error('Error fetching customers:', error)
    return {
      success: false,
      customers: [],
      stats: {
        totalCustomers: 0,
        activeCustomers: 0,
        newCustomersThisMonth: 0,
        averageOrderValue: 0,
      },
      total: 0,
    }
  }
}

// Get single customer details
export async function getCustomerDetails(customerId: string): Promise<{
  success: boolean
  customer?: CustomerData & {
    orders: any[]
    wishlist: any[]
    walletTransactions: any[]
  }
}> {
  try {
    await connectDb()
    
    const user = await User.findById(customerId).lean()
    if (!user) {
      return { success: false }
    }
    
    // Get customer's orders
    const orders = await Order.find({ 'customer.email': user.email })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()
    
    const totalSpent = orders.reduce((sum, o) => sum + (o.totals?.total || 0), 0)
    const lastOrder = orders[0]
    
    const name = user.billing_fullname || 
                 [user.firstName, user.lastName].filter(Boolean).join(' ') || 
                 user.email?.split('@')[0] || 
                 'Unknown'
    
    return {
      success: true,
      customer: {
        id: user._id?.toString() || '',
        name,
        email: user.email || '',
        phone: user.phone || user.billing_phone,
        totalOrders: orders.length,
        totalSpent,
        lastOrder: lastOrder?.createdAt ? new Date(lastOrder.createdAt).toISOString().split('T')[0] : undefined,
        createdAt: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : '',
        status: 'active',
        addresses: user.billing_address || [],
        walletBalance: user.wallet?.points || 0,
        orders: orders.map(o => ({
          id: o._id?.toString(),
          orderNumber: o.orderNumber,
          status: o.status,
          total: o.totals?.total || 0,
          createdAt: o.createdAt,
        })),
        wishlist: user.wishlist || [],
        walletTransactions: user.wallet?.transactions || [],
      }
    }
  } catch (error) {
    console.error('Error fetching customer details:', error)
    return { success: false }
  }
}
