import { NextRequest, NextResponse } from 'next/server'
import connectDb from '@/lib/mongodb'
import ProductRecommendation from '@/models/ProductRecommendation'

interface RouteParams {
  params: Promise<{ handle: string }>
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
      boughtTogether: []
    }
    
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
        result.boughtTogether = items
      }
    })
    
    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
