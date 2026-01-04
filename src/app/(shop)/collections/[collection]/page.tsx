import connectDb from '@/lib/mongodb'
import Product from '@/models/product.model'
import CollectionPageClient from '@/components/collection/CollectionPageClient'
import MegaHeader from '@/components/Header/MegaHeader'
import Footer from '@/components/Footer'
import { Metadata } from 'next'
import { generateCollectionSchema, generateBreadcrumbSchema, siteConfig } from '@/lib/seo'
import JsonLd from '@/components/SEO/JsonLd'

interface Props {
  params: Promise<{ collection: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// Collection name mapping
const collectionMeta: { [key: string]: { title: string; description: string; keywords: string[] } } = {
  'all-items': {
    title: 'All Products',
    description: 'Shop all premium fitness supplements at Gibbon Nutrition. Whey Protein, Pre-Workout, BCAA, Mass Gainers & more. Lab-tested, FSSAI certified.',
    keywords: ['all supplements', 'fitness products', 'gym supplements', 'sports nutrition'],
  },
  'whey-protein': {
    title: 'Whey Protein',
    description: 'Buy premium Whey Protein at best prices. 100% authentic, lab-tested protein powders for muscle building. Free shipping on orders above ₹999.',
    keywords: ['whey protein', 'protein powder', 'muscle building', 'gym protein', 'whey isolate'],
  },
  'pre-workout': {
    title: 'Pre-Workout',
    description: 'Boost your workout with premium Pre-Workout supplements. Explosive energy, focus & pump. Lab-tested formulas for maximum performance.',
    keywords: ['pre workout', 'energy supplement', 'gym energy', 'workout booster', 'pump formula'],
  },
  'mass-gainer': {
    title: 'Mass Gainer',
    description: 'Gain muscle mass with premium Mass Gainers. High-calorie, protein-rich formulas for bulking. Lab-tested & FSSAI certified.',
    keywords: ['mass gainer', 'weight gainer', 'muscle mass', 'bulking supplement', 'high calorie protein'],
  },
  'bcaa': {
    title: 'BCAA & Amino Acids',
    description: 'Premium BCAA & Amino Acids for muscle recovery & growth. Intra-workout supplements for better performance. Lab-tested quality.',
    keywords: ['bcaa', 'amino acids', 'muscle recovery', 'intra workout', 'eaa'],
  },
  'creatine': {
    title: 'Creatine',
    description: 'Premium Creatine Monohydrate for strength & power. Increase muscle endurance & performance. Micronized formula for better absorption.',
    keywords: ['creatine', 'creatine monohydrate', 'strength supplement', 'power', 'muscle endurance'],
  },
  'vitamins': {
    title: 'Vitamins & Minerals',
    description: 'Essential Vitamins & Minerals for overall health. Multivitamins, Omega-3, Vitamin D & more. Support your fitness journey.',
    keywords: ['vitamins', 'minerals', 'multivitamin', 'omega 3', 'health supplements'],
  },
  'bestsellers': {
    title: 'Bestsellers',
    description: 'Shop our bestselling supplements loved by thousands of customers. Top-rated products with proven results.',
    keywords: ['bestsellers', 'top rated', 'popular supplements', 'best protein'],
  },
  'new': {
    title: 'New Arrivals',
    description: 'Discover our latest supplement launches. New formulas, improved products & exciting additions to fuel your fitness.',
    keywords: ['new arrivals', 'new products', 'latest supplements', 'new launch'],
  },
  'offers': {
    title: 'Special Offers',
    description: 'Grab the best deals on premium supplements. Limited time offers, discounts & combo deals. Save big on your fitness essentials.',
    keywords: ['offers', 'discounts', 'deals', 'sale', 'combo offers'],
  },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection } = await params
  const meta = collectionMeta[collection] || {
    title: collection.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    description: `Shop premium ${collection.replace(/-/g, ' ')} at Gibbon Nutrition. Lab-tested, FSSAI certified fitness supplements.`,
    keywords: [collection.replace(/-/g, ' '), 'supplements', 'fitness'],
  }

  return {
    title: meta.title,
    description: meta.description,
    keywords: [...meta.keywords, 'Gibbon Nutrition', 'buy online', 'India'],
    alternates: {
      canonical: `/collections/${collection}`,
    },
    openGraph: {
      type: 'website',
      title: `${meta.title} | Gibbon Nutrition`,
      description: meta.description,
      url: `${siteConfig.url}/collections/${collection}`,
      siteName: 'Gibbon Nutrition',
      locale: 'en_IN',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${meta.title} | Gibbon Nutrition`,
      description: meta.description,
    },
  }
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { collection } = await params
  const resolvedSearchParams = await searchParams
  
  await connectDb()

  // Build query
  const query: any = { isDeleted: false, published: true }
  
  if (collection !== 'all' && collection !== 'all-items') {
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

  // Get collection metadata
  const meta = collectionMeta[collection] || { title: collection.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }

  // Generate SEO Schemas
  const collectionSchema = generateCollectionSchema({
    title: meta.title,
    handle: collection,
    description: collectionMeta[collection]?.description,
    products: serializedProducts.slice(0, 10).map((p: any) => ({
      title: p.title,
      handle: p.handle,
      images: p.images,
      variants: p.variants,
    })),
  })

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteConfig.url },
    { name: meta.title, url: `${siteConfig.url}/collections/${collection}` },
  ])

  return (
    <>
      {/* SEO JSON-LD Structured Data */}
      <JsonLd data={[collectionSchema, breadcrumbSchema]} />
      
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
