import connectDb from '@/lib/mongodb'
import Product from '@/models/product.model'
import PremiumProductPage from '@/components/product/PremiumProductPage'
import MegaHeader from '@/components/Header/MegaHeader'
import Footer from '@/components/Footer'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { generateProductSchema, generateBreadcrumbSchema, siteConfig } from '@/lib/seo'
import JsonLd from '@/components/SEO/JsonLd'

interface Props {
  params: Promise<{ handle: string }>
}

// Strip HTML tags for clean text
function stripHtml(html: string): string {
  return html?.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() || ''
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  await connectDb()
  const product = await Product.findOne({ handle, isDeleted: false }).lean() as any

  if (!product) {
    return { title: 'Product Not Found' }
  }

  const description = stripHtml(product.bodyHtml || product.description || '').slice(0, 160)
  const price = product.variants?.[0]?.price || 0
  const image = product.images?.[0]?.src

  return {
    title: product.title,
    description: description || `Buy ${product.title} at best price. Premium quality supplements from Gibbon Nutrition. Free shipping on orders above ₹999.`,
    keywords: [
      product.title,
      product.productCategory,
      product.vendor,
      'buy online',
      'best price',
      'Gibbon Nutrition',
      ...(product.tags || []),
    ].filter(Boolean),
    alternates: {
      canonical: `/products/${handle}`,
    },
    openGraph: {
      type: 'website',
      title: `${product.title} - ₹${price.toLocaleString()}`,
      description: description || `Shop ${product.title} at Gibbon Nutrition`,
      url: `${siteConfig.url}/products/${handle}`,
      siteName: 'Gibbon Nutrition',
      images: image ? [
        {
          url: image,
          width: 800,
          height: 800,
          alt: product.title,
        },
      ] : [],
      locale: 'en_IN',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} - ₹${price.toLocaleString()}`,
      description: description,
      images: image ? [image] : [],
    },
    other: {
      'product:price:amount': String(price),
      'product:price:currency': 'INR',
      'product:availability': product.variants?.[0]?.inventoryQty > 0 ? 'in stock' : 'out of stock',
      'product:category': product.productCategory || 'Supplements',
      'product:brand': product.vendor || 'Gibbon Nutrition',
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params
  await connectDb()

  const product = await Product.findOne({ handle, isDeleted: false }).lean() as any

  if (!product) {
    notFound()
  }

  // Get related products
  const relatedProducts = await Product.find({
    _id: { $ne: product._id },
    productCategory: product.productCategory,
    isDeleted: false,
    published: true,
  })
    .limit(4)
    .lean()

  // Deep serialize all MongoDB ObjectIds to strings
  const deepSerialize = (obj: any) => JSON.parse(JSON.stringify(obj, (key, value) => {
    if (value && typeof value === 'object' && value._bsontype === 'ObjectId') {
      return value.toString()
    }
    if (key === '_id' && value) {
      return value.toString ? value.toString() : String(value)
    }
    return value
  }))

  const serializedProduct = deepSerialize(product)
  const serializedRelated = relatedProducts.map((p: any) => deepSerialize(p))

  // Generate SEO Schemas
  const productSchema = generateProductSchema({
    title: product.title,
    description: stripHtml(product.bodyHtml || product.description || ''),
    handle: product.handle,
    images: product.images,
    variants: product.variants,
    reviews: product.reviews,
    vendor: product.vendor,
    productCategory: product.productCategory,
  })

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteConfig.url },
    { name: product.productCategory || 'Products', url: `${siteConfig.url}/collections/${product.productCategory?.toLowerCase().replace(/\s+/g, '-') || 'all-items'}` },
    { name: product.title, url: `${siteConfig.url}/products/${handle}` },
  ])

  return (
    <>
      {/* SEO JSON-LD Structured Data */}
      <JsonLd data={[productSchema, breadcrumbSchema]} />
      
      <MegaHeader />
      <PremiumProductPage product={serializedProduct as any} relatedProducts={serializedRelated as any} />
      <Footer />
    </>
  )
}
