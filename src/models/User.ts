import mongoose, { Document, Schema } from 'mongoose'

export interface IWishlistItem {
  productId: string
  productName: string
  flavours: string[]
  image: string
  price: number
  ratings: number
  numberOfRatings: number
}

export interface IReview {
  status: 'submitted' | 'pending'
  review: string
}

export interface IAddress {
  billing_address_type: 'home' | 'office' | 'other'
  billing_customer_name: string
  billing_last_name: string
  billing_addressLine: string
  billing_city: string
  billing_pincode: string
  billing_state: string
  billing_country: string
}

export interface IOrderItem {
  orderId: string
  name: string
  quantity: number
  price: number
  productId: string
  productName: string
  review: IReview
}

export interface IWalletTransaction {
  type: 'credit' | 'debit'
  points: number
  description?: string
  referenceId?: Schema.Types.ObjectId
  balanceAfter: number
  createdAt: Date
  updatedAt: Date
}

export interface IWallet {
  points: number
  transactions: IWalletTransaction[]
  createdAt: Date
  updatedAt: Date
}

export interface IUser extends Document {
  clerkId: string
  billing_fullname: string
  email: string
  billing_phone: string
  billing_customer_dob: Date
  billing_customer_gender: 'male' | 'female' | 'other'
  billing_address: IAddress[]
  wishlist: IWishlistItem[]
  orders: IOrderItem[]
  wallet: IWallet
  createdAt: Date
  updatedAt: Date
}

const WishlistItemSchema: Schema = new Schema({
  productId: { type: String, required: false },
  productName: { type: String, required: false },
  flavours: [{ type: String }],
  image: { type: String, required: false },
  price: { type: Number, required: false },
  ratings: { type: Number, required: false },
  numberOfRatings: { type: Number, required: false },
})

const ReviewSchema: Schema = new Schema({
  status: { type: String, enum: ['submitted', 'pending'], required: false },
  review: { type: String, required: false },
})

const OrderItemSchema: Schema = new Schema({
  orderId: { type: String, required: false },
  name: { type: String, required: false },
  quantity: { type: Number, required: false },
  price: { type: Number, required: false },
  productId: { type: String, required: false },
  productName: { type: String, required: false },
  review: ReviewSchema,
})

const WalletTransactionSchema: Schema = new Schema(
  {
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true,
    },
    points: {
      type: Number,
      required: true,
      min: 1,
    },
    description: {
      type: String,
      trim: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order', // optional: can reference any entity
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
)

const WalletSchema = new Schema(
  {
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
    transactions: [WalletTransactionSchema],
  },
  { timestamps: true, _id: false }
)

const AddressSchema = new Schema(
  {
    billing_address_type: {
      type: String,
      enum: ['home', 'office', 'other'],
      required: false,
    },
    billing_customer_name: { type: String, required: false, trim: true },
    billing_last_name: { type: String, required: false, trim: true },
    billing_addressLine: { type: String, required: false, trim: true },
    billing_city: { type: String, required: false, trim: true },
    billing_pincode: { type: String, required: false, trim: true },
    billing_state: { type: String, required: false, trim: true },
    billing_country: { type: String, required: false, trim: true },
  },
  { _id: false }
)

const UserSchema = new Schema(
  {
    clerkId: { type: String, required: false, unique: true },
    billing_fullname: { type: String, required: false, trim: true },
    email: { type: String, required: false, unique: true, trim: true, lowercase: true },
    billing_customer_dob: { type: Date },
    billing_phone: { type: String, required: false, trim: true },
    billing_customer_gender: { type: String, enum: ['male', 'female', 'other'], required: false },
    billing_address: {
      type: [AddressSchema],
      default: [],
      // validate: (val: IAddress[]) => val.length > 0,
    },
    wishlist: [WishlistItemSchema],
    orders: [OrderItemSchema],
    wallet: {
      type: WalletSchema,
      default: () => ({ points: 0, transactions: [] }),
    },
  },
  { timestamps: true }
)

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
