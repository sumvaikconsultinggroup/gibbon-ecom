import { Document, Schema, model, models } from 'mongoose'

export interface ICollection extends Document {
  handle: string
  title: string
  description?: string
  image?: string
  seo?: {
    title?: string
    description?: string
  }
  sortOrder?: 'manual' | 'best-selling' | 'title-asc' | 'title-desc' | 'price-asc' | 'price-desc' | 'date-asc' | 'date-desc'
  // Conditions for automatic collections
  collectionType: 'manual' | 'automated'
  conditions?: {
    field: 'title' | 'type' | 'vendor' | 'tag' | 'price' | 'compare_at_price' | 'inventory_stock' | 'category'
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'starts_with' | 'ends_with' | 'contains' | 'not_contains'
    value: string
  }[]
  conditionMatch: 'all' | 'any'
  // Manual product selection
  productHandles?: string[]
  // Display settings
  published: boolean
  publishedAt?: Date
  template?: string
  // Metadata
  isDeleted?: boolean
  createdAt: Date
  updatedAt: Date
}

const CollectionSchema = new Schema<ICollection>(
  {
    handle: { 
      type: String, 
      required: true, 
      unique: true, 
      index: true,
      lowercase: true,
      trim: true
    },
    title: { 
      type: String, 
      required: true,
      trim: true
    },
    description: String,
    image: String,
    seo: {
      title: String,
      description: String,
    },
    sortOrder: {
      type: String,
      enum: ['manual', 'best-selling', 'title-asc', 'title-desc', 'price-asc', 'price-desc', 'date-asc', 'date-desc'],
      default: 'manual'
    },
    collectionType: {
      type: String,
      enum: ['manual', 'automated'],
      default: 'manual'
    },
    conditions: [{
      field: {
        type: String,
        enum: ['title', 'type', 'vendor', 'tag', 'price', 'compare_at_price', 'inventory_stock', 'category']
      },
      operator: {
        type: String,
        enum: ['equals', 'not_equals', 'greater_than', 'less_than', 'starts_with', 'ends_with', 'contains', 'not_contains']
      },
      value: String
    }],
    conditionMatch: {
      type: String,
      enum: ['all', 'any'],
      default: 'all'
    },
    productHandles: [String],
    published: { type: Boolean, default: false },
    publishedAt: Date,
    template: String,
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
)

// Indexes
CollectionSchema.index({ published: 1 })
CollectionSchema.index({ 'productHandles': 1 })

const Collection = models?.Collection || model<ICollection>('Collection', CollectionSchema)

export default Collection
