
import { Document, Schema, model, models } from 'mongoose'





/* ------------------------------- Review Types ------------------------------ */

 export interface IReview {
  star: number
  reviewerName: string
  reviewDescription: string
  image?: string
}



/* ------------------------------- Variant Types ------------------------------ */
export interface IVariantImage {
  src: string
  position: number
  altText?: string
  isPrimary: boolean
}

export interface IVariant {
  option1Value: string
  option2Value?: string
  option3Value?: string
  sku?: string
  grams?: number
  inventoryQty?: number
  inventoryPolicy?: 'deny' | 'continue'
  price: number
  compareAtPrice?: number
  requiresShipping?: boolean
  taxable?: boolean
  barcode?: string
  image?: string // Legacy field - primary image URL
  images?: IVariantImage[] // New: Multiple images per variant
  weightUnit?: string
  taxCode?: string
  costPerItem?: number
  // Inventory tracking
  inventoryItemId?: string
  inventoryManagement?: 'shopify' | 'manual' | 'none'
  // Location-based inventory
  inventoryLocations?: {
    locationId: string
    locationName: string
    available: number
    reserved: number
    incoming: number
    damaged: number
  }[]
}

/* ------------------------------- Product Types ------------------------------ */
export interface IProduct extends Document {
  handle: string
  title: string
  bodyHtml?: string
  vendor?: string
  productCategory?: string
  type?: string
  tags?: string[]
  published?: boolean
  options?: { name: string; values: string[] }[]
  variants?: IVariant[]
  images?: { src: string; position?: number; altText?: string }[]
  seo?: { title?: string; description?: string }
  giftCard?: boolean
  ratingCount?: number
  status?: 'active' | 'draft' | 'archived'
  fulfillmentService?: string
  inventoryTracker?: string
  reviews?: IReview[]
  isDeleted?: boolean
}

/* ------------------------------- Variant Image Schema ------------------------------ */
const variantImageSchema = new Schema({
  src: { type: String, required: true },
  position: { type: Number, default: 0 },
  altText: String,
  isPrimary: { type: Boolean, default: false },
}, { _id: false })

/* ------------------------------- Inventory Location Schema ------------------------------ */
const inventoryLocationSchema = new Schema({
  locationId: { type: String, required: true },
  locationName: { type: String, required: true },
  available: { type: Number, default: 0 },
  reserved: { type: Number, default: 0 },
  incoming: { type: Number, default: 0 },
  damaged: { type: Number, default: 0 },
}, { _id: false })

/* ------------------------------- Variant Schema ------------------------------ */
const variantSchema = new Schema<IVariant>(
  {
    option1Value: { type: String, required: true },
    option2Value: String,
    option3Value: String,
    sku: String,
    grams: Number,
    inventoryQty: { type: Number, default: 0 },
    inventoryPolicy: {
      type: String,
      enum: ['deny', 'continue'],
      default: 'deny',
    },
    price: { type: Number, required: true },
    compareAtPrice: Number,
    requiresShipping: { type: Boolean, default: true },
    taxable: { type: Boolean, default: true },
    barcode: String,
    image: String, // Legacy field - primary image URL
    images: [variantImageSchema], // New: Multiple images per variant
    weightUnit: { type: String, default: 'kg' },
    taxCode: String,
    costPerItem: Number,
    // Inventory tracking
    inventoryItemId: String,
    inventoryManagement: {
      type: String,
      enum: ['shopify', 'manual', 'none'],
      default: 'manual',
    },
    inventoryLocations: [inventoryLocationSchema],
  },
  { _id: true }
)


/* ------------------------------- Review Schema ------------------------------ */
const reviewSchema = new Schema<IReview>(
  {
    star: { 
      type: Number, 
      required: true, 
      min: 1, 
      max: 5 
    },
    reviewerName: { type: String, required: true },
    reviewDescription: { type: String, required: true },
    image: String,
  },
  { _id: true, versionKey: false, timestamps: true }
)



/* ------------------------------- Product Schema ------------------------------ */
const productSchema = new Schema<IProduct>(
  {
    handle: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    bodyHtml: String,
    vendor: String,
    productCategory: String,
    type: String,
    tags: [String],
    published: { type: Boolean, default: true },

    options: [{ name: String, values: [String] }],
    variants: [variantSchema],

    images: [{ src: String, position: Number, altText: String }],

    seo: { title: String, description: String },

    giftCard: { type: Boolean, default: false },
    ratingCount: Number,
    status: {
      type: String,
      enum: ['active', 'draft', 'archived'],
      default: 'active',
    },

    fulfillmentService: { type: String, default: 'manual' },
    inventoryTracker: { type: String, default: 'shopify' },
    reviews: [reviewSchema],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
)

/* ------------------------------- Indexes ------------------------------ */
productSchema.index({ vendor: 1 })
productSchema.index({ status: 1 })
productSchema.index({ published: 1 })

/* ------------------------------- Model Export ------------------------------ */
const Product = models?.Product || model<IProduct>('Product', productSchema)

export default Product
