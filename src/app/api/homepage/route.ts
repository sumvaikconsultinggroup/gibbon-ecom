import { NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import HomeBanner from '@/models/HomeBanner'
import HomeSection from '@/models/HomeSection'
import { Product } from '@/models/product.model'

export const dynamic = 'force-dynamic'
export const revalidate = 60

export async function GET() {
  try {
    await connectDb()
    
    // Get current date for date-based filtering
    const now = new Date()
    
    // Fetch active banners
    const banners = await HomeBanner.find({
      isActive: true,
      $or: [
        { startDate: { $exists: false } },
        { startDate: null },
        { startDate: { $lte: now } }
      ]
    })
      .sort({ order: 1 })
      .lean()
    
    // Filter out expired banners
    const activeBanners = banners.filter((b: any) => {
      if (!b.endDate) return true
      return new Date(b.endDate) >= now
    })
    
    // Fetch active sections
    const sections = await HomeSection.find({
      isActive: true,
      $or: [
        { startDate: { $exists: false } },
        { startDate: null },
        { startDate: { $lte: now } }
      ]
    })
      .sort({ order: 1 })
      .lean()
    
    // Filter out expired sections
    const activeSections = sections.filter((s: any) => {
      if (!s.endDate) return true
      return new Date(s.endDate) >= now
    })
    
    // Fetch products for each section based on productSource
    const sectionsWithProducts = await Promise.all(
      activeSections.map(async (section: any) => {
        let products: any[] = []
        const limit = section.productLimit || 8
        
        switch (section.productSource) {
          case 'bestseller':
            products = await Product.find({ tags: { $in: ['bestseller', 'best-seller', 'best seller'] } })
              .limit(limit)
              .lean()
            break
          case 'new':
            products = await Product.find({ tags: { $in: ['new', 'new-arrival', 'new arrival'] } })
              .sort({ createdAt: -1 })
              .limit(limit)
              .lean()
            // Fallback to newest products if no tagged products
            if (products.length === 0) {
              products = await Product.find()
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean()
            }
            break
          case 'sale':
            products = await Product.find({ tags: { $in: ['sale', 'on-sale', 'discount'] } })
              .limit(limit)
              .lean()
            break
          case 'tag':
            if (section.productTag) {
              products = await Product.find({ tags: section.productTag })
                .limit(limit)
                .lean()
            }
            break
          case 'manual':
            if (section.products && section.products.length > 0) {
              products = await Product.find({ _id: { $in: section.products } })
                .limit(limit)
                .lean()
            }
            break
          case 'collection':
            // For collection, we'd need to join with collections
            // For now, fetch products with matching collectionHandle in their data
            if (section.collectionHandle) {
              products = await Product.find()
                .limit(limit)
                .lean()
            }
            break
          default:
            // Default: fetch newest products
            products = await Product.find()
              .sort({ createdAt: -1 })
              .limit(limit)
              .lean()
        }
        
        return {
          ...section,
          _id: section._id.toString(),
          products: products.map((p: any) => ({
            _id: p._id.toString(),
            title: p.title,
            handle: p.handle,
            images: p.images,
            variants: p.variants,
            tags: p.tags,
            price: p.variants?.[0]?.price,
            compareAtPrice: p.variants?.[0]?.compareAtPrice
          }))
        }
      })
    )
    
    return NextResponse.json({
      success: true,
      data: {
        banners: activeBanners.map((b: any) => ({ ...b, _id: b._id.toString() })),
        sections: sectionsWithProducts
      }
    })
  } catch (error: any) {
    console.error('Error fetching homepage content:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
