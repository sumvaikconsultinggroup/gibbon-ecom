import connectDb from '@/lib/mongodb'
import Product from '@/models/product.model'
import ProductPageClient from '@/components/product/ProductPageClient'
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

  // Serialize for client component
  const serializedProduct = {
    ...product,
    _id: (product as any)._id.toString(),
    reviews: ((product as any).reviews || []).map((r: any) => ({
      ...r,
      _id: r._id?.toString() || '',
    })),
  }

  const serializedRelated = relatedProducts.map((p: any) => ({
    ...p,
    _id: p._id.toString(),
  }))

  return (
    <>
      <MegaHeader />
      <ProductPageClient product={serializedProduct as any} relatedProducts={serializedRelated as any} />
      <Footer />
    </>
  )
}
