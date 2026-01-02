'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Star, ShoppingBag, Heart, Eye, Flame, ChevronRight, Award } from 'lucide-react'
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
  tags?: string[]
}

interface BestSellersProps {
  products: Product[]
}

export default function BestSellers({ products }: BestSellersProps) {
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

  const getAverageRating = (reviews?: { star: number }[]) => {
    if (!reviews || reviews.length === 0) return 0
    return reviews.reduce((acc, r) => acc + r.star, 0) / reviews.length
  }

  const getDiscount = (price: number, compareAt?: number) => {
    if (!compareAt || compareAt <= price) return 0
    return Math.round(((compareAt - price) / compareAt) * 100)
  }

  if (!products || products.length === 0) return null

  return (
    <section className="py-16 lg:py-24 bg-white dark:bg-neutral-950">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-bold uppercase tracking-wider text-yellow-600">Top Rated</span>
            </div>
            <h2 className="font-[family-name:var(--font-family-antonio)] text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-neutral-900 dark:text-white">
              Bestsellers
            </h2>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">Our most loved products by 50,000+ customers</p>
          </motion.div>
          <Link
            href="/collections/bestsellers"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#1B198F] hover:underline"
          >
            View All Bestsellers
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.slice(0, 8).map((product, index) => {
            const variant = product.variants?.[0]
            const price = variant?.price || 0
            const compareAtPrice = variant?.compareAtPrice
            const discount = getDiscount(price, compareAtPrice)
            const rating = getAverageRating(product.reviews)
            const isHovered = hoveredProduct === product._id

            return (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group"
                onMouseEnter={() => setHoveredProduct(product._id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-900">
                  <Link href={`/products/${product.handle}`}>
                    <Image
                      src={product.images?.[0]?.src || '/placeholder-images.webp'}
                      alt={product.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </Link>

                  {/* Badges */}
                  <div className="absolute left-3 top-3 flex flex-col gap-2">
                    {index < 3 && (
                      <span className="flex items-center gap-1 rounded-full bg-yellow-500 px-2.5 py-1 text-xs font-bold text-black">
                        <Flame className="h-3 w-3" /> #{index + 1} Best
                      </span>
                    )}
                    {discount > 0 && (
                      <span className="rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
                        -{discount}%
                      </span>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
                    className="absolute bottom-3 left-3 right-3"
                  >
                    <button
                      onClick={() => handleQuickAdd(product)}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1B198F] py-3 text-sm font-bold text-white shadow-lg"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Add to Cart
                    </button>
                  </motion.div>

                  {/* Wishlist */}
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-lg hover:bg-red-50 hover:text-red-500"
                  >
                    <Heart className="h-4 w-4" />
                  </motion.button>
                </div>

                {/* Product Info */}
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#1B198F]">
                    {product.productCategory}
                  </p>
                  <Link href={`/products/${product.handle}`}>
                    <h3 className="mt-1 font-semibold text-neutral-900 line-clamp-2 hover:text-[#1B198F] dark:text-white">
                      {product.title}
                    </h3>
                  </Link>
                  {rating > 0 && (
                    <div className="mt-1.5 flex items-center gap-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-neutral-200 text-neutral-200'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-neutral-500">({product.reviews?.length})</span>
                    </div>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-lg font-bold text-neutral-900 dark:text-white">₹{price.toLocaleString()}</span>
                    {compareAtPrice && compareAtPrice > price && (
                      <span className="text-sm text-neutral-500 line-through">₹{compareAtPrice.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
