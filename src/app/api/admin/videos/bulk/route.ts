import { NextRequest, NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import VideoReel from '@/models/VideoReel'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'gibbon-admin-secret'

async function verifyAdmin(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')?.value
    if (!token) return null
    return jwt.verify(token, JWT_SECRET) as any
  } catch {
    return null
  }
}

// POST /api/admin/videos/bulk - Bulk operations
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDb()
    const { action, videoIds, data } = await request.json()

    if (!action || !Array.isArray(videoIds) || videoIds.length === 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    let result

    switch (action) {
      case 'activate':
        result = await VideoReel.updateMany(
          { _id: { $in: videoIds } },
          { $set: { isActive: true } }
        )
        break

      case 'deactivate':
        result = await VideoReel.updateMany(
          { _id: { $in: videoIds } },
          { $set: { isActive: false } }
        )
        break

      case 'feature':
        result = await VideoReel.updateMany(
          { _id: { $in: videoIds } },
          { $set: { isFeatured: true } }
        )
        break

      case 'unfeature':
        result = await VideoReel.updateMany(
          { _id: { $in: videoIds } },
          { $set: { isFeatured: false } }
        )
        break

      case 'setCategory':
        if (!data?.category) {
          return NextResponse.json({ error: 'Category required' }, { status: 400 })
        }
        result = await VideoReel.updateMany(
          { _id: { $in: videoIds } },
          { $set: { category: data.category } }
        )
        break

      case 'showOnHomepage':
        result = await VideoReel.updateMany(
          { _id: { $in: videoIds } },
          { $set: { showOnHomepage: true } }
        )
        break

      case 'hideFromHomepage':
        result = await VideoReel.updateMany(
          { _id: { $in: videoIds } },
          { $set: { showOnHomepage: false } }
        )
        break

      case 'delete':
        result = await VideoReel.deleteMany({ _id: { $in: videoIds } })
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `Bulk ${action} completed`,
      modifiedCount: result.modifiedCount || result.deletedCount || 0,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
