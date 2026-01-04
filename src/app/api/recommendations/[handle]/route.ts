import { NextRequest, NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import ProductRecommendation from '@/models/ProductRecommendation'
import Order from '@/models/Order'
import Product from '@/models/product.model'

interface RouteParams {
  params: Promise<{ handle: string }>
}

// Helper: Get automated "Bought Together" recommendations from order history
async function getAutomatedBoughtTogether(productHandle: string, limit: number = 4) {
  try {
    // First, get the product to find its productId
    const currentProduct = await Product.findOne({ handle: productHandle }).lean()
    if (!currentProduct) return []

    const currentProductId = (currentProduct as any)._id.toString()

    // Find all orders that contain this product
    const ordersWithProduct = await Order.find({
      'items.productId': (currentProduct as any)._id,
      status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] }
    }).lean()

    if (ordersWithProduct.length === 0) return []

    // Count co-occurrence of other products in these orders
    const productCounts: Record<string, { count: number; productId: string }> = {}

    ordersWithProduct.forEach((order: any) => {
      order.items.forEach((item: any) => {
        const itemProductId = item.productId?.toString()
        // Skip the current product itself
        if (itemProductId && itemProductId !== currentProductId) {
          if (!productCounts[itemProductId]) {
            productCounts[itemProductId] = { count: 0, productId: itemProductId }
          }
          productCounts[itemProductId].count++
        }
      })
    })

    // Sort by frequency and get top products
    const sortedProductIds = Object.entries(productCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, limit)
      .map(([_, value]) => value.productId)

    if (sortedProductIds.length === 0) return []

    // Fetch product details
    const { ObjectId } = await import('mongodb')
    const products = await Product.find({
      _id: { $in: sortedProductIds.map(id => new ObjectId(id)) },
      isDeleted: { $ne: true }
    }).lean()

    // Map to required format and maintain frequency order
    return sortedProductIds
      .map(productId => {
        const product = products.find((p: any) => p._id.toString() === productId)
        if (!product) return null
        
        const p = product as any
        const firstVariant = p.variants?.[0]
        return {
          handle: p.handle,
          title: p.title,
          image: typeof p.images?.[0] === 'object' ? p.images[0]?.src : (p.images?.[0] || ''),
          price: firstVariant?.price || p.price || 0
        }
      })
      .filter(Boolean)
  } catch (error) {
    console.error('Error getting automated bought together:', error)
    return []
  }
}

// GET - Get recommendations for a product (Public API)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { handle } = await params
    await connectDb()
    
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'you_may_also_like' or 'bought_together'
    
    const query: any = { productHandle: handle, isActive: true }
    if (type) query.type = type
    
    const recommendations = await ProductRecommendation.find(query).lean()
    
    const result: any = {
      youMayAlsoLike: [],
      boughtTogether: [],
      isAutomated: false // Flag to indicate if bought_together is automated
    }
    
    let hasManualBoughtTogether = false
    
    recommendations.forEach((rec: any) => {
      const items = rec.recommendations
        .sort((a: any, b: any) => a.position - b.position)
        .slice(0, rec.displayLimit)
        .map((r: any) => ({
          handle: r.productHandle,
          title: r.productTitle,
          image: r.productImage,
          price: r.productPrice
        }))
      
      if (rec.type === 'you_may_also_like') {
        result.youMayAlsoLike = items
      } else if (rec.type === 'bought_together') {
        // Manual override exists
        hasManualBoughtTogether = true
        result.boughtTogether = items
      }
    })
    
    // If no manual "bought_together" and requesting all or bought_together specifically,
    // generate automated recommendations from order history
    if (!hasManualBoughtTogether && (!type || type === 'bought_together')) {
      const automatedProducts = await getAutomatedBoughtTogether(handle, 4)
      if (automatedProducts.length > 0) {
        result.boughtTogether = automatedProducts
        result.isAutomated = true
      }
    }
    
    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
