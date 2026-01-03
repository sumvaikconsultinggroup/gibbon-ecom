'use client'

import { useState, useEffect } from 'react'
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
} from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  customer: {
    name: string
    email: string
    phone?: string
  }
  items: {
    name: string
    quantity: number
    price: number
  }[]
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'paid' | 'pending' | 'failed'
  createdAt: string
  shippingAddress?: {
    line1: string
    city: string
    state: string
    pincode: string
  }
}

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700', icon: Package },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-700', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: AlertCircle },
}

const paymentConfig = {
  paid: { label: 'Paid', color: 'bg-green-100 text-green-700' },
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700' },
}

// Mock orders data (replace with real API when Order model is complete)
const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    customer: { name: 'Rahul Sharma', email: 'rahul@example.com', phone: '+91 98765 43210' },
    items: [
      { name: 'MY WHEY - Chocolate (1kg)', quantity: 2, price: 1499 },
      { name: 'BCAA Energy - Orange', quantity: 1, price: 1299 },
    ],
    total: 4297,
    status: 'delivered',
    paymentStatus: 'paid',
    createdAt: '2024-01-02T10:30:00Z',
    shippingAddress: { line1: '123 MG Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    customer: { name: 'Priya Patel', email: 'priya@example.com' },
    items: [{ name: 'Whey Isolate - Vanilla (2kg)', quantity: 1, price: 4299 }],
    total: 4299,
    status: 'shipped',
    paymentStatus: 'paid',
    createdAt: '2024-01-02T08:15:00Z',
    shippingAddress: { line1: '456 Park Street', city: 'Delhi', state: 'Delhi', pincode: '110001' },
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    customer: { name: 'Amit Kumar', email: 'amit@example.com' },
    items: [{ name: 'Pre-Workout JOLT', quantity: 1, price: 1799 }],
    total: 1799,
    status: 'processing',
    paymentStatus: 'paid',
    createdAt: '2024-01-01T16:45:00Z',
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-004',
    customer: { name: 'Sneha Gupta', email: 'sneha@example.com' },
    items: [
      { name: 'Mass Gainer - Chocolate (3kg)', quantity: 1, price: 2499 },
      { name: 'Creatine Monohydrate', quantity: 1, price: 999 },
    ],
    total: 3498,
    status: 'pending',
    paymentStatus: 'pending',
    createdAt: '2024-01-01T14:20:00Z',
  },
]

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setOrders(mockOrders)
      setLoading(false)
    }, 500)
  }, [])

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Orders</h1>
          <p className="text-neutral-500">{filteredOrders.length} orders total</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={() => setLoading(true)}
            className="flex items-center gap-2 rounded-xl bg-[#1B198F] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#1B198F]/90"
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
            placeholder="Search orders by number, customer..."
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-[#1B198F] focus:ring-2 focus:ring-[#1B198F]/20 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-900"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {Object.entries(statusConfig).map(([key, config]) => {
          const count = orders.filter(o => o.status === key).length
          const Icon = config.icon
          return (
            <button
              key={key}
              onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
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
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-4"><div className="h-4 w-24 animate-pulse rounded bg-neutral-200" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-32 animate-pulse rounded bg-neutral-200" /></td>
                    <td className="px-4 py-4"><div className="h-6 w-20 animate-pulse rounded-full bg-neutral-200" /></td>
                    <td className="px-4 py-4"><div className="h-6 w-16 animate-pulse rounded-full bg-neutral-200" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-24 animate-pulse rounded bg-neutral-200" /></td>
                    <td className="px-4 py-4"><div className="ml-auto h-4 w-16 animate-pulse rounded bg-neutral-200" /></td>
                    <td className="px-4 py-4"><div className="ml-auto h-8 w-8 animate-pulse rounded bg-neutral-200" /></td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Package className="mx-auto h-12 w-12 text-neutral-300" />
                    <p className="mt-4 text-lg font-medium text-neutral-900 dark:text-white">No orders found</p>
                    <p className="mt-1 text-neutral-500">Orders will appear here when customers make purchases</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const StatusIcon = statusConfig[order.status].icon
                  return (
                    <tr key={order.id} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                      <td className="px-4 py-4">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-medium text-[#1B198F] hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                        <p className="text-sm text-neutral-500">{order.items.length} item(s)</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-neutral-900 dark:text-white">{order.customer.name}</p>
                        <p className="text-sm text-neutral-500">{order.customer.email}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig[order.status].color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig[order.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${paymentConfig[order.paymentStatus].color}`}>
                          {paymentConfig[order.paymentStatus].label}
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
                          ₹{order.total.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
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
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-800"
            >
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                    {selectedOrder.orderNumber}
                  </h2>
                  <p className="text-neutral-500">
                    {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>

              {/* Status Update */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Update Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => updateOrderStatus(selectedOrder.id, key as Order['status'])}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                        selectedOrder.status === key
                          ? 'bg-[#1B198F] text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Info */}
              <div className="mb-6 rounded-xl bg-neutral-50 p-4 dark:bg-neutral-900">
                <h3 className="mb-2 font-semibold text-neutral-900 dark:text-white">Customer</h3>
                <p className="text-neutral-700 dark:text-neutral-300">{selectedOrder.customer.name}</p>
                <p className="text-sm text-neutral-500">{selectedOrder.customer.email}</p>
                {selectedOrder.customer.phone && (
                  <p className="text-sm text-neutral-500">{selectedOrder.customer.phone}</p>
                )}
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="mb-3 font-semibold text-neutral-900 dark:text-white">Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">{item.name}</p>
                        <p className="text-sm text-neutral-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-neutral-900 dark:text-white">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shippingAddress && (
                <div className="mb-6 rounded-xl bg-neutral-50 p-4 dark:bg-neutral-900">
                  <h3 className="mb-2 font-semibold text-neutral-900 dark:text-white">Shipping Address</h3>
                  <p className="text-neutral-700 dark:text-neutral-300">
                    {selectedOrder.shippingAddress.line1}<br />
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}<br />
                    {selectedOrder.shippingAddress.pincode}
                  </p>
                </div>
              )}

              {/* Total */}
              <div className="flex items-center justify-between border-t border-neutral-200 pt-4 dark:border-neutral-700">
                <span className="text-lg font-semibold text-neutral-900 dark:text-white">Total</span>
                <span className="text-2xl font-bold text-[#1B198F]">
                  ₹{selectedOrder.total.toLocaleString()}
                </span>
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 py-2.5 font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300">
                  <Printer className="h-4 w-4" /> Print Invoice
                </button>
                <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1B198F] py-2.5 font-medium text-white hover:bg-[#1B198F]/90">
                  <Truck className="h-4 w-4" /> Track Shipment
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
