'use server'

import connectDb from '@/lib/mongodb'
import Product from '@/models/product.model'

interface ProductQueryParams {
  search?: string
  status?: string
  page?: number
  limit?: number
}

interface ProductResult {
  success: boolean
  message?: string
  products?: any[]
  total?: number
  count?: number
}

// Get all products with filtering and pagination
export async function getProducts(params: ProductQueryParams = {}): Promise<ProductResult> {
  try {
    await connectDb()
    
    const { search, status, page = 1, limit = 20 } = params
    
    // Build filter
    const filter: any = { isDeleted: { $ne: true } }
    
    if (search) {
      filter.title = { $regex: search, $options: 'i' }
    }
    
    if (status && status !== 'all') {
      filter.status = status
    }
    
    // Get total count
    const total = await Product.countDocuments(filter)
    
    // Get paginated results
    const skip = (page - 1) * limit
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
    
    // Convert MongoDB documents to plain objects (remove _id ObjectIds)
    const plainProducts = products.map(product => ({
      ...product,
      _id: product._id?.toString(),
      options: product.options?.map((opt: any) => ({
        name: opt.name,
        values: opt.values,
      })),
      variants: product.variants?.map((v: any) => ({
        ...v,
        _id: undefined,
      })),
      images: product.images?.map((img: any) => ({
        src: img.src,
        position: img.position,
        altText: img.altText,
      })),
    }))
    
    return {
      success: true,
      products: plainProducts,
      total,
      count: products.length,
    }
  } catch (error: any) {
    console.error('Get products error:', error)
    return { success: false, message: error.message || 'Failed to fetch products' }
  }
}

// Delete a product
export async function deleteProduct(handle: string): Promise<ProductResult> {
  try {
    await connectDb()
    
    const result = await Product.updateOne(
      { handle },
      { $set: { isDeleted: true } }
    )
    
    if (result.modifiedCount === 0) {
      return { success: false, message: 'Product not found' }
    }
    
    return { success: true, message: 'Product deleted' }
  } catch (error: any) {
    console.error('Delete product error:', error)
    return { success: false, message: error.message || 'Failed to delete product' }
  }
}

// Update product status
export async function updateProductStatus(handle: string, status: 'active' | 'draft' | 'archived'): Promise<ProductResult> {
  try {
    await connectDb()
    
    const result = await Product.updateOne(
      { handle },
      { $set: { status } }
    )
    
    if (result.modifiedCount === 0) {
      return { success: false, message: 'Product not found' }
    }
    
    return { success: true, message: 'Product status updated' }
  } catch (error: any) {
    console.error('Update product status error:', error)
    return { success: false, message: error.message || 'Failed to update product status' }
  }
}

// Get product counts by status
export async function getProductStats(): Promise<{
  total: number
  active: number
  draft: number
  archived: number
  lowStock: number
}> {
  try {
    await connectDb()
    
    const [total, active, draft, archived, lowStock] = await Promise.all([
      Product.countDocuments({ isDeleted: { $ne: true } }),
      Product.countDocuments({ isDeleted: { $ne: true }, status: 'active' }),
      Product.countDocuments({ isDeleted: { $ne: true }, status: 'draft' }),
      Product.countDocuments({ isDeleted: { $ne: true }, status: 'archived' }),
      Product.countDocuments({ 
        isDeleted: { $ne: true }, 
        'variants.inventoryQty': { $lte: 5 } 
      }),
    ])
    
    return { total, active, draft, archived, lowStock }
  } catch (error) {
    console.error('Get product stats error:', error)
    return { total: 0, active: 0, draft: 0, archived: 0, lowStock: 0 }
  }
}
