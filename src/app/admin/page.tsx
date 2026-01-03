'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  ArrowRight,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  RefreshCw,
  Percent,
} from 'lucide-react'

interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  revenueChange: number
  ordersChange: number
}

interface RecentOrder {
  id: string
  customer: string
  email: string
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered'
  date: string
}

interface TopProduct {
  id: string
  name: string
  image: string
  sales: number
  revenue: number
}

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')

  useEffect(() => {
    fetchDashboardData()
  }, [timeRange])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch products count
      const productsRes = await fetch('/api/products')
      let productsData = { total: 0, count: 0, data: [] }
      if (productsRes.ok) {
        const text = await productsRes.text()
        try {
          productsData = JSON.parse(text)
        } catch (e) {
          console.error('Failed to parse products response')
        }
      }

      // Set stats with real product count
      setStats({
        totalRevenue: 124500,
        totalOrders: 48,
        totalCustomers: 156,
        totalProducts: productsData.total || productsData.count || 0,
        revenueChange: 12.5,
        ordersChange: 8.2,
      })

      // Mock recent orders (will be real once Order model is complete)
      setRecentOrders([
        { id: 'ORD-001', customer: 'Rahul Sharma', email: 'rahul@example.com', total: 2499, status: 'delivered', date: '2 hours ago' },
        { id: 'ORD-002', customer: 'Priya Patel', email: 'priya@example.com', total: 4999, status: 'shipped', date: '5 hours ago' },
        { id: 'ORD-003', customer: 'Amit Kumar', email: 'amit@example.com', total: 1499, status: 'processing', date: '1 day ago' },
        { id: 'ORD-004', customer: 'Sneha Gupta', email: 'sneha@example.com', total: 3299, status: 'pending', date: '1 day ago' },
      ])

      // Get top products from API
      const topProductsData = productsData.data?.slice(0, 5) || []
      setTopProducts(topProductsData.map((p: any, i: number) => ({
        id: p._id || p.handle,
        name: p.title,
        image: p.images?.[0]?.src || '/placeholder-images.webp',
        sales: Math.floor(Math.random() * 50) + 10,
        revenue: (p.variants?.[0]?.price || 1499) * (Math.floor(Math.random() * 50) + 10),
      })))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
    setLoading(false)
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: stats ? `₹${stats.totalRevenue.toLocaleString()}` : '-',
      change: stats?.revenueChange || 0,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || '-',
      change: stats?.ordersChange || 0,
      icon: ShoppingBag,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Customers',
      value: stats?.totalCustomers || '-',
      change: 5.3,
      icon: Users,
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Total Products',
      value: stats?.totalProducts || '-',
      change: 0,
      icon: Package,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Dashboard</h1>
          <p className="text-neutral-500">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-800"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 rounded-xl bg-[#1B198F] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#1B198F]/90"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:bg-neutral-800"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">{stat.title}</p>
                <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-white">
                  {loading ? (
                    <span className="inline-block h-9 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                  ) : (
                    stat.value
                  )}
                </p>
                {stat.change !== 0 && (
                  <div className={`mt-2 flex items-center gap-1 text-sm font-medium ${stat.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {Math.abs(stat.change)}% vs last period
                  </div>
                )}
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            {/* Decorative gradient */}
            <div className={`absolute -bottom-10 -right-10 h-32 w-32 rounded-full ${stat.bgColor} opacity-50 blur-2xl transition-all group-hover:opacity-100`} />
          </motion.div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-white shadow-sm dark:bg-neutral-800">
            <div className="flex items-center justify-between border-b border-neutral-200 p-6 dark:border-neutral-700">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Recent Orders</h2>
                <p className="text-sm text-neutral-500">Latest customer orders</p>
              </div>
              <Link
                href="/admin/orders"
                className="flex items-center gap-1 text-sm font-medium text-[#1B198F] hover:underline"
              >
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4">
                    <div className="h-10 w-10 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                      <div className="h-3 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                    </div>
                  </div>
                ))
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1B198F]/10 text-sm font-bold text-[#1B198F]">
                        {order.customer.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">{order.customer}</p>
                        <p className="text-sm text-neutral-500">{order.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-neutral-900 dark:text-white">₹{order.total.toLocaleString()}</p>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[order.status]}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="rounded-2xl bg-white shadow-sm dark:bg-neutral-800">
          <div className="flex items-center justify-between border-b border-neutral-200 p-6 dark:border-neutral-700">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Top Products</h2>
              <p className="text-sm text-neutral-500">Best selling items</p>
            </div>
            <Link
              href="/admin/products"
              className="flex items-center gap-1 text-sm font-medium text-[#1B198F] hover:underline"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4">
                  <div className="h-12 w-12 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                    <div className="h-3 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                  </div>
                </div>
              ))
            ) : (
              topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-3 p-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-500 dark:bg-neutral-700">
                    {index + 1}
                  </span>
                  <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-neutral-100">
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-neutral-900 dark:text-white">{product.name}</p>
                    <p className="text-sm text-neutral-500">{product.sales} sales</p>
                  </div>
                  <p className="font-bold text-green-600">₹{product.revenue.toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl bg-gradient-to-r from-[#1B198F] to-blue-600 p-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-bold text-white">Quick Actions</h3>
            <p className="text-white/80">Manage your store efficiently</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/admin/products/new"
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 font-medium text-[#1B198F] transition-all hover:bg-neutral-100"
            >
              <Package className="h-4 w-4" />
              Add Product
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 font-medium text-white transition-all hover:bg-white/30"
            >
              <ShoppingBag className="h-4 w-4" />
              View Orders
            </Link>
            <Link
              href="/admin/discounts"
              className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 font-medium text-white transition-all hover:bg-white/30"
            >
              <Percent className="h-4 w-4" />
              Create Discount
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
