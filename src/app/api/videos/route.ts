import { NextRequest, NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import VideoReel from '@/models/VideoReel'

export const dynamic = 'force-dynamic'

// GET /api/videos - Public API for fetching videos
export async function GET(request: NextRequest) {
  try {
    await connectDb()

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const productId = searchParams.get('productId')  // Get videos by product

    const now = new Date()

    // Build query for active, visible videos
    const query: any = {
      isActive: true,
      showOnHomepage: true,
      $or: [
        { scheduledAt: { $exists: false } },
        { scheduledAt: null },
        { scheduledAt: { $lte: now } },
      ],
      $and: [
        {
          $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: null },
            { expiresAt: { $gt: now } },
          ],
        },
      ],
    }

    if (category) query.category = category
    if (featured === 'true') query.isFeatured = true
    if (productId) query['products.productId'] = productId

    const videos = await VideoReel.find(query)
      .sort({ isFeatured: -1, displayOrder: 1, createdAt: -1 })
      .limit(limit)
      .select('-createdBy')
      .lean()

    // Transform for frontend
    const transformedVideos = videos.map((video: any) => ({
      id: video._id?.toString(),
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
      aspectRatio: video.aspectRatio,
      products: video.products || [],
      influencer: video.influencer,
      stats: video.stats,
      tags: video.tags,
      category: video.category,
      isFeatured: video.isFeatured,
      autoPlay: video.autoPlay,
    }))

    return NextResponse.json({
      success: true,
      videos: transformedVideos,
      count: transformedVideos.length,
    })
  } catch (error: any) {
    console.error('Videos API error:', error)
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
  }
}
