import { NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import BlogPost from '@/models/BlogPost'
import BlogCategory from '@/models/BlogCategory'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'gibbon-admin-secret-ad5f7eaf7fc29d4d02762686eecdabc3'

async function verifyAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value
  if (!token) return null
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

function serializePost(post: any) {
  return {
    ...post,
    _id: post._id.toString()
  }
}

export async function GET(request: Request) {
  try {
    await connectDb()
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    
    const query: any = {}
    
    if (status && status !== 'all') {
      query.status = status
    }
    
    if (category) {
      query.category = category
    }
    
    if (featured === 'true') {
      query.isFeatured = true
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ]
    }
    
    const skip = (page - 1) * limit
    
    const [posts, total] = await Promise.all([
      BlogPost.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BlogPost.countDocuments(query)
    ])
    
    return NextResponse.json({
      success: true,
      data: posts.map(serializePost),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin()
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    
    await connectDb()
    const body = await request.json()
    
    // Generate slug if not provided
    if (!body.slug) {
      body.slug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    }
    
    // Set publishedAt if publishing
    if (body.status === 'published' && !body.publishedAt) {
      body.publishedAt = new Date()
    }
    
    // Set default author if not provided
    if (!body.author?.name) {
      body.author = { name: 'Gibbon Nutrition' }
    }
    
    const post = await BlogPost.create(body)
    
    // Update category post count
    if (body.category) {
      await BlogCategory.findOneAndUpdate(
        { slug: body.category },
        { $inc: { postCount: 1 } }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: serializePost(post.toObject())
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating blog post:', error)
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
