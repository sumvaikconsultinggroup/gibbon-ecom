import connectDb from '@/lib/mongodb'
import Product from '@/models/product.model'
import CollectionPageClient from '@/components/collection/CollectionPageClient'
import MegaHeader from '@/components/Header/MegaHeader'
import Footer from '@/components/Footer'
import { Metadata } from 'next'

interface Props {
  params: Promise<{ collection: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection } = await params
  const title = collection === 'all' ? 'All Products' : collection.replace(/-/g, ' ')
  return {
    title: `${title} | Gibbon Nutrition`,
    description: `Shop premium ${title.toLowerCase()} at Gibbon Nutrition. Lab-tested, FSSAI certified fitness supplements.`,
  }
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { collection } = await params
  const resolvedSearchParams = await searchParams
  
  await connectDb()

  // Build query
  const query: any = { isDeleted: false, published: true }
  
  if (collection !== 'all') {
    // Map collection slug to category or tags
    const collectionMap: { [key: string]: string } = {
      'whey-protein': 'Whey Protein',
      'pre-workout': 'Pre-Workout',
      'mass-gainer': 'Mass Gainer',
      'bcaa': 'BCAA',
      'creatine': 'Creatine',
      'vitamins': 'Vitamins',
      'protein': 'Protein',
      'amino-acids': 'Amino Acids',
      'bestsellers': 'bestseller',
      'new': 'new',
      'offers': 'offer',
    }
    
    const categoryName = collectionMap[collection]
    if (categoryName) {
      query.$or = [
        { productCategory: { $regex: categoryName, $options: 'i' } },
        { tags: { $in: [categoryName.toLowerCase()] } },
      ]
    }
  }

  // Price filter
  if (resolvedSearchParams.minPrice || resolvedSearchParams.maxPrice) {
    query['variants.price'] = {}
    if (resolvedSearchParams.minPrice) query['variants.price'].$gte = Number(resolvedSearchParams.minPrice)
    if (resolvedSearchParams.maxPrice) query['variants.price'].$lte = Number(resolvedSearchParams.maxPrice)
  }

  // Category filter
  if (resolvedSearchParams.category) {
    query.productCategory = { $regex: resolvedSearchParams.category as string, $options: 'i' }
  }

  // Sorting
  let sort: any = { createdAt: -1 }
  if (resolvedSearchParams.sort === 'price-asc') sort = { 'variants.0.price': 1 }
  if (resolvedSearchParams.sort === 'price-desc') sort = { 'variants.0.price': -1 }
  if (resolvedSearchParams.sort === 'rating') sort = { avgRating: -1 }

  const products = await Product.find(query).sort(sort).limit(50).lean()
  const totalCount = await Product.countDocuments(query)

  // Deep serialize all MongoDB ObjectIds to strings
  const serializedProducts = products.map((p: any) => JSON.parse(JSON.stringify(p, (key, value) => {
    if (value && typeof value === 'object' && value._bsontype === 'ObjectId') {
      return value.toString()
    }
    if (key === '_id' && value) {
      return value.toString ? value.toString() : String(value)
    }
    return value
  })))

  return (
    <>
      <MegaHeader />
      <CollectionPageClient
        initialProducts={serializedProducts as any}
        collection={collection}
        totalCount={totalCount}
      />
      <Footer />
    </>
  )
}
