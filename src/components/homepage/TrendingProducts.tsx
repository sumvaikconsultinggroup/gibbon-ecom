'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, ShoppingBag, TrendingUp, Star } from 'lucide-react'
import { useCart } from '@/components/useCartStore'

interface Product {
  _id: string
  handle: string
  title: string
  images?: { src: string }[]
  variants?: { price: number; compareAtPrice?: number }[]
  reviews?: { star: number }[]
  productCategory?: string
}

interface TrendingProductsProps {
  products: Product[]
}

export default function TrendingProducts({ products }: TrendingProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)
  const { addItem } = useCart()

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 350
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

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

  if (!products || products.length === 0) return null

  return (
    <section className="py-16 lg:py-24 bg-white dark:bg-neutral-950">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-sm font-bold uppercase tracking-wider text-green-600">Popular Now</span>
            </div>
            <h2 className="font-[family-name:var(--font-family-antonio)] text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-neutral-900 dark:text-white">
              Trending Products
            </h2>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">What everyone's buying right now</p>
          </motion.div>

          {/* Navigation Arrows */}
          <div className="hidden sm:flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-neutral-200 hover:border-[#1B198F] hover:bg-[#1B198F] hover:text-white transition-colors dark:border-neutral-700"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-neutral-200 hover:border-[#1B198F] hover:bg-[#1B198F] hover:text-white transition-colors dark:border-neutral-700"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Products Carousel */}
        <div
          ref={scrollRef}
          className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {products.map((product, index) => {
            const variant = product.variants?.[0]
            const price = variant?.price || 0
            const compareAtPrice = variant?.compareAtPrice
            const rating = getAverageRating(product.reviews)
            const isHovered = hoveredProduct === product._id

            return (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="w-[280px] flex-shrink-0 sm:w-[320px]"
                style={{ scrollSnapAlign: 'start' }}
                onMouseEnter={() => setHoveredProduct(product._id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                <div className="group relative aspect-square overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-900">
                  <Link href={`/products/${product.handle}`}>
                    <Image
                      src={product.images?.[0]?.src || '/placeholder-images.webp'}
                      alt={product.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </Link>

                  {/* Trending Badge */}
                  <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white">
                    <TrendingUp className="h-3 w-3" /> Trending
                  </span>

                  {/* Quick Add */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
                    className="absolute bottom-3 left-3 right-3"
                  >
                    <button
                      onClick={() => handleQuickAdd(product)}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1B198F] py-3 text-sm font-bold text-white shadow-lg"
                    >
                      <ShoppingBag className="h-4 w-4" /> Add to Cart
                    </button>
                  </motion.div>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-green-600">
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
