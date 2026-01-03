import mongoose from 'mongoose'

// Timeline event schema for order history
const timelineEventSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['created', 'payment', 'status', 'fulfillment', 'shipping', 'delivery', 'refund', 'note', 'email', 'sms'],
    required: true
  },
  title: { type: String, required: true },
  description: String,
  user: String, // Who performed the action
  metadata: mongoose.Schema.Types.Mixed, // Additional data
}, { timestamps: true })

// Order note schema
const orderNoteSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: String, required: true },
  isInternal: { type: Boolean, default: true }, // Internal note or sent to customer
}, { timestamps: true })

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    customer: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
      totalOrders: { type: Number, default: 1 },
      totalSpent: { type: Number, default: 0 },
    },
    items: [
      {
        productId: String,
        name: String,
        quantity: Number,
        price: Number,
        sku: String,
        variant: {
          option1Value: String,
          option2Value: String,
          option3Value: String,
        },
        imageUrl: String,
      },
    ],
    shippingAddress: {
      address: String,
      address1: String,
      city: String,
      state: String,
      country: String,
      zipcode: String,
    },
    billingAddress: {
      address: String,
      address1: String,
      city: String,
      state: String,
      country: String,
      zipcode: String,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    subtotal: Number,
    discount: Number,
    discountCode: String,
    shipping: Number,
    taxes: Number,
    paymentMethod: {
      type: String,
      enum: ['cod', 'payu', 'razorpay', 'stripe'],
      default: 'cod',
    },
    paymentDetails: {
      transactionId: String,
      status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
      paidAt: Date,
      gateway: String,
      refundId: String,
      refundedAt: Date,
      refundAmount: Number,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
    },
    // Fulfillment tracking
    fulfillment: {
      status: { type: String, enum: ['unfulfilled', 'partial', 'fulfilled', 'returned'], default: 'unfulfilled' },
      shipmentId: String,
      carrier: String,
      trackingNumber: String,
      trackingUrl: String,
      shippedAt: Date,
      deliveredAt: Date,
      estimatedDelivery: Date,
    },
    // Timeline/Activity log
    timeline: [timelineEventSchema],
    // Order notes (internal and customer-facing)
    notes: [orderNoteSchema],
    // Tags for organization
    tags: [String],
    // Staff assignment
    assignedTo: String,
    // SLA tracking
    slaDeadline: Date,
    // Risk assessment
    riskScore: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    riskReasons: [String],
    // Invoice
    invoiceNumber: String,
    invoiceUrl: String,
    invoiceGeneratedAt: Date,
    // Source
    source: { type: String, default: 'website' }, // website, mobile, pos, marketplace
    // IP and metadata
    ipAddress: String,
    userAgent: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
)

// Indexes for performance
orderSchema.index({ status: 1, createdAt: -1 })
orderSchema.index({ 'customer.email': 1 })
orderSchema.index({ 'paymentDetails.status': 1 })
orderSchema.index({ assignedTo: 1 })
orderSchema.index({ tags: 1 })

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema)

export default Order
