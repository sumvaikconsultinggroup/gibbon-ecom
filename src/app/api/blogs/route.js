import { NextResponse } from 'next/server'
import { connectToDB } from '@/utils/db'
import uploadToCloudinary from '@/lib/cloudinary'
import Blog from '@/models/Blog'

export async function GET(request) {
  try {
    await connectToDB()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const skip = (page - 1) * limit

    const query = { isDeleted: { $ne: true } }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ]
    }

    if (category && category !== 'All') {
      query.category = category
    }

    const [blogs, total] = await Promise.all([Blog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit), Blog.countDocuments(query)])

    return NextResponse.json(
      {
        success: true,
        data: blogs,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalBlogs: total,
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error fetching blogs:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch blogs' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectToDB()

    const formData = await request.formData()
    console.log("Form data blogs",formData)
    const blogDataRaw = formData.get('blogData')
    const coverImage = formData.get('coverImage')

    if (!blogDataRaw) {
      return NextResponse.json({ success: false, message: 'No blog data provided' }, { status: 400 })
    }

    const blogData = JSON.parse(blogDataRaw)

    // Validate required fields
    if (!blogData.title || !blogData.slug || !blogData.content || !blogData.author) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 })
    }

    let coverImageUrl = null

    // Upload cover image if provided
    if (coverImage && coverImage instanceof File) {
      try {
        const uploadResult = await uploadToCloudinary(coverImage, 'blogs')
        coverImageUrl = uploadResult.url
      } catch (error) {
        console.error('Error uploading cover image:', error)
        return NextResponse.json({ success: false, message: 'Failed to upload cover image' }, { status: 500 })
      }
    }

    // Create the blog post
    const newBlog = await Blog.create({
      ...blogData,
      coverImage: coverImageUrl,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Blog post created successfully!',
        data: newBlog,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error creating blog:', error)

    // Handle Duplicate Key Error (e.g., Slug)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]
      return NextResponse.json({ success: false, message: `A blog with this ${field} already exists.` }, { status: 400 })
    }

    // Handle Validation Errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message)
      return NextResponse.json({ success: false, message: messages.join(', ') }, { status: 400 })
    }

    return NextResponse.json({ success: false, message: error.message || 'Failed to create blog post' }, { status: 500 })
  }
}
