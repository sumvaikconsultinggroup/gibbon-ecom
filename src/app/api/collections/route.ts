import { NextRequest, NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import Collection from '@/models/collection.model'
import Product from '@/models/product.model'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/collections - List all collections with optional product population
export async function GET(request: NextRequest) {
  try {
    await connectDb()

    const { searchParams } = new URL(request.url)
    const includeProducts = searchParams.get('includeProducts') === 'true'
    const featured = searchParams.get('featured') === 'true'
    const location = searchParams.get('location') // Filter by display location
    const limit = parseInt(searchParams.get('limit') || '100')
    const published = searchParams.get('published') !== 'false' // Default to only published

    // Build filter
    const filter: any = { isDeleted: { $ne: true } }
    
    if (published) {
      filter.published = true
    }
    
    if (featured) {
      filter.isFeatured = true
    }
    
    if (location) {
      filter['displaySettings.locations'] = location
    }

    // Fetch collections
    let collections = await Collection.find(filter)
      .sort({ 'displaySettings.priority': -1, featuredOrder: 1, createdAt: -1 })
      .limit(limit)
      .lean()

    // If includeProducts, populate products for each collection
    if (includeProducts) {
      collections = await Promise.all(
        collections.map(async (collection: any) => {
          let products = []
          
          if (collection.collectionType === 'manual' && collection.productHandles?.length > 0) {
            // Manual collection - fetch by handles
            products = await Product.find({
              handle: { $in: collection.productHandles },
              isDeleted: { $ne: true },
              published: true,
            })
              .limit(collection.displaySettings?.maxItems || 12)
              .lean()
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
            
            products = await Product.find(productQuery)
              .limit(collection.displaySettings?.maxItems || 12)
              .lean()
          }
          
          return {
            ...collection,
            _id: undefined,
            id: collection._id?.toString(),
            products: products.map((p: any) => ({
              ...p,
              _id: undefined,
              id: p._id?.toString(),
            })),
            productCount: products.length,
          }
        })
      )
    } else {
      // Just format without products
      collections = collections.map((collection: any) => ({
        ...collection,
        _id: undefined,
        id: collection._id?.toString(),
      }))
    }

    return NextResponse.json({
      success: true,
      collections,
      count: collections.length,
    })
  } catch (error) {
    console.error('Error fetching collections:', error)
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 })
  }
}

// POST /api/collections - Create a new collection
export async function POST(request: NextRequest) {
  try {
    await connectDb()
    const body = await request.json()

    // Check if collection with handle already exists
    const existing = await Collection.findOne({ handle: body.handle })
    if (existing) {
      return NextResponse.json({ error: 'Collection with this handle already exists' }, { status: 409 })
    }

    const collection = await Collection.create({
      handle: body.handle,
      title: body.title,
      description: body.description || '',
      image: body.image || '',
      bannerImage: body.bannerImage || '',
      collectionType: body.collectionType || 'manual',
      conditions: body.conditions || [],
      conditionMatch: body.conditionMatch || 'all',
      productHandles: body.productHandles || [],
      displaySettings: body.displaySettings || {
        locations: [],
        priority: 0,
        showOnMobile: true,
        showOnDesktop: true,
        layoutStyle: 'grid',
        itemsPerRow: 4,
        maxItems: 12,
        showTitle: true,
        showDescription: false,
        showProductCount: true,
      },
      isFeatured: body.isFeatured || false,
      featuredOrder: body.featuredOrder || 0,
      published: body.published ?? true,
      seo: body.seo || {},
    })

    return NextResponse.json({
      success: true,
      collection: {
        ...collection.toObject(),
        _id: undefined,
        id: collection._id?.toString(),
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating collection:', error)
    return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 })
  }
}
