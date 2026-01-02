'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Star, ShoppingBag, Heart, Sparkles, ChevronRight, Clock } from 'lucide-react'
import { useCart } from '@/components/useCartStore'
import { useState } from 'react'

interface Product {
  _id: string
  handle: string
  title: string
  images?: { src: string }[]
  variants?: { price: number; compareAtPrice?: number }[]
  reviews?: { star: number }[]
  productCategory?: string
}

interface NewArrivalsProps {
  products: Product[]
}

export default function NewArrivals({ products }: NewArrivalsProps) {
  const { addItem } = useCart()
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)

  const handleQuickAdd = (product: Product) => {
    const variant = product.variants?.[0]
    if (!variant) return
    addItem({
      productId: product._id,
      name: product.title,
      price: variant.price,
      imageUrl: product.images?.[0]?.src || '',
      handle: product.handle,
      variants: [],
    })
  }

  if (!products || products.length === 0) return null

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-bold uppercase tracking-wider text-purple-600">Just Dropped</span>
            </div>
            <h2 className="font-[family-name:var(--font-family-antonio)] text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-neutral-900 dark:text-white">
              New Arrivals
            </h2>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">Fresh products to elevate your fitness game</p>
          </motion.div>
          <Link
            href="/collections/new"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#1B198F] hover:underline"
          >
            View All New
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Products Grid - Featured Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Featured Large Card */}
          {products[0] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-2 lg:col-span-1 lg:row-span-2"
            >
              <div
                className="group relative h-full min-h-[400px] lg:min-h-full overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-700"
                onMouseEnter={() => setHoveredProduct(products[0]._id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                <Image
                  src={products[0].images?.[0]?.src || '/placeholder-images.webp'}
                  alt={products[0].title}
                  fill
                  className="object-cover opacity-40 transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
                  <span className="inline-flex w-fit items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm mb-3">
                    <Clock className="h-3 w-3" /> Just Arrived
                  </span>
                  <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">{products[0].title}</h3>
                  <p className="text-white/80 mb-4">{products[0].productCategory}</p>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-white">₹{products[0].variants?.[0]?.price?.toLocaleString()}</span>
                    {products[0].variants?.[0]?.compareAtPrice && (
                      <span className="text-lg text-white/60 line-through">
                        ₹{products[0].variants[0].compareAtPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => handleQuickAdd(products[0])}
                      className="flex-1 flex items-center justify-center gap-2 rounded-full bg-white py-3 font-bold text-neutral-900 hover:bg-neutral-100"
                    >
                      <ShoppingBag className="h-5 w-5" /> Add to Cart
                    </button>
                    <Link
                      href={`/products/${products[0].handle}`}
                      className="flex items-center justify-center rounded-full border-2 border-white px-6 py-3 font-bold text-white hover:bg-white/10"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Smaller Cards */}
          {products.slice(1, 5).map((product, index) => {
            const variant = product.variants?.[0]
            const price = variant?.price || 0
            const isHovered = hoveredProduct === product._id

            return (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (index + 1) * 0.1 }}
                className="group"
                onMouseEnter={() => setHoveredProduct(product._id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                  <Link href={`/products/${product.handle}`}>
                    <Image
                      src={product.images?.[0]?.src || '/placeholder-images.webp'}
                      alt={product.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </Link>
                  <span className="absolute left-3 top-3 rounded-full bg-purple-500 px-3 py-1 text-xs font-bold text-white">
                    NEW
                  </span>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
                    className="absolute bottom-3 left-3 right-3"
                  >
                    <button
                      onClick={() => handleQuickAdd(product)}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1B198F] py-2.5 text-sm font-bold text-white"
                    >
                      <ShoppingBag className="h-4 w-4" /> Quick Add
                    </button>
                  </motion.div>
                </div>
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-purple-600">
                    {product.productCategory}
                  </p>
                  <Link href={`/products/${product.handle}`}>
                    <h3 className="mt-1 font-semibold text-neutral-900 line-clamp-1 hover:text-[#1B198F] dark:text-white">
                      {product.title}
                    </h3>
                  </Link>
                  <p className="mt-1 text-lg font-bold text-neutral-900 dark:text-white">₹{price.toLocaleString()}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
