'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, LineChart, Line, ComposedChart
} from 'recharts'
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users,
  Package, Calendar, Clock, RefreshCw, Download, Filter,
  ChevronDown, ArrowUpRight, ArrowDownRight, Eye, AlertTriangle,
  CreditCard, Truck, CheckCircle, XCircle, MoreHorizontal,
  BarChart3, PieChartIcon, Activity, Zap, Target, Award,
  ArrowRight, ExternalLink, Box, UserPlus, Repeat, Sparkles
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { fetchDashboardData, DashboardData } from './dashboard-actions'

const PERIOD_OPTIONS = [
  { value: 'today', label: 'Today', shortLabel: 'Today' },
  { value: 'yesterday', label: 'Yesterday', shortLabel: 'Yesterday' },
  { value: 'last7days', label: 'Last 7 Days', shortLabel: '7D' },
  { value: 'last30days', label: 'Last 30 Days', shortLabel: '30D' },
  { value: 'thisMonth', label: 'This Month', shortLabel: 'MTD' },
  { value: 'lastMonth', label: 'Last Month', shortLabel: 'Last Mo' },
  { value: 'thisYear', label: 'This Year', shortLabel: 'YTD' },
  { value: 'custom', label: 'Custom Range', shortLabel: 'Custom' },
]

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  processing: '#3b82f6',
  shipped: '#8b5cf6',
  delivered: '#22c55e',
  completed: '#22c55e',
  cancelled: '#ef4444',
  refunded: '#6b7280',
  failed: '#ef4444'
}

const PAYMENT_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']

