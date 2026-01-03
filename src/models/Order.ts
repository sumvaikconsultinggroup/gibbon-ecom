import mongoose, { Document, Schema } from 'mongoose'

export interface IOrderItem {
  productId: mongoose.Types.ObjectId
  variantId?: string
  title: string
  variantTitle?: string
  sku?: string
  quantity: number
  price: number
  compareAtPrice?: number
  image?: string
  weight?: number
}

export interface IOrderCustomer {
  userId?: mongoose.Types.ObjectId
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  acceptsMarketing?: boolean
}

export interface IOrderAddress {
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  country: string
  zipCode: string
  phone?: string
}

export interface IPaymentDetails {
  method: string
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded'
  transactionId?: string
  gateway?: string
  amount: number
  paidAt?: Date
}

export interface IShippingDetails {
  method?: string
  carrier?: string
  trackingNumber?: string
  trackingUrl?: string
  estimatedDelivery?: Date
  shippedAt?: Date
  deliveredAt?: Date
}

export interface IOrderNote {
  id: string
  content: string
  author: string
  isInternal: boolean
  createdAt: Date
}

export interface ITimelineEvent {
  id: string
  event: string
  description: string
  user?: string
  createdAt: Date
}

export interface IOrder extends Document {
  orderId: string
  orderNumber: string
  
  // Customer
  customer: IOrderCustomer
  
  // Items
  items: IOrderItem[]
  
  // Addresses
  shippingAddress: IOrderAddress
  billingAddress?: IOrderAddress
  
  // Pricing
  subtotal: number
  discount: number
  discountCode?: string
  shippingCost: number
  tax: number
  totalAmount: number
  currency: string
  
  // Status
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  
  // Payment
  paymentDetails: IPaymentDetails
  
  // Shipping
  shippingDetails?: IShippingDetails
  
  // Fulfillment
  fulfillmentStatus: 'unfulfilled' | 'partial' | 'fulfilled'
  
  // Notes & Timeline
  notes?: IOrderNote[]
  timeline?: ITimelineEvent[]
  
  // Assignment
  assignedTo?: string
  
  // Flags
  isArchived: boolean
  requiresShipping: boolean
  
  // Metadata
  source: string
  tags?: string[]
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}

const OrderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  variantId: String,
  title: { type: String, required: true },
  variantTitle: String,
  sku: String,
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  compareAtPrice: Number,
  image: String,
  weight: Number
}, { _id: false })

const OrderCustomerSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  email: { type: String, required: true },
  firstName: String,
  lastName: String,
  phone: String,
  acceptsMarketing: { type: Boolean, default: false }
}, { _id: false })

const AddressSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  company: String,
  address1: { type: String, required: true },
  address2: String,
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true, default: 'India' },
  zipCode: { type: String, required: true },
  phone: String
}, { _id: false })

const PaymentDetailsSchema = new Schema({
  method: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  transactionId: String,
  gateway: String,
  amount: { type: Number, required: true },
  paidAt: Date
}, { _id: false })

const ShippingDetailsSchema = new Schema({
  method: String,
  carrier: String,
  trackingNumber: String,
  trackingUrl: String,
  estimatedDelivery: Date,
  shippedAt: Date,
  deliveredAt: Date
}, { _id: false })

const OrderNoteSchema = new Schema({
  id: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  isInternal: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: false })

const TimelineEventSchema = new Schema({
  id: { type: String, required: true },
  event: { type: String, required: true },
  description: String,
  user: String,
  createdAt: { type: Date, default: Date.now }
}, { _id: false })

const OrderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true },
    orderNumber: { type: String, required: true },
    
    customer: { type: OrderCustomerSchema, required: true },
    items: [OrderItemSchema],
    
    shippingAddress: { type: AddressSchema, required: true },
    billingAddress: AddressSchema,
    
    subtotal: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 },
    discountCode: String,
    shippingCost: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending'
    },
    
    paymentDetails: { type: PaymentDetailsSchema, required: true },
    shippingDetails: ShippingDetailsSchema,
    
    fulfillmentStatus: {
      type: String,
      enum: ['unfulfilled', 'partial', 'fulfilled'],
      default: 'unfulfilled'
    },
    
    notes: [OrderNoteSchema],
    timeline: [TimelineEventSchema],
    
    assignedTo: String,
    
    isArchived: { type: Boolean, default: false },
    requiresShipping: { type: Boolean, default: true },
    
    source: { type: String, default: 'web' },
    tags: [String]
  },
  { timestamps: true }
)

// Indexes
OrderSchema.index({ orderId: 1 }, { unique: true })
OrderSchema.index({ orderNumber: 1 })
OrderSchema.index({ 'customer.email': 1 })
OrderSchema.index({ status: 1 })
OrderSchema.index({ 'paymentDetails.status': 1 })
OrderSchema.index({ createdAt: -1 })
OrderSchema.index({ totalAmount: 1 })

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)
