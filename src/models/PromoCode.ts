import mongoose, { Document, Schema, model, models } from 'mongoose'

export interface IPromoCode extends Document {
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minOrderAmount?: number
  usageLimit?: number
  usageCount: number
  expiresAt?: Date
  isActive: boolean
  appliesTo: 'all' | 'products' | 'categories'
  productIds?: string[]
  categoryNames?: string[]
}

const PromoCodeSchema = new Schema<IPromoCode>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0 },
    usageLimit: { type: Number },
    usageCount: { type: Number, default: 0 },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
    appliesTo: { type: String, enum: ['all', 'products', 'categories'], default: 'all' },
    productIds: [{ type: String }],
    categoryNames: [{ type: String }],
  },
  { timestamps: true }
)

const PromoCode = models.PromoCode || model<IPromoCode>('PromoCode', PromoCodeSchema)

export default PromoCode