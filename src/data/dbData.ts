// Database-backed data fetching utilities
// These functions fetch directly from MongoDB for server-side rendering

import connectDb from '@/lib/mongodb'
import Product from '@/models/product.model'
import Collection from '@/models/collection.model'

// Transform database product to frontend format
function transformProduct(dbProduct: any) {
  if (!dbProduct) return null
  
  // Convert to plain object if Mongoose document
  const product = typeof dbProduct.toJSON === 'function' ? dbProduct.toJSON() : dbProduct
  
  const firstVariant = product.variants?.[0]
  const firstImage = product.images?.[0]
  
  return {
    id: product._id?.toString() || product.id,
    title: product.title,
    handle: product.handle,
    createdAt: product.createdAt ? new Date(product.createdAt).toISOString() : undefined,
    vendor: product.vendor || 'Gibbon Nutrition',
    price: firstVariant?.price || 0,
    compareAtPrice: firstVariant?.compareAtPrice,
    featuredImage: firstImage ? {
      src: typeof firstImage === 'string' ? firstImage : (firstImage.src || firstImage.url || ''),
      width: 800,
      height: 800,
      alt: (typeof firstImage === 'object' ? firstImage.alt : undefined) || product.title,
    } : {
      src: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800',
      width: 800,
      height: 800,
      alt: product.title,
    },
    images: (product.images || []).map((img: any) => ({
      src: typeof img === 'string' ? img : (img.src || img.url || ''),
      width: 800,
      height: 800,
      alt: (typeof img === 'object' ? img.alt || img.altText : undefined) || product.title,
    })),
    reviewNumber: product.ratingCount || Math.floor(Math.random() * 100) + 10,
    rating: product.rating || 4.5,
    status: product.status === 'active' ? (product.createdAt && new Date(product.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) ? 'New in' : null) : product.status,
    options: (product.options || []).map((opt: any) => ({
      name: opt.name,
      values: opt.values || [],
    })),
    variants: (product.variants || []).map((v: any) => ({
      id: v._id?.toString() || v.id,
      title: [v.option1Value, v.option2Value, v.option3Value].filter(Boolean).join(' / ') || 'Default',
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      sku: v.sku,
      inventoryQuantity: v.inventoryQty,
      selectedOptions: [
        v.option1Value && { name: product.options?.[0]?.name || 'Option 1', value: v.option1Value },
        v.option2Value && { name: product.options?.[1]?.name || 'Option 2', value: v.option2Value },
        v.option3Value && { name: product.options?.[2]?.name || 'Option 3', value: v.option3Value },
      ].filter(Boolean),
    })),
    description: product.bodyHtml || product.description || '',
    category: product.productCategory,
    tags: product.tags || [],
  }
}

// Transform database collection to frontend format  
function transformCollection(dbCollection: any, products?: any[]) {
  if (!dbCollection) return null
  
  return {
    id: dbCollection._id?.toString() || dbCollection.id,
    title: dbCollection.title,
    handle: dbCollection.handle,
    description: dbCollection.description || '',
    sortDescription: dbCollection.sortDescription || 'Shop now',
    color: 'bg-indigo-50',
    count: products?.length || dbCollection.productCount || 0,
    image: dbCollection.image ? {
      src: dbCollection.image,
      width: 800,
      height: 600,
      alt: dbCollection.title,
    } : {
      src: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800',
      width: 800,
      height: 600,
      alt: dbCollection.title,
    },
    products: products?.map(transformProduct).filter(Boolean) || [],
  }
}

