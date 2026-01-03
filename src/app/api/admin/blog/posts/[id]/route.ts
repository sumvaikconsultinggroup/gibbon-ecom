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
  if (!post) return null
  return {
    ...post,
    _id: post._id.toString()
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await connectDb()
    
    const post = await BlogPost.findById(id).lean()
    
    if (!post) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: serializePost(post)
    })
  } catch (error: any) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin()
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = await params
    await connectDb()
    const body = await request.json()
    
    // Get existing post to track category change
    const existingPost = await BlogPost.findById(id)
    const oldCategory = existingPost?.category
    
    // Set publishedAt if changing to published
    if (body.status === 'published' && existingPost?.status !== 'published') {
      body.publishedAt = new Date()
    }
    
    const post = await BlogPost.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).lean()
    
    if (!post) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 })
    }
    
    // Update category counts if category changed
    if (oldCategory !== body.category) {
      if (oldCategory) {
        await BlogCategory.findOneAndUpdate(
          { slug: oldCategory },
          { $inc: { postCount: -1 } }
        )
      }
      if (body.category) {
        await BlogCategory.findOneAndUpdate(
          { slug: body.category },
          { $inc: { postCount: 1 } }
        )
      }
    }
    
    return NextResponse.json({
      success: true,
      data: serializePost(post)
    })
  } catch (error: any) {
    console.error('Error updating blog post:', error)
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin()
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = await params
    await connectDb()
    
    const post = await BlogPost.findByIdAndDelete(id)
    
    if (!post) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 })
    }
    
    // Update category post count
    if (post.category) {
      await BlogCategory.findOneAndUpdate(
        { slug: post.category },
        { $inc: { postCount: -1 } }
      )
    }
    
    return NextResponse.json({ success: true, message: 'Post deleted' })
  } catch (error: any) {
    console.error('Error deleting blog post:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
