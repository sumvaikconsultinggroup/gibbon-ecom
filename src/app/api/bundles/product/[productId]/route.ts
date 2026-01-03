import { NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import BundleOffer from '@/models/BundleOffer'
import mongoose from 'mongoose'

export const dynamic = 'force-dynamic'

function serializeBundleOffer(offer: any) {
  return {
    ...offer,
    _id: offer._id.toString(),
    products: offer.products?.map((p: any) => ({
      ...p,
      productId: typeof p.productId === 'object' ? {
        _id: p.productId._id?.toString(),
        title: p.productId.title,
        handle: p.productId.handle,
        images: p.productId.images,
        variants: p.productId.variants?.map((v: any) => ({
          ...v,
          _id: v._id?.toString()
        }))
      } : p.productId?.toString()
    })),
    targetProductIds: offer.targetProductIds?.map((id: any) => id.toString()),
    excludeProductIds: offer.excludeProductIds?.map((id: any) => id.toString())
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params
    await connectDb()
    
    const now = new Date()
    
    // Find active bundle offers that target this product
    const offers = await BundleOffer.find({
      isActive: true,
      $or: [
        { targetProductIds: new mongoose.Types.ObjectId(productId) },
        { showOnAllProducts: true },
        { 'products.productId': new mongoose.Types.ObjectId(productId) }
      ],
      excludeProductIds: { $ne: new mongoose.Types.ObjectId(productId) },
      $and: [
        {
          $or: [
            { startDate: { $exists: false } },
            { startDate: null },
            { startDate: { $lte: now } }
          ]
        },
        {
          $or: [
            { endDate: { $exists: false } },
            { endDate: null },
            { endDate: { $gte: now } }
          ]
        }
      ],
      $expr: {
        $or: [
          { $eq: ['$usageLimit', null] },
          { $lt: ['$usageCount', '$usageLimit'] }
        ]
      }
    })
      .populate('products.productId', 'title handle images variants')
      .sort({ priority: -1 })
      .limit(5)
      .lean()
    
    // Increment view count for returned offers
    if (offers.length > 0) {
      await BundleOffer.updateMany(
        { _id: { $in: offers.map(o => o._id) } },
        { $inc: { viewCount: 1 } }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: offers.map(serializeBundleOffer)
    })
  } catch (error: any) {
    console.error('Error fetching product bundles:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
