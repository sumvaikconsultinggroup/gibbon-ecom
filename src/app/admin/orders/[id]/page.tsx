'use client'

import { useState, useEffect, use, useCallback } from 'react'
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
  Smartphone,
  Globe,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getOrderAction,
  updateOrderAction,
  createShipmentAction,
  processRefundAction,
  generateInvoiceAction,
  sendOrderEmailAction,
} from '../order-actions'

type TabType = 'timeline' | 'payments' | 'fulfillment' | 'notes'

interface TimelineEvent {
  _id?: string
  type: string
  title: string
  description?: string
  user?: string
  metadata?: Record<string, unknown>
  createdAt: string
}

interface OrderNote {
  _id?: string
  content: string
  author: string
  isInternal: boolean
  createdAt: string
}

interface OrderData {
  id: string
  orderId: string
  status: string
  createdAt: string
  updatedAt: string
  customer: {
    firstName?: string
    lastName?: string
    name?: string
    email?: string
    phone?: string
    totalOrders?: number
    totalSpent?: number
  }
  shippingAddress: {
    address?: string
    address1?: string
    city?: string
    state?: string
    zipcode?: string
    country?: string
  }
  billingAddress?: {
    address?: string
    address1?: string
    city?: string
    state?: string
    zipcode?: string
    country?: string
  }
  items: {
    productId?: string
    name: string
    quantity: number
    price: number
    sku?: string
    variant?: {
      option1Value?: string
      option2Value?: string
    }
    imageUrl?: string
  }[]
  subtotal?: number
  discount?: number
  discountCode?: string
  shipping?: number
  taxes?: number
  totalAmount: number
  paymentMethod?: string
  paymentDetails?: {
    transactionId?: string
    status?: string
    paidAt?: string
    gateway?: string
    refundId?: string
    refundedAt?: string
    refundAmount?: number
  }
  fulfillment?: {
    status?: string
    shipmentId?: string
    carrier?: string
    trackingNumber?: string
    trackingUrl?: string
    shippedAt?: string
    deliveredAt?: string
    estimatedDelivery?: string
  }
  timeline?: TimelineEvent[]
  notes?: OrderNote[]
  tags?: string[]
  assignedTo?: string
  slaDeadline?: string
  riskScore?: string
  riskReasons?: string[]
  invoiceNumber?: string
  invoiceGeneratedAt?: string
  source?: string
  shipment?: {
    id: string
    shipmentId: string
    status: string
    awbNumber?: string
    courierName?: string
    trackingUrl?: string
    estimatedDeliveryDate?: string
    statusHistory?: { status: string; timestamp: string; description?: string }[]
  }
}

