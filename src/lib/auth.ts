import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import connectDb from '@/lib/mongodb'
import AdminUser, { IAdminUser } from '@/models/AdminUser'

const JWT_SECRET = process.env.JWT_SECRET || 'gibbon-admin-secret-key-change-in-production'
const TOKEN_EXPIRY = '7d'

export interface TokenPayload {
  userId: string
  email: string
  role: string
}

export function generateToken(user: IAdminUser): string {
  const payload: TokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<IAdminUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')?.value
    
    if (!token) return null
    
    const payload = verifyToken(token)
    if (!payload) return null
    
    await connectDb()
    const user = await AdminUser.findById(payload.userId).select('-password')
    
    if (!user || !user.isActive) return null
    
    return user
  } catch {
    return null
  }
}

export async function requireAuth(): Promise<IAdminUser> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export function hasPermission(user: IAdminUser, permission: string): boolean {
  if (user.role === 'owner') return true
  return user.permissions.includes(permission)
}

export function generateInviteToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}
