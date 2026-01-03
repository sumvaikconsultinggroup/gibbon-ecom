import { NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import HomeBanner from '@/models/HomeBanner'
import HomeSection from '@/models/HomeSection'
import Product from '@/models/Product'

// Deep serialize for MongoDB documents
const deepSerialize = (obj: any): any => {
  if (!obj) return obj
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    if (value && typeof value === 'object' && value._bsontype === 'ObjectId') {
      return value.toString()
    }
    if (key === '_id' && value) {
      return value.toString ? value.toString() : String(value)
    }
    return value
  }))
}

export async function GET() {
  try {
    await connectDb()
    
    const now = new Date()
    
    // Fetch active banners
    const banners = await HomeBanner.find({
      isActive: true,
      $or: [
        { startDate: { $exists: false } },
        { startDate: { $lte: now } }
      ],
      $or: [
        { endDate: { $exists: false } },
        { endDate: { $gte: now } }
      ]
    })
      .sort({ order: 1 })
      .lean()
    
    // Fetch active sections
    const sections = await HomeSection.find({
      isActive: true
    })
      .sort({ order: 1 })
      .lean()
    
    // Populate products for each section based on productSource
    const populatedSections = await Promise.all(sections.map(async (section: any) => {
      let products: any[] = []
      
      switch (section.productSource) {
        case 'manual':
          if (section.products && section.products.length > 0) {
            products = await Product.find({
              _id: { $in: section.products },
              isDeleted: false,
              published: true
            })
              .select('title handle images variants tags')
              .limit(section.productLimit)
              .lean()
          }
          break
          
        case 'collection':
          if (section.collectionHandle) {
            products = await Product.find({
              isDeleted: false,
              published: true,
              'collections': section.collectionHandle
            })
              .select('title handle images variants tags')
              .limit(section.productLimit)
              .lean()
          }
          break
          
        case 'tag':
          if (section.productTag) {
            products = await Product.find({
              isDeleted: false,
              published: true,
              tags: section.productTag
            })
              .select('title handle images variants tags')
              .limit(section.productLimit)
              .lean()
          }
          break
          
        case 'bestseller':
          products = await Product.find({
            isDeleted: false,
            published: true,
            tags: 'bestseller'
          })
            .select('title handle images variants tags')
            .limit(section.productLimit)
            .lean()
          break
          
        case 'new':
          products = await Product.find({
            isDeleted: false,
            published: true,
            tags: 'new'
          })
            .sort({ createdAt: -1 })
            .select('title handle images variants tags')
            .limit(section.productLimit)
            .lean()
          break
          
        case 'sale':
          products = await Product.find({
            isDeleted: false,
            published: true,
            'variants.compareAtPrice': { $exists: true, $gt: 0 }
          })
            .select('title handle images variants tags')
            .limit(section.productLimit)
            .lean()
          break
      }
      
      return {
        ...section,
        _id: section._id.toString(),
        products: products.map((p: any) => deepSerialize(p))
      }
    }))
    
    return NextResponse.json({
      success: true,
      data: {
        banners: banners.map((b: any) => deepSerialize(b)),
        sections: populatedSections
      }
    })
  } catch (error: any) {
    console.error('Error fetching home content:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
