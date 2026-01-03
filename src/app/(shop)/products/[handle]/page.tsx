import connectDb from '@/lib/mongodb'
import Product from '@/models/product.model'
import PremiumProductPage from '@/components/product/PremiumProductPage'
import MegaHeader from '@/components/Header/MegaHeader'
import Footer from '@/components/Footer'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

interface Props {
  params: Promise<{ handle: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  await connectDb()
  const product = await Product.findOne({ handle, isDeleted: false }).lean()

  if (!product) {
    return { title: 'Product Not Found' }
  }

  return {
    title: `${(product as any).title} | Gibbon Nutrition`,
    description: (product as any).description?.slice(0, 160) || `Shop ${(product as any).title} at Gibbon Nutrition`,
    openGraph: {
      title: (product as any).title,
      description: (product as any).description?.slice(0, 160),
      images: (product as any).images?.[0]?.src ? [{ url: (product as any).images[0].src }] : [],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params
  await connectDb()

  const product = await Product.findOne({ handle, isDeleted: false }).lean()

  if (!product) {
    notFound()
  }

  // Get related products
  const relatedProducts = await Product.find({
    _id: { $ne: (product as any)._id },
    productCategory: (product as any).productCategory,
    isDeleted: false,
    published: true,
  })
    .limit(4)
    .lean()

  // Deep serialize all MongoDB ObjectIds to strings to avoid Server/Client component issues
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

  return (
    <>
      <MegaHeader />
      <PremiumProductPage product={serializedProduct as any} relatedProducts={serializedRelated as any} />
      <Footer />
    </>
  )
}
