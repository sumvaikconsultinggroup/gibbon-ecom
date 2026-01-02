import { Document, Schema, model, models } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IAdminUser extends Document {
  email: string
  password: string
  name: string
  role: 'owner' | 'admin' | 'staff'
  permissions: string[]
  avatar?: string
  isActive: boolean
  lastLogin?: Date
  invitedBy?: string
  inviteToken?: string
  inviteExpires?: Date
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const adminUserSchema = new Schema<IAdminUser>(
  {
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true,
      trim: true,
      index: true 
    },
    password: { 
      type: String, 
      required: true,
      select: false // Don't include password by default in queries
    },
    name: { 
      type: String, 
      required: true,
      trim: true
    },
    role: { 
      type: String, 
      enum: ['owner', 'admin', 'staff'], 
      default: 'staff' 
    },
    permissions: [{
      type: String,
      enum: [
        'products.view', 'products.create', 'products.edit', 'products.delete',
        'orders.view', 'orders.edit', 'orders.fulfill',
        'customers.view', 'customers.edit',
        'discounts.view', 'discounts.create', 'discounts.edit', 'discounts.delete',
        'analytics.view',
        'settings.view', 'settings.edit',
        'staff.view', 'staff.invite', 'staff.edit', 'staff.delete'
      ]
    }],
    avatar: String,
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
    invitedBy: String,
    inviteToken: String,
    inviteExpires: Date,
  },
  { timestamps: true }
)

// Hash password before saving
adminUserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  const salt = await bcrypt.genSalt(12)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Compare password method
adminUserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

// Default permissions by role
export const DEFAULT_PERMISSIONS = {
  owner: [
    'products.view', 'products.create', 'products.edit', 'products.delete',
    'orders.view', 'orders.edit', 'orders.fulfill',
    'customers.view', 'customers.edit',
    'discounts.view', 'discounts.create', 'discounts.edit', 'discounts.delete',
    'analytics.view',
    'settings.view', 'settings.edit',
    'staff.view', 'staff.invite', 'staff.edit', 'staff.delete'
  ],
  admin: [
    'products.view', 'products.create', 'products.edit', 'products.delete',
    'orders.view', 'orders.edit', 'orders.fulfill',
    'customers.view', 'customers.edit',
    'discounts.view', 'discounts.create', 'discounts.edit', 'discounts.delete',
    'analytics.view',
    'settings.view',
    'staff.view'
  ],
  staff: [
    'products.view',
    'orders.view',
    'customers.view',
    'discounts.view',
  ]
}

const AdminUser = models?.AdminUser || model<IAdminUser>('AdminUser', adminUserSchema)

export default AdminUser
