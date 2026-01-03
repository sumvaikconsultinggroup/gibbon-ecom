'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Printer,
  Download,
  ChevronLeft,
  ChevronRight,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Calendar,
  XCircle,
  RotateCcw,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getOrdersAction } from './order-actions'

interface Order {
  id: string
  orderId: string
  customer: {
    firstName?: string
    lastName?: string
    name?: string
    email?: string
    phone?: string
  }
  items: {
    name: string
    quantity: number
    price: number
  }[]
  totalAmount: number
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  paymentDetails?: {
    status?: 'paid' | 'pending' | 'failed' | 'refunded'
  }
  paymentMethod?: string
  createdAt: string
  shippingAddress?: {
    address?: string
    address1?: string
    city?: string
    state?: string
    zipcode?: string
  }
}

interface StatusConfig {
  label: string
  color: string
  icon: React.ComponentType<{ className?: string }>
}

const statusConfig: Record<string, StatusConfig> = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
  processing: { label: 'Processing', color: 'bg-purple-100 text-purple-700', icon: Package },
  shipped: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-700', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
  refunded: { label: 'Refunded', color: 'bg-orange-100 text-orange-700', icon: RotateCcw },
}

const paymentConfig: Record<string, { label: string; color: string }> = {
  paid: { label: 'Paid', color: 'bg-green-100 text-green-700' },
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700' },
  refunded: { label: 'Refunded', color: 'bg-orange-100 text-orange-700' },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({})

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const result = await getOrdersAction({
        page: currentPage,
        limit: 20,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery || undefined,
      })
      
      if (result.success) {
        setOrders(result.orders || [])
        setTotalPages(result.pagination?.pages || 1)
        setTotalOrders(result.pagination?.total || 0)
        setStatusCounts(result.statusCounts || {})
      } else {
        toast.error(result.error || 'Failed to load orders')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [currentPage, statusFilter, searchQuery])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleExport = () => {
    // Create CSV export
    const headers = ['Order ID', 'Customer', 'Email', 'Status', 'Payment', 'Total', 'Date']
    const rows = orders.map(order => [
      order.orderId,
      `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || order.customer?.name || 'Guest',
      order.customer?.email || '',
      order.status,
      order.paymentDetails?.status || 'pending',
      order.totalAmount,
      new Date(order.createdAt).toLocaleDateString()
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success('Orders exported')
  }

  const getCustomerName = (customer: Order['customer']) => {
    if (customer?.name) return customer.name
    if (customer?.firstName || customer?.lastName) {
      return `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
    }
    return 'Guest'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Orders</h1>
          <p className="text-neutral-500">{totalOrders} orders total</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={() => fetchOrders()}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-[#1B198F] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#1B198F]/90 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders by ID, customer name, email..."
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-[#1B198F] focus:ring-2 focus:ring-[#1B198F]/20 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-900"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
        {Object.entries(statusConfig).map(([key, config]) => {
          const count = statusCounts[key] || 0
          const Icon = config.icon
          return (
            <button
              key={key}
              onClick={() => {
                setStatusFilter(statusFilter === key ? 'all' : key)
                setCurrentPage(1)
              }}
              className={`rounded-xl p-4 text-left transition-all ${
                statusFilter === key
                  ? 'bg-[#1B198F] text-white shadow-lg'
                  : 'bg-white hover:shadow-md dark:bg-neutral-800'
              }`}
            >
              <Icon className={`h-5 w-5 ${statusFilter === key ? 'text-white' : 'text-neutral-400'}`} />
              <p className="mt-2 text-2xl font-bold">{count}</p>
              <p className={`text-sm ${statusFilter === key ? 'text-white/80' : 'text-neutral-500'}`}>
                {config.label}
              </p>
            </button>
          )
        })}
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900">
                <th className="whitespace-nowrap px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Order
                </th>
                <th className="whitespace-nowrap px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Customer
                </th>
                <th className="whitespace-nowrap px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Status
                </th>
                <th className="whitespace-nowrap px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Payment
                </th>
                <th className="whitespace-nowrap px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Date
                </th>
                <th className="whitespace-nowrap px-4 py-4 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Total
                </th>
                <th className="whitespace-nowrap px-4 py-4 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-4"><div className="h-4 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" /></td>
                    <td className="px-4 py-4"><div className="h-6 w-20 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700" /></td>
                    <td className="px-4 py-4"><div className="h-6 w-16 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" /></td>
                    <td className="px-4 py-4"><div className="ml-auto h-4 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" /></td>
                    <td className="px-4 py-4"><div className="ml-auto h-8 w-8 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" /></td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Package className="mx-auto h-12 w-12 text-neutral-300" />
                    <p className="mt-4 text-lg font-medium text-neutral-900 dark:text-white">No orders found</p>
                    <p className="mt-1 text-neutral-500">
                      {searchQuery || statusFilter !== 'all'
                        ? 'Try adjusting your filters'
                        : 'Orders will appear here when customers make purchases'}
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const status = statusConfig[order.status] || statusConfig.pending
                  const StatusIcon = status.icon
                  const paymentStatus = paymentConfig[order.paymentDetails?.status || 'pending'] || paymentConfig.pending
                  return (
                    <tr key={order.id} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                      <td className="px-4 py-4">
                        <Link
                          href={`/admin/orders/${order.orderId || order.id}`}
                          className="font-medium text-[#1B198F] hover:underline"
                        >
                          {order.orderId || `ORD-${order.id?.slice(-6)}`}
                        </Link>
                        <p className="text-sm text-neutral-500">{order.items?.length || 0} item(s)</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-neutral-900 dark:text-white">
                          {getCustomerName(order.customer)}
                        </p>
                        <p className="text-sm text-neutral-500">{order.customer?.email || 'No email'}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${status.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${paymentStatus.color}`}>
                          {paymentStatus.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-neutral-900 dark:text-white">
                          {new Date(order.createdAt).toLocaleDateString('en-IN')}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="font-bold text-neutral-900 dark:text-white">
                          ₹{(order.totalAmount || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          href={`/admin/orders/${order.orderId || order.id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-700"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-4 dark:border-neutral-700">
            <p className="text-sm text-neutral-500">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-700"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
