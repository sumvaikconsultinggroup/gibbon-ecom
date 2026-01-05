import { NextRequest, NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import VideoReel from '@/models/VideoReel'

export const dynamic = 'force-dynamic'

// GET /api/videos/[id] - Get single video
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb()
    const { id } = await params

    const video = await VideoReel.findOne({
      _id: id,
      isActive: true,
    }).lean()

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      video: {
        id: (video as any)._id?.toString(),
        title: (video as any).title,
        description: (video as any).description,
        videoUrl: (video as any).videoUrl,
        thumbnailUrl: (video as any).thumbnailUrl,
        duration: (video as any).duration,
        aspectRatio: (video as any).aspectRatio,
        products: (video as any).products || [],
        influencer: (video as any).influencer,
        stats: (video as any).stats,
        tags: (video as any).tags,
        category: (video as any).category,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch video' }, { status: 500 })
  }
}

// POST /api/videos/[id] - Track video interaction (view, like, share)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb()
    const { id } = await params
    const { action } = await request.json()

    if (!['view', 'like', 'share'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const updateField = `stats.${action}s`
    
    await VideoReel.findByIdAndUpdate(id, {
      $inc: { [updateField]: 1 },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to track interaction' }, { status: 500 })
  }
}
