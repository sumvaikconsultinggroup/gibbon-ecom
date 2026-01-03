import User from '@/models/User'
import { connectToDB } from '@/utils/db'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'gibbon-user-secret-key-change-in-production'

async function getUserFromToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get('user_token')?.value
  
  if (!token) return null
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }
    return decoded
  } catch {
    return null
  }
}

export async function GET() {
  try {
    const authUser = await getUserFromToken()
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDB()

    const projection = {
      firstName: 1,
      lastName: 1,
      billing_fullname: 1,
      email: 1,
      billing_phone: 1,
      billing_customer_gender: 1,
      billing_customer_dob: 1,
      billing_address: 1,
      wishlist: 1,
      orders: 1,
      wallet: 1,
      createdAt: 1,
      updatedAt: 1,
    }

    const user = await User.findById(authUser.userId, projection).lean()
    return NextResponse.json(user ? [user] : [])
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}


function normalizePhone(phone: string): string {
  if (!phone) return ''

  let cleaned = phone.replace(/[^\d+]/g, '')

  // already international format
  if (cleaned.startsWith('+')) return cleaned

  // remove leading zeros
  cleaned = cleaned.replace(/^0+/, '')

  // if starts with 91 and length 12 -> assume correct
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return `+${cleaned}`
  }

  // fallback → Indian number
  return `+91${cleaned}`
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getUserFromToken()
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDB()
    const body = await req.json()

    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const {
      billing_fullname,
      email,
      billing_phone,
      billing_customer_dob,
      billing_customer_gender,
      billing_address = [],
    } = body

    const dob = new Date(billing_customer_dob)
    if (billing_customer_dob && isNaN(dob.getTime())) {
      return NextResponse.json({ error: 'Invalid DOB format' }, { status: 400 })
    }

    // Update existing user profile
    const user = await User.findByIdAndUpdate(
      authUser.userId,
      {
        billing_fullname,
        email: email || authUser.email,
        billing_phone: normalizePhone(billing_phone),
        billing_customer_dob: billing_customer_dob ? dob : undefined,
        billing_customer_gender,
        billing_address,
      },
      { new: true }
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(
      {
        message: 'User profile updated successfully',
        user: {
          id: user._id,
          billing_fullname: user.billing_fullname,
          email: user.email,
          billing_phone: user.billing_phone,
          billing_customer_gender: user.billing_customer_gender,
          billing_customer_dob: user.billing_customer_dob,
          billing_address: user.billing_address,
          wallet: user.wallet,
          createdAt: user.createdAt,
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error updating user:', error)

    if (error?.code === 11000) {
      if (error.keyPattern?.email) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
      }
    }

    return NextResponse.json(
      { error: 'Failed to update user', message: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}
