// Database-backed data fetching utilities
// These functions fetch data from the API/database instead of using hardcoded data

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || ''

// Cache for server-side fetches
const cache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_TTL = 60000 // 1 minute cache

async function fetchWithCache<T>(url: string, options?: RequestInit): Promise<T> {
  const cacheKey = url
  const cached = cache.get(cacheKey)
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T
  }

  try {
    const response = await fetch(url, {
      ...options,
      next: { revalidate: 60 }, // ISR revalidation
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`)
    }

    const data = await response.json()
    cache.set(cacheKey, { data, timestamp: Date.now() })
    return data
  } catch (error) {
    console.error('Fetch error:', error)
    // Return cached data if available, even if stale
    if (cached) {
      return cached.data as T
    }
    throw error
  }
}

// Transform database product to frontend format
function transformProduct(dbProduct: any) {
  const firstVariant = dbProduct.variants?.[0]
  const firstImage = dbProduct.images?.[0]
  
  return {
    id: dbProduct.id || dbProduct._id?.toString(),
    title: dbProduct.title,
    handle: dbProduct.handle,
    createdAt: dbProduct.createdAt,
    vendor: dbProduct.vendor || 'Gibbon Nutrition',
    price: firstVariant?.price || 0,
    compareAtPrice: firstVariant?.compareAtPrice,
    featuredImage: firstImage ? {
      src: firstImage.src || firstImage.url || firstImage,
      width: firstImage.width || 800,
      height: firstImage.height || 800,
      alt: firstImage.alt || dbProduct.title,
    } : {
      src: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800',
      width: 800,
      height: 800,
      alt: dbProduct.title,
    },
    images: (dbProduct.images || []).map((img: any) => ({
      src: img.src || img.url || img,
      width: img.width || 800,
      height: img.height || 800,
      alt: img.alt || dbProduct.title,
    })),
    reviewNumber: dbProduct.ratingCount || Math.floor(Math.random() * 100) + 10,
    rating: dbProduct.rating || 4.5,
    status: dbProduct.status === 'active' ? (dbProduct.createdAt && new Date(dbProduct.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) ? 'New in' : null) : dbProduct.status,
    options: dbProduct.options || [],
    variants: dbProduct.variants?.map((v: any) => ({
      id: v._id?.toString() || v.id,
      title: [v.option1Value, v.option2Value, v.option3Value].filter(Boolean).join(' / ') || 'Default',
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      sku: v.sku,
      inventoryQuantity: v.inventoryQty,
      image: v.image,
      selectedOptions: [
        v.option1Value && { name: dbProduct.options?.[0]?.name || 'Option 1', value: v.option1Value },
        v.option2Value && { name: dbProduct.options?.[1]?.name || 'Option 2', value: v.option2Value },
        v.option3Value && { name: dbProduct.options?.[2]?.name || 'Option 3', value: v.option3Value },
      ].filter(Boolean),
    })) || [],
    description: dbProduct.bodyHtml || dbProduct.description || '',
    category: dbProduct.productCategory,
    tags: dbProduct.tags || [],
  }
}

// Transform database collection to frontend format  
function transformCollection(dbCollection: any) {
  return {
    id: dbCollection.id || dbCollection._id?.toString(),
    title: dbCollection.title,
    handle: dbCollection.handle,
    description: dbCollection.description,
    sortDescription: dbCollection.sortDescription || 'Shop now',
    color: 'bg-indigo-50',
    count: dbCollection.productCount || dbCollection.products?.length || 0,
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
    products: (dbCollection.products || []).map(transformProduct),
  }
}

// Fetch products from database
export async function getProductsFromDB(options?: {
  limit?: number
  category?: string
  search?: string
  sortBy?: string
}) {
  try {
    const params = new URLSearchParams()
    if (options?.limit) params.set('limit', options.limit.toString())
    if (options?.category) params.set('category', options.category)
    if (options?.search) params.set('search', options.search)
    if (options?.sortBy) params.set('sortBy', options.sortBy)
    params.set('published', 'true')
    
    const url = `${BASE_URL}/api/products?${params}`
    const data = await fetchWithCache<any>(url)
    
    return (data.products || data.data || []).map(transformProduct)
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

// Fetch single product from database
export async function getProductFromDB(handle: string) {
  try {
    const url = `${BASE_URL}/api/products/${handle}`
    const data = await fetchWithCache<any>(url)
    
    if (data.success === false || !data.data) {
      return null
    }
    
    return transformProduct(data.data || data)
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

// Fetch collections from database
export async function getCollectionsFromDB(options?: {
  featured?: boolean
  location?: string
  includeProducts?: boolean
  limit?: number
}) {
  try {
    const params = new URLSearchParams()
    if (options?.featured) params.set('featured', 'true')
    if (options?.location) params.set('location', options.location)
    if (options?.includeProducts) params.set('includeProducts', 'true')
    if (options?.limit) params.set('limit', options.limit.toString())
    params.set('published', 'true')
    
    const url = `${BASE_URL}/api/collections?${params}`
    const data = await fetchWithCache<any>(url)
    
    return (data.collections || []).map(transformCollection)
  } catch (error) {
    console.error('Error fetching collections:', error)
    return []
  }
}

// Fetch single collection from database
export async function getCollectionFromDB(handle: string) {
  try {
    const url = `${BASE_URL}/api/collections/${handle}?includeProducts=true`
    const data = await fetchWithCache<any>(url)
    
    if (data.error) {
      return null
    }
    
    return transformCollection(data)
  } catch (error) {
    console.error('Error fetching collection:', error)
    return null
  }
}

// Fetch featured collections for homepage
export async function getFeaturedCollections() {
  return getCollectionsFromDB({ featured: true, includeProducts: true, limit: 10 })
}

// Fetch homepage collections (for different sections)
export async function getHomepageCollections(location: string) {
  return getCollectionsFromDB({ location, includeProducts: true, limit: 6 })
}

// Group collections by category for mega menu
export async function getGroupCollectionsFromDB() {
  try {
    const collections = await getCollectionsFromDB({ includeProducts: false, limit: 50 })
    
    // Group by first word of title or by specific categories
    const groups: Record<string, typeof collections> = {
      'Supplements': [],
      'Accessories': [],
      'Featured': [],
    }
    
    for (const collection of collections) {
      if (collection.title.toLowerCase().includes('protein') || 
          collection.title.toLowerCase().includes('bcaa') ||
          collection.title.toLowerCase().includes('vitamin') ||
          collection.title.toLowerCase().includes('pre-workout')) {
        groups['Supplements'].push(collection)
      } else if (collection.title.toLowerCase().includes('accessor') ||
                 collection.title.toLowerCase().includes('gear') ||
                 collection.title.toLowerCase().includes('shaker')) {
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
export type TProductFromDB = Awaited<ReturnType<typeof getProductsFromDB>>[number]
export type TCollectionFromDB = Awaited<ReturnType<typeof getCollectionsFromDB>>[number]
