'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Package,
  Truck,
  CreditCard,
  User,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Printer,
  Send,
  MessageSquare,
  Edit,
  MoreVertical,
  RefreshCw,
  Tag,
  Plus,
  ChevronRight,
  Copy,
  ExternalLink,
  Download,
  IndianRupee,
  Calendar,
  Shield,
  Loader2,
  X,
  Check,
  RotateCcw,
  Navigation,
  StickyNote,
  History,
  Users,
  Timer,
} from 'lucide-react'

type TabType = 'timeline' | 'payments' | 'fulfillment' | 'notes'

interface OrderEvent {
  id: string
  type: 'created' | 'payment' | 'fulfillment' | 'shipping' | 'delivery' | 'refund' | 'note' | 'status'
  title: string
  description: string
  timestamp: string
  user?: string
  metadata?: Record<string, any>
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('timeline')
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [showRefundModal, setShowRefundModal] = useState(false)

  // Mock order data
  const [order, setOrder] = useState<any>(null)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setOrder({
        id: resolvedParams.id,
        orderId: `ORD-2024-${resolvedParams.id.slice(-3)}`,
        status: 'processing',
        createdAt: '2024-01-03T10:30:00Z',
        customer: {
          name: 'Rahul Sharma',
          email: 'rahul@example.com',
          phone: '+91 98765 43210',
          totalOrders: 5,
          totalSpent: 24500,
        },
        shippingAddress: {
          line1: '123 MG Road',
          line2: 'Apt 4B',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India',
        },
        billingAddress: {
          line1: '123 MG Road',
          line2: 'Apt 4B',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India',
        },
        items: [
          { id: '1', name: 'BCAA 4:1:1 + L-Glutamine Power Combo', quantity: 1, price: 2999, image: '/products/bcaa.jpg', sku: 'BCAA-001', variant: '500g - Mango' },
          { id: '2', name: 'Whey Protein Isolate', quantity: 2, price: 1499, image: '/products/whey.jpg', sku: 'WPI-002', variant: '1kg - Chocolate' },
        ],
        subtotal: 5997,
        discount: 500,
        shipping: 0,
        taxes: 800,
        total: 6297,
        payment: {
          method: 'razorpay',
          status: 'paid',
          transactionId: 'pay_L3xYz123abc',
          paidAt: '2024-01-03T10:32:00Z',
        },
        fulfillment: {
          status: 'processing',
          carrier: null,
          trackingNumber: null,
          shippedAt: null,
          deliveredAt: null,
        },
        tags: ['repeat-customer', 'high-value'],
        notes: [
          { id: '1', content: 'Customer requested express delivery', author: 'Store Owner', createdAt: '2024-01-03T11:00:00Z' },
        ],
        assignedTo: 'Priya Sharma',
        slaDeadline: '2024-01-04T10:30:00Z',
        riskScore: 'low',
      })
      setLoading(false)
    }, 300)
  }, [resolvedParams.id])

  const timeline: OrderEvent[] = [
    { id: '1', type: 'created', title: 'Order Placed', description: 'Order was placed by customer', timestamp: '2024-01-03T10:30:00Z' },
    { id: '2', type: 'payment', title: 'Payment Received', description: 'Payment of ₹6,297 received via Razorpay', timestamp: '2024-01-03T10:32:00Z', metadata: { transactionId: 'pay_L3xYz123abc' } },
    { id: '3', type: 'status', title: 'Order Confirmed', description: 'Order moved to processing', timestamp: '2024-01-03T10:35:00Z', user: 'System' },
    { id: '4', type: 'note', title: 'Note Added', description: 'Customer requested express delivery', timestamp: '2024-01-03T11:00:00Z', user: 'Store Owner' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'processing': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'shipped': return 'bg-indigo-100 text-indigo-700 border-indigo-200'
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200'
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-neutral-100 text-neutral-700 border-neutral-200'
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'created': return <Package className="h-4 w-4" />
      case 'payment': return <CreditCard className="h-4 w-4" />
      case 'fulfillment': return <Package className="h-4 w-4" />
      case 'shipping': return <Truck className="h-4 w-4" />
      case 'delivery': return <CheckCircle className="h-4 w-4" />
      case 'refund': return <RotateCcw className="h-4 w-4" />
      case 'note': return <StickyNote className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B198F]" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="py-20 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-neutral-300" />
        <h3 className="mt-4 text-lg font-medium">Order not found</h3>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">{order.orderId}</h1>
              <span className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
              {order.riskScore === 'high' && (
                <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                  <AlertCircle className="h-3 w-3" /> High Risk
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-neutral-500">
              {new Date(order.createdAt).toLocaleString()} • Assigned to {order.assignedTo}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button className="flex items-center gap-2 rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-700">
            <Printer className="h-4 w-4" /> Print Invoice
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-700">
            <Send className="h-4 w-4" /> Send Invoice
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-[#1B198F] px-4 py-2 text-sm font-medium text-white hover:bg-[#1B198F]/90">
            <Truck className="h-4 w-4" /> Create Shipment
          </button>
        </div>
      </div>

      {/* SLA Timer */}
      {order.slaDeadline && new Date(order.slaDeadline) > new Date() && (
        <div className="flex items-center gap-3 rounded-xl bg-yellow-50 p-4 dark:bg-yellow-900/20">
          <Timer className="h-5 w-5 text-yellow-600" />
          <div>
            <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
              SLA Deadline: {new Date(order.slaDeadline).toLocaleString()}
            </p>
            <p className="text-xs text-yellow-600">Ship within 24 hours to meet SLA</p>
          </div>
        </div>
      )}

      {/* Main Layout - 3 Column */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Left Column - Customer Info */}
        <div className="space-y-6 lg:col-span-1">
          {/* Customer Card */}
          <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-neutral-900 dark:text-white">Customer</h3>
              <Link href={`/admin/customers/${order.customer.email}`} className="text-[#1B198F] hover:underline">
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1B198F] font-bold text-white">
                {order.customer.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-neutral-900 dark:text-white">{order.customer.name}</p>
                <p className="text-sm text-neutral-500">{order.customer.totalOrders} orders • ₹{order.customer.totalSpent.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                <Mail className="h-4 w-4" /> {order.customer.email}
              </div>
              <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                <Phone className="h-4 w-4" /> {order.customer.phone}
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-800">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-neutral-900 dark:text-white">Shipping Address</h3>
              <button className="text-neutral-400 hover:text-neutral-600">
                <Edit className="h-4 w-4" />
              </button>
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>

          {/* Tags */}
          <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-800">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-neutral-900 dark:text-white">Tags</h3>
              <button className="text-neutral-400 hover:text-neutral-600">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {order.tags.map((tag: string) => (
                <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300">
                  <Tag className="h-3 w-3" /> {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column - Order Items & Tabs */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items */}
          <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-800">
            <h3 className="mb-4 font-semibold text-neutral-900 dark:text-white">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 rounded-xl bg-neutral-50 p-3 dark:bg-neutral-900">
                  <div className="h-16 w-16 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900 dark:text-white">{item.name}</p>
                    <p className="text-sm text-neutral-500">{item.variant} • SKU: {item.sku}</p>
                    <p className="text-sm text-neutral-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-neutral-900 dark:text-white">₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-4 border-t border-neutral-200 pt-4 dark:border-neutral-700">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Subtotal</span>
                  <span>₹{order.subtotal.toLocaleString()}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{order.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-neutral-500">Shipping</span>
                  <span>{order.shipping === 0 ? 'Free' : `₹${order.shipping}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Taxes (GST)</span>
                  <span>₹{order.taxes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-semibold dark:border-neutral-700">
                  <span>Total</span>
                  <span>₹{order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="rounded-2xl bg-white shadow-sm dark:bg-neutral-800">
            <div className="flex border-b border-neutral-200 dark:border-neutral-700">
              {(['timeline', 'payments', 'fulfillment', 'notes'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-4 py-3 text-sm font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'border-b-2 border-[#1B198F] text-[#1B198F]'
                      : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-5">
              {activeTab === 'timeline' && (
                <div className="space-y-4">
                  {timeline.map((event, index) => (
                    <div key={event.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1B198F]/10 text-[#1B198F]">
                          {getEventIcon(event.type)}
                        </div>
                        {index < timeline.length - 1 && (
                          <div className="mt-2 h-full w-0.5 bg-neutral-200 dark:bg-neutral-700" />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <p className="font-medium text-neutral-900 dark:text-white">{event.title}</p>
                        <p className="text-sm text-neutral-500">{event.description}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-neutral-400">
                          <Clock className="h-3 w-3" />
                          {new Date(event.timestamp).toLocaleString()}
                          {event.user && <span>• {event.user}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'payments' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl bg-green-50 p-4 dark:bg-green-900/20">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <div>
                        <p className="font-medium text-green-700 dark:text-green-400">Payment Successful</p>
                        <p className="text-sm text-green-600">via Razorpay • {order.payment.transactionId}</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-green-700">₹{order.total.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => setShowRefundModal(true)}
                    className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <RotateCcw className="h-4 w-4" /> Issue Refund
                  </button>
                </div>
              )}

              {activeTab === 'fulfillment' && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Fulfillment Status</p>
                        <p className="text-sm text-neutral-500 capitalize">{order.fulfillment.status}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusColor(order.fulfillment.status)}`}>
                        {order.fulfillment.status}
                      </span>
                    </div>
                  </div>
                  {!order.fulfillment.trackingNumber && (
                    <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1B198F] py-3 font-medium text-white">
                      <Truck className="h-5 w-5" /> Create Shipment
                    </button>
                  )}
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-4">
                  {order.notes.map((note: any) => (
                    <div key={note.id} className="rounded-xl bg-yellow-50 p-4 dark:bg-yellow-900/20">
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">{note.content}</p>
                      <p className="mt-2 text-xs text-neutral-500">{note.author} • {new Date(note.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                  <button
                    onClick={() => setShowNoteModal(true)}
                    className="flex items-center gap-2 text-sm text-[#1B198F] hover:underline"
                  >
                    <Plus className="h-4 w-4" /> Add Note
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6 lg:col-span-1">
          {/* Payment Info */}
          <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-800">
            <h3 className="mb-3 font-semibold text-neutral-900 dark:text-white">Payment</h3>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium capitalize">{order.payment.method}</p>
                <p className="text-xs text-neutral-500">{order.payment.status === 'paid' ? 'Paid' : 'Pending'}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-800">
            <h3 className="mb-3 font-semibold text-neutral-900 dark:text-white">Actions</h3>
            <div className="space-y-2">
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700">
                <Truck className="h-4 w-4 text-neutral-400" /> Create Shipment
              </button>
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700">
                <FileText className="h-4 w-4 text-neutral-400" /> Generate Invoice
              </button>
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700">
                <MessageSquare className="h-4 w-4 text-neutral-400" /> Send WhatsApp
              </button>
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700">
                <Mail className="h-4 w-4 text-neutral-400" /> Send Email
              </button>
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700">
                <Users className="h-4 w-4 text-neutral-400" /> Reassign
              </button>
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                <XCircle className="h-4 w-4" /> Cancel Order
              </button>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-800">
            <h3 className="mb-3 font-semibold text-neutral-900 dark:text-white">Risk Assessment</h3>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium capitalize text-green-600">{order.riskScore} Risk</p>
                <p className="text-xs text-neutral-500">Repeat customer, verified payment</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Note Modal */}
      <AnimatePresence>
        {showNoteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowNoteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-800"
            >
              <h3 className="mb-4 text-lg font-bold">Add Note</h3>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Enter your note..."
                rows={4}
                className="w-full rounded-xl border border-neutral-200 p-3 outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-900"
              />
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setShowNoteModal(false)}
                  className="flex-1 rounded-xl border border-neutral-200 py-2 font-medium hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button className="flex-1 rounded-xl bg-[#1B198F] py-2 font-medium text-white">
                  Add Note
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