const BASE_URL = typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_BASE_URL || ''

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('timeline')
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [showShipmentModal, setShowShipmentModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showReassignModal, setShowReassignModal] = useState(false)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [showTagModal, setShowTagModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')
  const [cancelReason, setCancelReason] = useState('')
  const [newAssignee, setNewAssignee] = useState('')
  const [newTag, setNewTag] = useState('')
  const [emailType, setEmailType] = useState<'invoice' | 'shipping_update' | 'delivery_confirmation' | 'custom'>('shipping_update')
  const [customEmailSubject, setCustomEmailSubject] = useState('')
  const [customEmailMessage, setCustomEmailMessage] = useState('')
  const [shipmentData, setShipmentData] = useState({
    carrier: '',
    trackingNumber: '',
    shippingMethod: 'standard',
  })
  const [editAddress, setEditAddress] = useState({
    address: '',
    address1: '',
    city: '',
    state: '',
    zipcode: '',
    country: 'India',
  })

  const [order, setOrder] = useState<OrderData | null>(null)

  // Fetch order data using server action
  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true)
      const result = await getOrderAction(resolvedParams.id)
      if (result.success && result.order) {
        setOrder(result.order as OrderData)
      } else {
        toast.error(result.error || 'Order not found')
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      toast.error('Failed to load order')
    } finally {
      setLoading(false)
    }
  }, [resolvedParams.id])

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  // Update order status
  const handleStatusUpdate = async (newStatus: string) => {
    try {
      setActionLoading('status')
      const result = await updateOrderAction(order?.orderId || resolvedParams.id, 'update_status', {
        status: newStatus,
        user: 'Admin',
      })
      if (result.success) {
        toast.success(`Order status updated to ${newStatus}`)
        await fetchOrder()
      } else {
        toast.error(result.error || 'Failed to update status')
      }
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setActionLoading(null)
    }
  }

  // Add note
  const handleAddNote = async () => {
    if (!newNote.trim()) return
    try {
      setActionLoading('note')
      const result = await updateOrderAction(order?.orderId || resolvedParams.id, 'add_note', {
        content: newNote,
        author: 'Admin',
        isInternal: true,
      })
      if (result.success) {
        toast.success('Note added successfully')
        setNewNote('')
        setShowNoteModal(false)
        await fetchOrder()
      } else {
        toast.error(result.error || 'Failed to add note')
      }
    } catch (error) {
      toast.error('Failed to add note')
    } finally {
      setActionLoading(null)
    }
  }

  // Create shipment
  const handleCreateShipment = async () => {
    try {
      setActionLoading('shipment')
      const result = await createShipmentAction(order?.orderId || resolvedParams.id, {
        carrier: shipmentData.carrier || 'Manual Shipping',
        trackingNumber: shipmentData.trackingNumber,
        shippingMethod: shipmentData.shippingMethod,
        user: 'Admin',
      })
      if (result.success) {
        toast.success('Shipment created successfully')
        setShowShipmentModal(false)
        setShipmentData({ carrier: '', trackingNumber: '', shippingMethod: 'standard' })
        await fetchOrder()
      } else {
        toast.error(result.error || 'Failed to create shipment')
      }
    } catch (error) {
      toast.error('Failed to create shipment')
    } finally {
      setActionLoading(null)
    }
  }

  // Process refund
  const handleRefund = async () => {
    try {
      setActionLoading('refund')
      const amount = refundAmount ? parseFloat(refundAmount) : order?.totalAmount || 0
      const result = await processRefundAction(order?.orderId || resolvedParams.id, amount, refundReason)
      if (result.success) {
        toast.success('Refund processed successfully')
        setShowRefundModal(false)
        setRefundAmount('')
        setRefundReason('')
        await fetchOrder()
      } else {
        toast.error(result.error || 'Failed to process refund')
      }
    } catch (error) {
      toast.error('Failed to process refund')
    } finally {
      setActionLoading(null)
    }
  }

  // Cancel order
  const handleCancelOrder = async () => {
    try {
      setActionLoading('cancel')
      const result = await updateOrderAction(order?.orderId || resolvedParams.id, 'cancel', {
        reason: cancelReason,
        user: 'Admin',
      })
      if (result.success) {
        toast.success('Order cancelled successfully')
        setShowCancelModal(false)
        setCancelReason('')
        await fetchOrder()
      } else {
        toast.error(result.error || 'Failed to cancel order')
      }
    } catch (error) {
      toast.error('Failed to cancel order')
    } finally {
      setActionLoading(null)
    }
  }

  // Reassign order
  const handleReassign = async () => {
    if (!newAssignee.trim()) return
    try {
      setActionLoading('assign')
      const result = await updateOrderAction(order?.orderId || resolvedParams.id, 'assign', {
        assignedTo: newAssignee,
        user: 'Admin',
      })
      if (result.success) {
        toast.success('Order reassigned successfully')
        setShowReassignModal(false)
        setNewAssignee('')
        await fetchOrder()
      } else {
        toast.error(result.error || 'Failed to reassign order')
      }
    } catch (error) {
      toast.error('Failed to reassign order')
    } finally {
      setActionLoading(null)
    }
  }

  // Add tag
  const handleAddTag = async () => {
    if (!newTag.trim()) return
    try {
      setActionLoading('tag')
      const result = await updateOrderAction(order?.orderId || resolvedParams.id, 'add_tag', {
        tag: newTag.toLowerCase().replace(/\s+/g, '-'),
      })
      if (result.success) {
        toast.success('Tag added successfully')
        setNewTag('')
        setShowTagModal(false)
        await fetchOrder()
      } else {
        toast.error(result.error || 'Failed to add tag')
      }
    } catch (error) {
      toast.error('Failed to add tag')
    } finally {
      setActionLoading(null)
    }
  }

  // Remove tag
  const handleRemoveTag = async (tag: string) => {
    try {
      const result = await updateOrderAction(order?.orderId || resolvedParams.id, 'remove_tag', { tag })
      if (result.success) {
        toast.success('Tag removed')
        await fetchOrder()
      }
    } catch (error) {
      toast.error('Failed to remove tag')
    }
  }

  // Update shipping address
  const handleUpdateAddress = async () => {
    try {
      setActionLoading('address')
      const result = await updateOrderAction(order?.orderId || resolvedParams.id, 'update_shipping_address', {
        shippingAddress: editAddress,
        user: 'Admin',
      })
      if (result.success) {
        toast.success('Address updated successfully')
        setShowAddressModal(false)
        await fetchOrder()
      } else {
        toast.error(result.error || 'Failed to update address')
      }
    } catch (error) {
      toast.error('Failed to update address')
    } finally {
      setActionLoading(null)
    }
  }
      user: 'Admin',
    }, 'Address updated successfully')
    setShowAddressModal(false)
  }

  // Generate and print invoice
  const handlePrintInvoice = async () => {
    try {
      setActionLoading('print')
      // First generate invoice if not exists
      await fetch(`${BASE_URL}/api/admin/orders/${order?.orderId || resolvedParams.id}/invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: 'Admin' }),
      })
      
      // Get invoice data
      const response = await fetch(`${BASE_URL}/api/admin/orders/${order?.orderId || resolvedParams.id}/invoice`)
      const invoice = await response.json()
      
      // Open print window with invoice
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(generateInvoiceHTML(invoice))
        printWindow.document.close()
        printWindow.print()
      }
      toast.success('Invoice opened for printing')
    } catch (error) {
      toast.error('Failed to generate invoice')
    } finally {
      setActionLoading(null)
    }
  }

  // Send invoice email
  const handleSendInvoice = async () => {
    await handleAction('/email', 'POST', {
      type: 'invoice',
      user: 'Admin',
    }, 'Invoice sent to customer')
  }

  // Send email
  const handleSendEmail = async () => {
    await handleAction('/email', 'POST', {
      type: emailType,
      subject: customEmailSubject,
      customMessage: customEmailMessage,
      user: 'Admin',
    }, 'Email sent successfully')
    setShowEmailModal(false)
    setCustomEmailSubject('')
    setCustomEmailMessage('')
  }

  // Send WhatsApp (opens WhatsApp web)
  const handleSendWhatsApp = () => {
    if (!order?.customer?.phone) {
      toast.error('Customer phone number not available')
      return
    }
    const phone = order.customer.phone.replace(/\D/g, '')
    const message = encodeURIComponent(
      `Hi ${order.customer.name || order.customer.firstName || 'there'}! This is regarding your order ${order.orderId} from Gibbon Nutrition. How can we help you today?`
    )
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
    toast.success('WhatsApp opened')
  }

  // Copy to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  // Generate invoice HTML for printing
  const generateInvoiceHTML = (invoice: Record<string, unknown>) => {
    const inv = invoice as {
      invoiceNumber?: string
      date?: string
      company?: {
        name?: string
        address?: string
        city?: string
        state?: string
        pincode?: string
        gstin?: string
        phone?: string
        email?: string
      }
      customer?: {
        name?: string
        email?: string
        phone?: string
        address?: {
          address?: string
          address1?: string
          city?: string
          state?: string
          zipcode?: string
        }
      }
      items?: { name: string; quantity: number; price: number; total: number }[]
      subtotal?: number
      discount?: number
      shipping?: number
      taxes?: number
      total?: number
      payment?: { method?: string; status?: string; transactionId?: string }
    }
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${inv.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .company { font-weight: bold; font-size: 24px; color: #1B198F; }
          .invoice-title { font-size: 32px; color: #333; }
          .invoice-meta { color: #666; margin-top: 10px; }
          .addresses { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .address { width: 45%; }
          .address h3 { color: #1B198F; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background: #f5f5f5; padding: 12px; text-align: left; border-bottom: 2px solid #ddd; }
          td { padding: 12px; border-bottom: 1px solid #eee; }
          .totals { text-align: right; }
          .totals .row { display: flex; justify-content: flex-end; gap: 100px; margin: 5px 0; }
          .totals .total { font-size: 20px; font-weight: bold; color: #1B198F; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="company">${inv.company?.name || 'Gibbon Nutrition'}</div>
            <div class="invoice-meta">
              ${inv.company?.address || ''}<br>
              ${inv.company?.city || ''}, ${inv.company?.state || ''} ${inv.company?.pincode || ''}<br>
              GSTIN: ${inv.company?.gstin || 'N/A'}<br>
              ${inv.company?.phone || ''} | ${inv.company?.email || ''}
            </div>
          </div>
          <div style="text-align: right;">
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-meta">
              Invoice #: ${inv.invoiceNumber || 'N/A'}<br>
              Date: ${inv.date ? new Date(inv.date).toLocaleDateString('en-IN') : 'N/A'}<br>
              Order: ${order?.orderId || 'N/A'}
            </div>
          </div>
        </div>
        
        <div class="addresses">
          <div class="address">
            <h3>Bill To</h3>
            ${inv.customer?.name || 'Customer'}<br>
            ${inv.customer?.email || ''}<br>
            ${inv.customer?.phone || ''}<br>
            ${inv.customer?.address?.address || ''} ${inv.customer?.address?.address1 || ''}<br>
            ${inv.customer?.address?.city || ''}, ${inv.customer?.address?.state || ''} ${inv.customer?.address?.zipcode || ''}
          </div>
          <div class="address">
            <h3>Ship To</h3>
            ${order?.customer?.name || order?.customer?.firstName || 'Customer'}<br>
            ${order?.shippingAddress?.address || order?.shippingAddress?.address1 || ''}<br>
            ${order?.shippingAddress?.city || ''}, ${order?.shippingAddress?.state || ''} ${order?.shippingAddress?.zipcode || ''}
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${(inv.items || []).map((item: { name: string; quantity: number; price: number; total: number }) => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>₹${item.price?.toLocaleString()}</td>
                <td>₹${item.total?.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="totals">
          <div class="row"><span>Subtotal:</span><span>₹${inv.subtotal?.toLocaleString() || 0}</span></div>
          ${inv.discount ? `<div class="row"><span>Discount:</span><span>-₹${inv.discount?.toLocaleString()}</span></div>` : ''}
          <div class="row"><span>Shipping:</span><span>${inv.shipping === 0 ? 'Free' : `₹${inv.shipping?.toLocaleString()}`}</span></div>
          <div class="row"><span>Taxes:</span><span>₹${inv.taxes?.toLocaleString() || 0}</span></div>
          <div class="row total"><span>Total:</span><span>₹${inv.total?.toLocaleString() || 0}</span></div>
        </div>
        
        <div class="footer">
          Payment Method: ${inv.payment?.method?.toUpperCase() || 'N/A'} | 
          Status: ${inv.payment?.status?.toUpperCase() || 'N/A'}
          ${inv.payment?.transactionId ? ` | Transaction ID: ${inv.payment.transactionId}` : ''}
          <br><br>
          Thank you for your business!
        </div>
      </body>
      </html>
    `
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'processing': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'shipped': return 'bg-indigo-100 text-indigo-700 border-indigo-200'
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200'
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200'
      case 'refunded': return 'bg-orange-100 text-orange-700 border-orange-200'
      default: return 'bg-neutral-100 text-neutral-700 border-neutral-200'
    }
  }

  const getPaymentStatusColor = (status?: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'failed': return 'bg-red-100 text-red-700'
      case 'refunded': return 'bg-orange-100 text-orange-700'
      default: return 'bg-neutral-100 text-neutral-700'
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
      case 'email': return <Mail className="h-4 w-4" />
      case 'sms': return <Smartphone className="h-4 w-4" />
      case 'status': return <RefreshCw className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getRiskColor = (score?: string) => {
    switch (score) {
      case 'low': return 'bg-green-100 text-green-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'high': return 'bg-red-100 text-red-700'
      default: return 'bg-neutral-100 text-neutral-700'
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
        <p className="mt-2 text-neutral-500">The order you're looking for doesn't exist.</p>
        <Link href="/admin/orders" className="mt-4 inline-flex items-center gap-2 text-[#1B198F] hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </Link>
      </div>
    )
  }

  const timeline = order.timeline || []
  const customerName = order.customer?.name || `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 'Guest'

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
              {new Date(order.createdAt).toLocaleString()} 
              {order.assignedTo && ` • Assigned to ${order.assignedTo}`}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrintInvoice}
            disabled={!!actionLoading}
            className="flex items-center gap-2 rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700"
          >
            {actionLoading === 'print' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
            Print Invoice
          </button>
          <button
            onClick={handleSendInvoice}
            disabled={!!actionLoading}
            className="flex items-center gap-2 rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700"
          >
            {actionLoading === '/email' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send Invoice
          </button>
          {!order.fulfillment?.shipmentId && order.status !== 'cancelled' && order.status !== 'refunded' && (
            <button
              onClick={() => setShowShipmentModal(true)}
              className="flex items-center gap-2 rounded-xl bg-[#1B198F] px-4 py-2 text-sm font-medium text-white hover:bg-[#1B198F]/90"
            >
              <Truck className="h-4 w-4" /> Create Shipment
            </button>
          )}
        </div>
      </div>

      {/* SLA Timer */}
      {order.slaDeadline && new Date(order.slaDeadline) > new Date() && order.status === 'processing' && (
        <div className="flex items-center gap-3 rounded-xl bg-yellow-50 p-4 dark:bg-yellow-900/20">
          <Timer className="h-5 w-5 text-yellow-600" />
          <div>
            <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
              SLA Deadline: {new Date(order.slaDeadline).toLocaleString()}
            </p>
            <p className="text-xs text-yellow-600">Ship within the deadline to meet SLA</p>
          </div>
        </div>
      )}

      {/* Status Update Bar */}
      {!['cancelled', 'refunded', 'delivered'].includes(order.status) && (
        <div className="flex items-center gap-2 rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-800">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Update Status:</span>
          <div className="flex flex-wrap gap-2">
            {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusUpdate(status)}
                disabled={!!actionLoading || order.status === status}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-all ${
                  order.status === status
                    ? 'bg-[#1B198F] text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 disabled:opacity-50 dark:bg-neutral-700 dark:text-neutral-300'
                }`}
              >
                {status}
              </button>
            ))}
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
              <button
                onClick={() => copyToClipboard(order.customer?.email || '', 'Email')}
                className="text-neutral-400 hover:text-[#1B198F]"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1B198F] font-bold text-white">
                {customerName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-neutral-900 dark:text-white">{customerName}</p>
                <p className="text-sm text-neutral-500">
                  {order.customer?.totalOrders || 1} orders • ₹{(order.customer?.totalSpent || order.totalAmount).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              {order.customer?.email && (
                <a
                  href={`mailto:${order.customer.email}`}
                  className="flex items-center gap-2 text-neutral-600 hover:text-[#1B198F] dark:text-neutral-400"
                >
                  <Mail className="h-4 w-4" /> {order.customer.email}
                </a>
              )}
              {order.customer?.phone && (
                <a
                  href={`tel:${order.customer.phone}`}
                  className="flex items-center gap-2 text-neutral-600 hover:text-[#1B198F] dark:text-neutral-400"
                >
                  <Phone className="h-4 w-4" /> {order.customer.phone}
                </a>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-800">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-neutral-900 dark:text-white">Shipping Address</h3>
              <button
                onClick={() => {
                  setEditAddress({
                    address: order.shippingAddress?.address || '',
                    address1: order.shippingAddress?.address1 || '',
                    city: order.shippingAddress?.city || '',
                    state: order.shippingAddress?.state || '',
                    zipcode: order.shippingAddress?.zipcode || '',
                    country: order.shippingAddress?.country || 'India',
                  })
                  setShowAddressModal(true)
                }}
                className="text-neutral-400 hover:text-[#1B198F]"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              <p>{order.shippingAddress?.address || order.shippingAddress?.address1}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipcode}</p>
              <p>{order.shippingAddress?.country || 'India'}</p>
            </div>
          </div>

          {/* Tags */}
          <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-800">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-neutral-900 dark:text-white">Tags</h3>
              <button
                onClick={() => setShowTagModal(true)}
                className="text-neutral-400 hover:text-[#1B198F]"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(order.tags || []).map((tag: string) => (
                <span
                  key={tag}
                  className="group inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300"
                >
                  <Tag className="h-3 w-3" /> {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {(!order.tags || order.tags.length === 0) && (
                <p className="text-sm text-neutral-400">No tags</p>
              )}
            </div>
          </div>

          {/* Source */}
          <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-800">
            <h3 className="mb-3 font-semibold text-neutral-900 dark:text-white">Order Source</h3>
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <Globe className="h-4 w-4" />
              <span className="capitalize">{order.source || 'Website'}</span>
            </div>
          </div>
        </div>

        {/* Center Column - Order Items & Tabs */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items */}
          <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-800">
            <h3 className="mb-4 font-semibold text-neutral-900 dark:text-white">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 rounded-xl bg-neutral-50 p-3 dark:bg-neutral-900">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-neutral-200 dark:bg-neutral-700">
                      <Package className="h-8 w-8 text-neutral-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900 dark:text-white">{item.name}</p>
                    <p className="text-sm text-neutral-500">
                      {item.variant?.option1Value && `${item.variant.option1Value}`}
                      {item.variant?.option2Value && ` - ${item.variant.option2Value}`}
                      {item.sku && ` • SKU: ${item.sku}`}
                    </p>
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
                  <span>₹{(order.subtotal || order.totalAmount).toLocaleString()}</span>
                </div>
                {(order.discount ?? 0) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount {order.discountCode && `(${order.discountCode})`}</span>
                    <span>-₹{order.discount?.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-neutral-500">Shipping</span>
                  <span>{order.shipping === 0 ? 'Free' : `₹${order.shipping?.toLocaleString()}`}</span>
                </div>
                {(order.taxes ?? 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Taxes (GST)</span>
                    <span>₹{order.taxes?.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-semibold dark:border-neutral-700">
                  <span>Total</span>
                  <span>₹{order.totalAmount.toLocaleString()}</span>
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
                  {timeline.length === 0 ? (
                    <div className="py-8 text-center">
                      <History className="mx-auto h-8 w-8 text-neutral-300" />
                      <p className="mt-2 text-neutral-500">No timeline events yet</p>
                    </div>
                  ) : (
                    [...timeline].reverse().map((event, index) => (
                      <div key={event._id || index} className="flex gap-4">
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
                          {event.description && (
                            <p className="text-sm text-neutral-500">{event.description}</p>
                          )}
                          <div className="mt-1 flex items-center gap-2 text-xs text-neutral-400">
                            <Clock className="h-3 w-3" />
                            {new Date(event.createdAt).toLocaleString()}
                            {event.user && <span>• {event.user}</span>}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'payments' && (
                <div className="space-y-4">
                  <div className={`flex items-center justify-between rounded-xl p-4 ${
                    order.paymentDetails?.status === 'paid' ? 'bg-green-50 dark:bg-green-900/20' :
                    order.paymentDetails?.status === 'refunded' ? 'bg-orange-50 dark:bg-orange-900/20' :
                    'bg-yellow-50 dark:bg-yellow-900/20'
                  }`}>
                    <div className="flex items-center gap-3">
                      {order.paymentDetails?.status === 'paid' ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : order.paymentDetails?.status === 'refunded' ? (
                        <RotateCcw className="h-6 w-6 text-orange-600" />
                      ) : (
                        <Clock className="h-6 w-6 text-yellow-600" />
                      )}
                      <div>
                        <p className={`font-medium ${
                          order.paymentDetails?.status === 'paid' ? 'text-green-700 dark:text-green-400' :
                          order.paymentDetails?.status === 'refunded' ? 'text-orange-700 dark:text-orange-400' :
                          'text-yellow-700 dark:text-yellow-400'
                        }`}>
                          Payment {order.paymentDetails?.status?.charAt(0).toUpperCase()}{order.paymentDetails?.status?.slice(1)}
                        </p>
                        <p className={`text-sm ${
                          order.paymentDetails?.status === 'paid' ? 'text-green-600' :
                          order.paymentDetails?.status === 'refunded' ? 'text-orange-600' :
                          'text-yellow-600'
                        }`}>
                          via {order.paymentMethod?.toUpperCase()}
                          {order.paymentDetails?.transactionId && ` • ${order.paymentDetails.transactionId}`}
                        </p>
                      </div>
                    </div>
                    <p className={`text-lg font-bold ${
                      order.paymentDetails?.status === 'paid' ? 'text-green-700' :
                      order.paymentDetails?.status === 'refunded' ? 'text-orange-700' :
                      'text-yellow-700'
                    }`}>
                      ₹{order.totalAmount.toLocaleString()}
                    </p>
                  </div>

                  {order.paymentDetails?.refundId && (
                    <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
                      <p className="font-medium text-orange-700">Refund Processed</p>
                      <p className="text-sm text-orange-600">
                        Amount: ₹{order.paymentDetails.refundAmount?.toLocaleString()} • 
                        ID: {order.paymentDetails.refundId} • 
                        {order.paymentDetails.refundedAt && new Date(order.paymentDetails.refundedAt).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {order.paymentDetails?.status === 'paid' && !order.paymentDetails?.refundId && (
                    <button
                      onClick={() => setShowRefundModal(true)}
                      className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <RotateCcw className="h-4 w-4" /> Issue Refund
                    </button>
                  )}
                </div>
              )}

              {activeTab === 'fulfillment' && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Fulfillment Status</p>
                        <p className="text-sm capitalize text-neutral-500">{order.fulfillment?.status || 'unfulfilled'}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusColor(order.fulfillment?.status || 'unfulfilled')}`}>
                        {order.fulfillment?.status || 'unfulfilled'}
                      </span>
                    </div>
                  </div>

                  {order.fulfillment?.shipmentId && (
                    <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
                      <h4 className="mb-3 font-medium">Shipment Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Carrier</span>
                          <span>{order.fulfillment.carrier || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Tracking Number</span>
                          <button
                            onClick={() => copyToClipboard(order.fulfillment?.trackingNumber || '', 'Tracking number')}
                            className="flex items-center gap-1 text-[#1B198F] hover:underline"
                          >
                            {order.fulfillment.trackingNumber} <Copy className="h-3 w-3" />
                          </button>
                        </div>
                        {order.fulfillment.shippedAt && (
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Shipped At</span>
                            <span>{new Date(order.fulfillment.shippedAt).toLocaleString()}</span>
                          </div>
                        )}
                        {order.fulfillment.estimatedDelivery && (
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Est. Delivery</span>
                            <span>{new Date(order.fulfillment.estimatedDelivery).toLocaleDateString()}</span>
                          </div>
                        )}
                        {order.fulfillment.trackingUrl && (
                          <a
                            href={order.fulfillment.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 flex items-center gap-2 text-[#1B198F] hover:underline"
                          >
                            Track Shipment <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {!order.fulfillment?.shipmentId && order.status !== 'cancelled' && order.status !== 'refunded' && (
                    <button
                      onClick={() => setShowShipmentModal(true)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1B198F] py-3 font-medium text-white hover:bg-[#1B198F]/90"
                    >
                      <Truck className="h-5 w-5" /> Create Shipment
                    </button>
                  )}
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-4">
                  {(order.notes || []).length === 0 ? (
                    <div className="py-8 text-center">
                      <StickyNote className="mx-auto h-8 w-8 text-neutral-300" />
                      <p className="mt-2 text-neutral-500">No notes yet</p>
                    </div>
                  ) : (
                    [...(order.notes || [])].reverse().map((note, index) => (
                      <div key={note._id || index} className="rounded-xl bg-yellow-50 p-4 dark:bg-yellow-900/20">
                        <p className="text-sm text-neutral-700 dark:text-neutral-300">{note.content}</p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
                          <span>{note.author}</span>
                          <span>•</span>
                          <span>{new Date(note.createdAt).toLocaleString()}</span>
                          {note.isInternal && (
                            <>
                              <span>•</span>
                              <span className="rounded bg-neutral-200 px-1 dark:bg-neutral-700">Internal</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
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
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${getPaymentStatusColor(order.paymentDetails?.status)}`}>
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium capitalize">{order.paymentMethod || 'N/A'}</p>
                <p className="text-xs capitalize text-neutral-500">{order.paymentDetails?.status || 'Pending'}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-800">
            <h3 className="mb-3 font-semibold text-neutral-900 dark:text-white">Actions</h3>
            <div className="space-y-2">
              {!order.fulfillment?.shipmentId && order.status !== 'cancelled' && order.status !== 'refunded' && (
                <button
                  onClick={() => setShowShipmentModal(true)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  <Truck className="h-4 w-4 text-neutral-400" /> Create Shipment
                </button>
              )}
              <button
                onClick={handlePrintInvoice}
                disabled={!!actionLoading}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-neutral-100 disabled:opacity-50 dark:hover:bg-neutral-700"
              >
                <FileText className="h-4 w-4 text-neutral-400" /> Generate Invoice
              </button>
              <button
                onClick={handleSendWhatsApp}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
              >
                <MessageSquare className="h-4 w-4 text-neutral-400" /> Send WhatsApp
              </button>
              <button
                onClick={() => setShowEmailModal(true)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
              >
                <Mail className="h-4 w-4 text-neutral-400" /> Send Email
              </button>
              <button
                onClick={() => setShowReassignModal(true)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
              >
                <Users className="h-4 w-4 text-neutral-400" /> Reassign
              </button>
              {!['cancelled', 'refunded', 'delivered'].includes(order.status) && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4" /> Cancel Order
                </button>
              )}
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-800">
            <h3 className="mb-3 font-semibold text-neutral-900 dark:text-white">Risk Assessment</h3>
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${getRiskColor(order.riskScore)}`}>
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className={`font-medium capitalize ${
                  order.riskScore === 'low' ? 'text-green-600' :
                  order.riskScore === 'medium' ? 'text-yellow-600' :
                  order.riskScore === 'high' ? 'text-red-600' : 'text-neutral-600'
                }`}>
                  {order.riskScore || 'Low'} Risk
                </p>
                <p className="text-xs text-neutral-500">
                  {order.customer?.totalOrders && order.customer.totalOrders > 1 ? 'Repeat customer' : 'New customer'}
                  {order.paymentDetails?.status === 'paid' && ', verified payment'}
                </p>
              </div>
            </div>
            {order.riskReasons && order.riskReasons.length > 0 && (
              <div className="mt-3 space-y-1">
                {order.riskReasons.map((reason, i) => (
                  <p key={i} className="text-xs text-red-600">• {reason}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      
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
                  className="flex-1 rounded-xl border border-neutral-200 py-2 font-medium hover:bg-neutral-50 dark:border-neutral-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || !!actionLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1B198F] py-2 font-medium text-white disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Add Note
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shipment Modal */}
      <AnimatePresence>
        {showShipmentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowShipmentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-800"
            >
              <h3 className="mb-4 text-lg font-bold">Create Shipment</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Carrier / Courier</label>
                  <select
                    value={shipmentData.carrier}
                    onChange={(e) => setShipmentData({ ...shipmentData, carrier: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 p-3 outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-900"
                  >
                    <option value="">Select Carrier</option>
                    <option value="Shiprocket">Shiprocket</option>
                    <option value="Delhivery">Delhivery</option>
                    <option value="BlueDart">BlueDart</option>
                    <option value="DTDC">DTDC</option>
                    <option value="FedEx">FedEx</option>
                    <option value="Manual">Manual / Self Ship</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Tracking Number (Optional)</label>
                  <input
                    type="text"
                    value={shipmentData.trackingNumber}
                    onChange={(e) => setShipmentData({ ...shipmentData, trackingNumber: e.target.value })}
                    placeholder="Will be auto-generated if empty"
                    className="w-full rounded-xl border border-neutral-200 p-3 outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-900"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Shipping Method</label>
                  <select
                    value={shipmentData.shippingMethod}
                    onChange={(e) => setShipmentData({ ...shipmentData, shippingMethod: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 p-3 outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-900"
                  >
                    <option value="standard">Standard</option>
                    <option value="express">Express</option>
                    <option value="overnight">Overnight</option>
                    <option value="same_day">Same Day</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => setShowShipmentModal(false)}
                  className="flex-1 rounded-xl border border-neutral-200 py-2 font-medium hover:bg-neutral-50 dark:border-neutral-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateShipment}
                  disabled={!!actionLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1B198F] py-2 font-medium text-white disabled:opacity-50"
                >
                  {actionLoading === '/shipment' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
                  Create Shipment
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Refund Modal */}
      <AnimatePresence>
        {showRefundModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowRefundModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-800"
            >
              <h3 className="mb-4 text-lg font-bold">Issue Refund</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Refund Amount</label>
                  <input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    placeholder={`Max: ₹${order.totalAmount.toLocaleString()}`}
                    max={order.totalAmount}
                    className="w-full rounded-xl border border-neutral-200 p-3 outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-900"
                  />
                  <p className="mt-1 text-xs text-neutral-500">Leave empty for full refund</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Reason</label>
                  <textarea
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="Reason for refund..."
                    rows={3}
                    className="w-full rounded-xl border border-neutral-200 p-3 outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-900"
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="flex-1 rounded-xl border border-neutral-200 py-2 font-medium hover:bg-neutral-50 dark:border-neutral-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRefund}
                  disabled={!!actionLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-2 font-medium text-white disabled:opacity-50"
                >
                  {actionLoading === '/refund' ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                  Process Refund
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowCancelModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-800"
            >
              <h3 className="mb-4 text-lg font-bold text-red-600">Cancel Order</h3>
              <p className="mb-4 text-neutral-600 dark:text-neutral-400">
                Are you sure you want to cancel this order? This action cannot be undone.
              </p>
              <div>
                <label className="mb-1 block text-sm font-medium">Cancellation Reason</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Reason for cancellation..."
                  rows={3}
                  className="w-full rounded-xl border border-neutral-200 p-3 outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-900"
                />
              </div>
              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 rounded-xl border border-neutral-200 py-2 font-medium hover:bg-neutral-50 dark:border-neutral-700"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={!!actionLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-2 font-medium text-white disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                  Cancel Order
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reassign Modal */}
      <AnimatePresence>
        {showReassignModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowReassignModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-800"
            >
              <h3 className="mb-4 text-lg font-bold">Reassign Order</h3>
              <div>
                <label className="mb-1 block text-sm font-medium">Assign To</label>
                <input
                  type="text"
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  placeholder="Staff member name..."
                  className="w-full rounded-xl border border-neutral-200 p-3 outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-900"
                />
              </div>
              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => setShowReassignModal(false)}
                  className="flex-1 rounded-xl border border-neutral-200 py-2 font-medium hover:bg-neutral-50 dark:border-neutral-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReassign}
                  disabled={!newAssignee.trim() || !!actionLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1B198F] py-2 font-medium text-white disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Reassign
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tag Modal */}
      <AnimatePresence>
        {showTagModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowTagModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-800"
            >
              <h3 className="mb-4 text-lg font-bold">Add Tag</h3>
              <div>
                <label className="mb-1 block text-sm font-medium">Tag Name</label>
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="e.g., vip, urgent, gift..."
                  className="w-full rounded-xl border border-neutral-200 p-3 outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-900"
                />
              </div>
              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => setShowTagModal(false)}
                  className="flex-1 rounded-xl border border-neutral-200 py-2 font-medium hover:bg-neutral-50 dark:border-neutral-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTag}
                  disabled={!newTag.trim() || !!actionLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1B198F] py-2 font-medium text-white disabled:opacity-50"
                >
                  Add Tag
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Address Edit Modal */}
      <AnimatePresence>
        {showAddressModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowAddressModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-800"
            >
              <h3 className="mb-4 text-lg font-bold">Edit Shipping Address</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={editAddress.address}
                  onChange={(e) => setEditAddress({ ...editAddress, address: e.target.value })}
                  placeholder="Address Line 1"
                  className="w-full rounded-xl border border-neutral-200 p-3 outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-900"
                />
                <input
                  type="text"
                  value={editAddress.address1}
                  onChange={(e) => setEditAddress({ ...editAddress, address1: e.target.value })}
                  placeholder="Address Line 2 (Optional)"
                  className="w-full rounded-xl border border-neutral-200 p-3 outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-900"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={editAddress.city}
                    onChange={(e) => setEditAddress({ ...editAddress, city: e.target.value })}
                    placeholder="City"
                    className="w-full rounded-xl border border-neutral-200 p-3 outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-900"
                  />
                  <input
                    type="text"
                    value={editAddress.state}
                    onChange={(e) => setEditAddress({ ...editAddress, state: e.target.value })}
                    placeholder="State"
                    className="w-full rounded-xl border border-neutral-200 p-3 outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={editAddress.zipcode}
                    onChange={(e) => setEditAddress({ ...editAddress, zipcode: e.target.value })}
                    placeholder="Pincode"
                    className="w-full rounded-xl border border-neutral-200 p-3 outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-900"
                  />
                  <input
                    type="text"
                    value={editAddress.country}
                    onChange={(e) => setEditAddress({ ...editAddress, country: e.target.value })}
                    placeholder="Country"
                    className="w-full rounded-xl border border-neutral-200 p-3 outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-900"
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1 rounded-xl border border-neutral-200 py-2 font-medium hover:bg-neutral-50 dark:border-neutral-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateAddress}
                  disabled={!!actionLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1B198F] py-2 font-medium text-white disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Update Address
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email Modal */}
      <AnimatePresence>
        {showEmailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowEmailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-800"
            >
              <h3 className="mb-4 text-lg font-bold">Send Email</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Email Type</label>
                  <select
                    value={emailType}
                    onChange={(e) => setEmailType(e.target.value as typeof emailType)}
                    className="w-full rounded-xl border border-neutral-200 p-3 outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-900"
                  >
                    <option value="shipping_update">Shipping Update</option>
                    <option value="delivery_confirmation">Delivery Confirmation</option>
                    <option value="invoice">Invoice</option>
                    <option value="custom">Custom Message</option>
                  </select>
                </div>
                {emailType === 'custom' && (
                  <>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Subject</label>
                      <input
                        type="text"
                        value={customEmailSubject}
                        onChange={(e) => setCustomEmailSubject(e.target.value)}
                        placeholder="Email subject..."
                        className="w-full rounded-xl border border-neutral-200 p-3 outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Message</label>
                      <textarea
                        value={customEmailMessage}
                        onChange={(e) => setCustomEmailMessage(e.target.value)}
                        placeholder="Your message..."
                        rows={4}
                        className="w-full rounded-xl border border-neutral-200 p-3 outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-900"
                      />
                    </div>
                  </>
                )}
                <p className="text-sm text-neutral-500">
                  Email will be sent to: {order.customer?.email || 'No email available'}
                </p>
              </div>
              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="flex-1 rounded-xl border border-neutral-200 py-2 font-medium hover:bg-neutral-50 dark:border-neutral-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={!!actionLoading || !order.customer?.email}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1B198F] py-2 font-medium text-white disabled:opacity-50"
                >
                  {actionLoading === '/email' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send Email
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
