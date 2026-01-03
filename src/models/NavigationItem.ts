import mongoose, { Document, Schema } from 'mongoose'

export interface INavigationItem extends Document {
  name: string
  href: string
  slug: string
  order: number
  isActive: boolean
  type: 'category' | 'subcategory' | 'link' | 'megamenu'
  parent: mongoose.Types.ObjectId | null
  icon?: string
  badge?: string
  badgeColor?: string
  description?: string
  image?: {
    src: string
    alt: string
  }
  featuredProducts?: mongoose.Types.ObjectId[]
  showInHeader: boolean
  showInFooter: boolean
  showInMobile: boolean
  openInNewTab: boolean
  cssClass?: string
  children?: INavigationItem[]
  createdAt: Date
  updatedAt: Date
}

const NavigationItemSchema = new Schema<INavigationItem>(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true,
      maxlength: 100
    },
    href: { 
      type: String, 
      required: true, 
      trim: true 
    },
    slug: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true,
      lowercase: true
    },
    order: { 
      type: Number, 
      default: 0 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    type: { 
      type: String, 
      enum: ['category', 'subcategory', 'link', 'megamenu'],
      default: 'link'
    },
    parent: { 
      type: Schema.Types.ObjectId, 
      ref: 'NavigationItem',
      default: null
    },
    icon: { 
      type: String,
      trim: true
    },
    badge: { 
      type: String,
      trim: true,
      maxlength: 20
    },
    badgeColor: {
      type: String,
      default: '#1B198F'
    },
    description: { 
      type: String,
      trim: true,
      maxlength: 200
    },
    image: {
      src: { type: String },
      alt: { type: String }
    },
    featuredProducts: [{
      type: Schema.Types.ObjectId,
      ref: 'Product'
    }],
    showInHeader: { 
      type: Boolean, 
      default: true 
    },
    showInFooter: { 
      type: Boolean, 
      default: false 
    },
    showInMobile: { 
      type: Boolean, 
      default: true 
    },
    openInNewTab: { 
      type: Boolean, 
      default: false 
    },
    cssClass: {
      type: String,
      trim: true
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// Virtual for children
NavigationItemSchema.virtual('children', {
  ref: 'NavigationItem',
  localField: '_id',
  foreignField: 'parent'
})

// Index for faster queries
NavigationItemSchema.index({ parent: 1, order: 1 })
NavigationItemSchema.index({ isActive: 1, showInHeader: 1 })
NavigationItemSchema.index({ slug: 1 })

// Pre-save hook to generate slug
NavigationItemSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }
  next()
})

export default mongoose.models.NavigationItem || mongoose.model<INavigationItem>('NavigationItem', NavigationItemSchema)
