import connectDb from '@/lib/mongodb'
import Product from '@/models/product.model'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request, { params }) {
  try {
    const { id } = params
    await connectDb()

    console.log(id)
    
    const product = await Product.findById(id)
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product, { status: 200 })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}