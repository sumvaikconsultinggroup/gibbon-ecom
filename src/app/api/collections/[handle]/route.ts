import { NextRequest, NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import Collection from '@/models/collection.model'
import Product from '@/models/product.model'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/collections/[handle] - Get single collection with products
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params
    await connectDb()

    const { searchParams } = new URL(request.url)
    const includeProducts = searchParams.get('includeProducts') !== 'false' // Default true

    // Find collection
    const collection = await Collection.findOne({ 
      handle, 
      isDeleted: { $ne: true } 
    }).lean()

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
    }

    let products: any[] = []
    
    if (includeProducts) {
      if (collection.collectionType === 'manual' && collection.productHandles?.length > 0) {
        // Manual collection - fetch by handles in order
        products = await Product.find({
          handle: { $in: collection.productHandles },
          isDeleted: { $ne: true },
          published: true,
        }).lean()
        
        // Sort by the order in productHandles
        const handleOrder = new Map(collection.productHandles.map((h: string, i: number) => [h, i]))
        products.sort((a, b) => (handleOrder.get(a.handle) || 0) - (handleOrder.get(b.handle) || 0))
      } else if (collection.collectionType === 'automated' && collection.conditions?.length > 0) {
        // Automated collection - build query from conditions
        const productQuery: any = { isDeleted: { $ne: true }, published: true }
        
        for (const condition of collection.conditions) {
          switch (condition.field) {
            case 'category':
              productQuery.productCategory = { $regex: condition.value, $options: 'i' }
              break
            case 'tag':
              productQuery.tags = condition.value
              break
            case 'vendor':
              productQuery.vendor = condition.value
              break
            case 'type':
              productQuery.type = condition.value
              break
            case 'title':
              if (condition.operator === 'contains') {
                productQuery.title = { $regex: condition.value, $options: 'i' }
              }
              break
          }
        }
        
        products = await Product.find(productQuery).lean()
      }
      
      // Apply sort order from collection
      if (collection.sortOrder) {
        switch (collection.sortOrder) {
          case 'price-asc':
            products.sort((a, b) => (a.variants?.[0]?.price || 0) - (b.variants?.[0]?.price || 0))
            break
          case 'price-desc':
            products.sort((a, b) => (b.variants?.[0]?.price || 0) - (a.variants?.[0]?.price || 0))
            break
          case 'title-asc':
            products.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
            break
          case 'title-desc':
            products.sort((a, b) => (b.title || '').localeCompare(a.title || ''))
            break
          case 'date-asc':
            products.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            break
          case 'date-desc':
            products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            break
        }
      }
    }

    return NextResponse.json({
      ...collection,
      _id: undefined,
      id: collection._id?.toString(),
      products: products.map((p: any) => ({
        ...p,
        _id: undefined,
        id: p._id?.toString(),
      })),
      productCount: products.length,
    })
  } catch (error) {
    console.error('Error fetching collection:', error)
    return NextResponse.json({ error: 'Failed to fetch collection' }, { status: 500 })
  }
}

// PATCH /api/collections/[handle] - Update collection
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params
    const body = await request.json()
    await connectDb()

    const collection = await Collection.findOneAndUpdate(
      { handle, isDeleted: { $ne: true } },
      { $set: body },
      { new: true }
    )

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      collection: {
        ...collection.toObject(),
        _id: undefined,
        id: collection._id?.toString(),
      },
    })
  } catch (error) {
    console.error('Error updating collection:', error)
    return NextResponse.json({ error: 'Failed to update collection' }, { status: 500 })
  }
}

// DELETE /api/collections/[handle] - Soft delete collection
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params
    await connectDb()

    const collection = await Collection.findOneAndUpdate(
      { handle, isDeleted: { $ne: true } },
      { $set: { isDeleted: true } },
      { new: true }
    )

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Collection deleted' })
  } catch (error) {
    console.error('Error deleting collection:', error)
    return NextResponse.json({ error: 'Failed to delete collection' }, { status: 500 })
  }
}