// Fetch products from database (server-side)
export async function getProductsFromDB(options?: {
  limit?: number
  category?: string
  search?: string
  sortBy?: string
}) {
  try {
    await connectDb()
    
    const filter: any = { isDeleted: { $ne: true }, published: true }
    
    if (options?.category) {
      filter.productCategory = { $regex: options.category, $options: 'i' }
    }
    
    if (options?.search) {
      filter.$or = [
        { title: { $regex: options.search, $options: 'i' } },
        { tags: { $in: [options.search.toLowerCase()] } },
      ]
    }
    
    let sort: any = { createdAt: -1 }
    if (options?.sortBy === 'price-asc') sort = { 'variants.0.price': 1 }
    if (options?.sortBy === 'price-desc') sort = { 'variants.0.price': -1 }
    if (options?.sortBy === 'title-asc') sort = { title: 1 }
    if (options?.sortBy === 'title-desc') sort = { title: -1 }
    
    const products = await Product.find(filter)
      .sort(sort)
      .limit(options?.limit || 50)
      .lean()
    
    return products.map(transformProduct).filter(Boolean)
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

// Fetch single product from database
export async function getProductFromDB(handle: string) {
  try {
    await connectDb()
    
    const product = await Product.findOne({ 
      handle, 
      isDeleted: { $ne: true } 
    }).lean()
    
    return transformProduct(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

// Fetch collections from database (server-side)
export async function getCollectionsFromDB(options?: {
  featured?: boolean
  location?: string
  includeProducts?: boolean
  limit?: number
}) {
  try {
    await connectDb()
    
    const filter: any = { isDeleted: { $ne: true }, published: true }
    
    if (options?.featured) {
      filter.isFeatured = true
    }
    
    if (options?.location) {
      filter['displaySettings.locations'] = options.location
    }
    
    const collections = await Collection.find(filter)
      .sort({ 'displaySettings.priority': -1, featuredOrder: 1, createdAt: -1 })
      .limit(options?.limit || 20)
      .lean()
    
    // If includeProducts, populate products for each collection
    if (options?.includeProducts) {
      const result = await Promise.all(
        collections.map(async (collection: any) => {
          let products: any[] = []
          
          if (collection.collectionType === 'manual' && collection.productHandles?.length > 0) {
            products = await Product.find({
              handle: { $in: collection.productHandles },
              isDeleted: { $ne: true },
              published: true,
            })
              .limit(collection.displaySettings?.maxItems || 12)
              .lean()
          } else if (collection.collectionType === 'automated' && collection.conditions?.length > 0) {
            const productQuery: any = { isDeleted: { $ne: true }, published: true }
            
            for (const condition of collection.conditions || []) {
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
          
          return transformCollection(collection, products)
        })
      )
      
      return result.filter(Boolean)
    }
    
    return collections.map((c: any) => transformCollection(c)).filter(Boolean)
  } catch (error) {
    console.error('Error fetching collections:', error)
    return []
  }
}

// Fetch single collection from database
export async function getCollectionFromDB(handle: string) {
  try {
    await connectDb()
    
    const collection = await Collection.findOne({ 
      handle, 
      isDeleted: { $ne: true } 
    }).lean()
    
    if (!collection) return null
    
    // Get products for this collection
    let products: any[] = []
    
    if (collection.collectionType === 'manual' && collection.productHandles?.length > 0) {
      products = await Product.find({
        handle: { $in: collection.productHandles },
        isDeleted: { $ne: true },
        published: true,
      }).lean()
    } else if (collection.collectionType === 'automated' && collection.conditions?.length > 0) {
      const productQuery: any = { isDeleted: { $ne: true }, published: true }
      
      for (const condition of collection.conditions || []) {
        switch (condition.field) {
          case 'category':
            productQuery.productCategory = { $regex: condition.value, $options: 'i' }
            break
          case 'tag':
            productQuery.tags = condition.value
            break
        }
      }
      
      products = await Product.find(productQuery).lean()
    }
    
    return transformCollection(collection, products)
  } catch (error) {
    console.error('Error fetching collection:', error)
    return null
  }
}

// Fetch featured collections for homepage
export async function getFeaturedCollections() {
  return getCollectionsFromDB({ featured: true, includeProducts: true, limit: 10 })
}

// Group collections by category for mega menu
export async function getGroupCollectionsFromDB() {
  try {
    const collections = await getCollectionsFromDB({ includeProducts: false, limit: 50 })
    
    const groups: Record<string, typeof collections> = {
      'Supplements': [],
      'Accessories': [],
      'Featured': [],
    }
    
    for (const collection of collections) {
      if (!collection) continue
      
      const title = collection.title.toLowerCase()
      if (title.includes('protein') || 
          title.includes('bcaa') ||
          title.includes('vitamin') ||
          title.includes('pre-workout') ||
          title.includes('amino')) {
        groups['Supplements'].push(collection)
      } else if (title.includes('accessor') ||
                 title.includes('gear') ||
                 title.includes('shaker') ||
                 title.includes('fitness')) {
        groups['Accessories'].push(collection)
      } else {
        groups['Featured'].push(collection)
      }
    }
    
    return Object.entries(groups)
      .filter(([_, items]) => items.length > 0)
      .map(([name, items]) => ({
        name,
        collections: items.slice(0, 6),
      }))
  } catch (error) {
    console.error('Error fetching group collections:', error)
    return []
  }
}

// Export types
export type TProductFromDB = NonNullable<Awaited<ReturnType<typeof getProductsFromDB>>[number]>
export type TCollectionFromDB = NonNullable<Awaited<ReturnType<typeof getCollectionsFromDB>>[number]>
