import { Document, Schema, model, models } from 'mongoose'

export interface IStoreSettings extends Document {
  storeId: string
  
  // Store Basic Info
  storeName: string
  storeEmail: string
  storePhone: string
  storeAddress: string
  
  // Regional Settings
  currency: string
  timezone: string
  
  // Store Logo
  logoUrl?: string
  
  createdAt: Date
  updatedAt: Date
}

const StoreSettingsSchema = new Schema<IStoreSettings>(
  {
    storeId: { type: String, required: true, unique: true, index: true, default: 'default' },
    
    // Store Basic Info
    storeName: { type: String, default: 'Gibbon Nutrition' },
    storeEmail: { type: String, default: 'support@gibbonnutrition.com' },
    storePhone: { type: String, default: '+91 98765 43210' },
    storeAddress: { type: String, default: 'Mumbai, Maharashtra, India' },
    
    // Regional Settings
    currency: { type: String, default: 'INR' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    
    // Store Logo
    logoUrl: { type: String, default: '/GibbonLogoEccom.png' },
  },
  { timestamps: true, versionKey: false }
)

const StoreSettings = models?.StoreSettings || model<IStoreSettings>('StoreSettings', StoreSettingsSchema)

export default StoreSettings