const CHART_COLORS = {
  primary: '#1B198F',
  secondary: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6'
}

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useAdminAuth()
  const router = useRouter()

  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [period, setPeriod] = useState('last30days')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false)
  const [activeChart, setActiveChart] = useState<'revenue' | 'orders'>('revenue')

  const fetchDashboard = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)
    else setLoading(true)
    
    try {
      const params = new URLSearchParams({ period })
      if (period === 'custom' && customStartDate && customEndDate) {
        params.set('startDate', customStartDate)
        params.set('endDate', customEndDate)
      }
      
      const res = await fetch(`/api/admin/dashboard?${params.toString()}`, {
        credentials: 'include'
      })
      const result = await res.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        toast.error(result.error || 'Failed to load dashboard')
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [period, customStartDate, customEndDate])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboard()
    }
  }, [isAuthenticated, fetchDashboard])

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod)
    setShowPeriodDropdown(false)
    if (newPeriod !== 'custom') {
      fetchDashboard()
    }
  }

  const handleCustomDateApply = () => {
    if (customStartDate && customEndDate) {
      fetchDashboard()
      setShowPeriodDropdown(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const getStatusColor = (status: string) => STATUS_COLORS[status.toLowerCase()] || '#6b7280'

  const TrendIndicator = ({ value, suffix = '%' }: { value: number; suffix?: string }) => {
    const isPositive = value >= 0
    return (
      <span className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
        {Math.abs(value).toFixed(1)}{suffix}
      </span>
    )
  }

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-neutral-200 border-t-[#1B198F]" />
          <p className="mt-4 text-neutral-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-50">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-amber-500" />
          <p className="mt-4 text-neutral-600">Failed to load dashboard data</p>
          <button
            onClick={() => fetchDashboard()}
            className="mt-4 rounded-lg bg-[#1B198F] px-4 py-2 text-white"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const currentPeriod = PERIOD_OPTIONS.find(p => p.value === period)

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-blue-50/30 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-neutral-200/80 bg-white/80 backdrop-blur-xl dark:border-neutral-700 dark:bg-neutral-900/80">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Dashboard</h1>
            <p className="text-sm text-neutral-500">
              {format(new Date(data.period.start), 'MMM dd, yyyy')} — {format(new Date(data.period.end), 'MMM dd, yyyy')}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Period Selector */}
            <div className="relative">
              <button
                onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 font-medium shadow-sm transition-all hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800"
              >
                <Calendar className="h-4 w-4 text-neutral-500" />
                {currentPeriod?.label}
                <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform ${showPeriodDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {showPeriodDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-neutral-200 bg-white p-2 shadow-xl dark:border-neutral-700 dark:bg-neutral-800"
                  >
                    <div className="grid grid-cols-2 gap-1">
                      {PERIOD_OPTIONS.filter(p => p.value !== 'custom').map(option => (
                        <button
                          key={option.value}
                          onClick={() => handlePeriodChange(option.value)}
                          className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                            period === option.value
                              ? 'bg-[#1B198F] text-white'
                              : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    
                    <div className="mt-3 border-t border-neutral-200 pt-3 dark:border-neutral-700">
                      <p className="mb-2 text-xs font-medium text-neutral-500">Custom Range</p>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className="flex-1 rounded-lg border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-700"
                        />
                        <input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          className="flex-1 rounded-lg border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-700"
                        />
                      </div>
                      <button
                        onClick={handleCustomDateApply}
                        className="mt-2 w-full rounded-lg bg-[#1B198F] py-2 text-sm font-medium text-white"
                      >
                        Apply Range
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={() => fetchDashboard(true)}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 font-medium shadow-sm transition-all hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Revenue Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1B198F] to-blue-600 p-6 text-white shadow-lg shadow-blue-500/20"
          >
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 translate-y-[-50%] rounded-full bg-white/10" />
            <div className="absolute bottom-0 left-0 h-24 w-24 translate-x-[-50%] translate-y-8 rounded-full bg-white/10" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                  <DollarSign className="h-6 w-6" />
                </div>
                <TrendIndicator value={data.summary.trends.revenue} />
              </div>
              <p className="mt-4 text-sm font-medium text-white/70">Total Revenue</p>
              <p className="mt-1 text-3xl font-bold">{formatCurrency(data.summary.totalRevenue)}</p>
            </div>
          </motion.div>

          {/* Orders Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg ring-1 ring-neutral-200/50 dark:bg-neutral-800 dark:ring-neutral-700"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
              <TrendIndicator value={data.summary.trends.orders} />
            </div>
            <p className="mt-4 text-sm font-medium text-neutral-500">Total Orders</p>
            <p className="mt-1 text-3xl font-bold text-neutral-900 dark:text-white">{data.summary.totalOrders}</p>
          </motion.div>

          {/* AOV Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg ring-1 ring-neutral-200/50 dark:bg-neutral-800 dark:ring-neutral-700"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <TrendIndicator value={data.summary.trends.aov} />
            </div>
            <p className="mt-4 text-sm font-medium text-neutral-500">Avg Order Value</p>
            <p className="mt-1 text-3xl font-bold text-neutral-900 dark:text-white">{formatCurrency(data.summary.avgOrderValue)}</p>
          </motion.div>

          {/* Customers Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg ring-1 ring-neutral-200/50 dark:bg-neutral-800 dark:ring-neutral-700"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
              <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                <UserPlus className="h-4 w-4" />
                +{data.summary.newCustomers}
              </span>
            </div>
            <p className="mt-4 text-sm font-medium text-neutral-500">Total Customers</p>
            <p className="mt-1 text-3xl font-bold text-neutral-900 dark:text-white">{data.summary.totalCustomers.toLocaleString()}</p>
          </motion.div>
        </div>

        {/* Main Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Revenue/Orders Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-neutral-200/50 dark:bg-neutral-800 dark:ring-neutral-700"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Sales Overview</h3>
                <p className="text-sm text-neutral-500">Revenue and orders over time</p>
              </div>
              <div className="flex rounded-lg bg-neutral-100 p-1 dark:bg-neutral-700">
                <button
                  onClick={() => setActiveChart('revenue')}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    activeChart === 'revenue' ? 'bg-white shadow text-neutral-900 dark:bg-neutral-600 dark:text-white' : 'text-neutral-500'
                  }`}
                >
                  Revenue
                </button>
                <button
                  onClick={() => setActiveChart('orders')}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    activeChart === 'orders' ? 'bg-white shadow text-neutral-900 dark:bg-neutral-600 dark:text-white' : 'text-neutral-500'
                  }`}
                >
                  Orders
                </button>
              </div>
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.charts.revenueOverTime}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    tickFormatter={(value) => activeChart === 'revenue' ? `₹${(value/1000).toFixed(0)}k` : value}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value: number, name: string) => [
                      name === 'revenue' ? formatCurrency(value) : value,
                      name === 'revenue' ? 'Revenue' : 'Orders'
                    ]}
                  />
                  {activeChart === 'revenue' ? (
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke={CHART_COLORS.primary}
                      strokeWidth={3}
                      fill="url(#revenueGradient)"
                    />
                  ) : (
                    <Bar
                      dataKey="orders"
                      fill={CHART_COLORS.secondary}
                      radius={[4, 4, 0, 0]}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Order Status Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-neutral-200/50 dark:bg-neutral-800 dark:ring-neutral-700"
          >
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Order Status</h3>
            <p className="text-sm text-neutral-500">Distribution by status</p>
            
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.charts.orderStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="status"
                  >
                    {data.charts.orderStatus.map((entry, index) => (
                      <Cell key={entry.status} fill={getStatusColor(entry.status)} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 space-y-2">
              {data.charts.orderStatus.map(item => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: getStatusColor(item.status) }}
                    />
                    <span className="text-sm capitalize text-neutral-600 dark:text-neutral-400">{item.status}</span>
                  </div>
                  <span className="text-sm font-semibold text-neutral-900 dark:text-white">{item.count}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Second Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-neutral-200/50 dark:bg-neutral-800 dark:ring-neutral-700"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Top Products</h3>
                <p className="text-sm text-neutral-500">Best sellers by revenue</p>
              </div>
              <Link 
                href="/admin/products"
                className="flex items-center gap-1 text-sm font-medium text-[#1B198F] hover:underline"
              >
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.charts.topProducts.slice(0, 5)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                  <XAxis 
                    type="number" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    width={120}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Payment Methods */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-neutral-200/50 dark:bg-neutral-800 dark:ring-neutral-700"
          >
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Payment Methods</h3>
            <p className="text-sm text-neutral-500">Revenue by payment type</p>
            
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.charts.paymentMethods}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="revenue"
                    nameKey="method"
                    label={({ method, percent }) => `${method} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {data.charts.paymentMethods.map((entry, index) => (
                      <Cell key={entry.method} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-2">
              {data.charts.paymentMethods.map((item, index) => (
                <div key={item.method} className="flex items-center gap-2">
                  <div 
                    className="h-3 w-3 rounded-full" 
                    style={{ backgroundColor: PAYMENT_COLORS[index % PAYMENT_COLORS.length] }}
                  />
                  <span className="text-sm capitalize text-neutral-600 dark:text-neutral-400">{item.method}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Row - Recent Orders & Low Stock */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-neutral-200/50 dark:bg-neutral-800 dark:ring-neutral-700"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Recent Orders</h3>
                <p className="text-sm text-neutral-500">Latest customer orders</p>
              </div>
              <Link 
                href="/admin/orders"
                className="flex items-center gap-1 text-sm font-medium text-[#1B198F] hover:underline"
              >
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-700">
                    <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Order</th>
                    <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Customer</th>
                    <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Status</th>
                    <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500">Total</th>
                    <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
                  {data.recentOrders.slice(0, 6).map(order => (
                    <tr key={order._id} className="group">
                      <td className="py-3">
                        <Link 
                          href={`/admin/orders/${order._id}`}
                          className="font-medium text-neutral-900 hover:text-[#1B198F] dark:text-white"
                        >
                          #{order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3">
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-white">{order.customer}</p>
                          <p className="text-xs text-neutral-500">{order.email}</p>
                        </div>
                      </td>
                      <td className="py-3">
                        <span 
                          className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize"
                          style={{ 
                            backgroundColor: `${getStatusColor(order.status)}20`,
                            color: getStatusColor(order.status)
                          }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-right font-semibold text-neutral-900 dark:text-white">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="py-3 text-right text-sm text-neutral-500">
                        {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Low Stock Alert */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-neutral-200/50 dark:bg-neutral-800 dark:ring-neutral-700"
          >
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-neutral-900 dark:text-white">Low Stock Alert</h3>
                <p className="text-xs text-neutral-500">{data.lowStockProducts.length} products</p>
              </div>
            </div>
            
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {data.lowStockProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                  <p className="mt-2 text-sm text-neutral-500">All products are well stocked!</p>
                </div>
              ) : (
                data.lowStockProducts.map(product => (
                  <Link
                    key={product._id}
                    href={`/admin/products/${product.handle}`}
                    className="flex items-center gap-3 rounded-xl bg-neutral-50 p-3 transition-colors hover:bg-neutral-100 dark:bg-neutral-700 dark:hover:bg-neutral-600"
                  >
                    <div className="h-12 w-12 overflow-hidden rounded-lg bg-white">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.title}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-5 w-5 text-neutral-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                        {product.title}
                      </p>
                      <p className={`text-xs font-semibold ${
                        product.inventory <= 0 ? 'text-red-600' : 
                        product.inventory <= 5 ? 'text-amber-600' : 'text-orange-600'
                      }`}>
                        {product.inventory <= 0 ? 'Out of stock' : `${product.inventory} left`}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-neutral-400" />
                  </Link>
                ))
              )}
            </div>
            
            {data.lowStockProducts.length > 0 && (
              <Link
                href="/admin/products?stock=low"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-50 py-2.5 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100"
              >
                <Package className="h-4 w-4" />
                Manage Inventory
              </Link>
            )}
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="rounded-2xl bg-gradient-to-r from-[#1B198F] to-blue-600 p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Quick Actions</h3>
              <p className="text-sm text-white/70">Frequently used actions</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/products/new"
                className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 font-medium backdrop-blur transition-colors hover:bg-white/30"
              >
                <Package className="h-4 w-4" />
                Add Product
              </Link>
              <Link
                href="/admin/orders"
                className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 font-medium backdrop-blur transition-colors hover:bg-white/30"
              >
                <ShoppingCart className="h-4 w-4" />
                View Orders
              </Link>
              <Link
                href="/admin/bundles"
                className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 font-medium backdrop-blur transition-colors hover:bg-white/30"
              >
                <Sparkles className="h-4 w-4" />
                Create Bundle
              </Link>
              <Link
                href="/admin/blog"
                className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 font-medium text-[#1B198F] transition-colors hover:bg-white/90"
              >
                <Zap className="h-4 w-4" />
                Write Blog Post
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
