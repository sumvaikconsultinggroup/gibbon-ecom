import { getCurrentUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
        avatar: user.avatar,
        lastLogin: user.lastLogin,
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to get user' },
      { status: 500 }
    )
  }
}
