import { NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import Product from '@/models/product.model'
import uploadToCloudinary from '@/lib/cloudinary'

export async function PUT(request, { params }) {
  try {
    await connectDb()

    const { handle } = await params
    const formData = await request.formData()


    console.log(formData)
    // Extract form data
    const star = parseInt(formData.get('star'))
    const reviewerName = formData.get('reviewerName')
    const reviewDescription = formData.get('reviewDescription')
    const imageFile = formData.get('image')

    // Validation
    if (!star || !reviewerName || !reviewDescription) {
      return NextResponse.json(
        {
          success: false,
          message: 'Star rating, reviewer name, and review description are required',
        },
        { status: 400 }
      )
    }

    if (star < 1 || star > 5) {
      return NextResponse.json(
        {
          success: false,
          message: 'Star rating must be between 1 and 5',
        },
        { status: 400 }
      )
    }

    // Find product
    const product = await Product.findOne({ handle, isDeleted: false })

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: 'Product not found',
        },
        { status: 404 }
      )
    }

    // Prepare review object
    const review = {
      star,
      reviewerName,
      reviewDescription,
    }

    // Upload image to Cloudinary if provided
    if (imageFile && imageFile.size > 0) {
      try {
        const uploadResult = await uploadToCloudinary(imageFile, 'reviews')
        review.image = uploadResult.url
      } catch (error) {
        console.error('Error uploading image to Cloudinary:', error)
        return NextResponse.json(
          {
            success: false,
            message: 'Failed to upload image',
          },
          { status: 500 }
        )
      }
    }

    // Add review to product
    if (!product.reviews) {
      product.reviews = []
    }
    product.reviews.push(review)

    // Save product
    await product.save()

    return NextResponse.json(
      {
        success: true,
        message: 'Review added successfully',
        data: review,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error adding review:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error.message,
      },
      { status: 500 }
    )
  }
}