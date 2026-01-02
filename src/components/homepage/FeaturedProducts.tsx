'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, Star, ShoppingBag, Heart, Eye } from 'lucide-react'
import { useCart } from '@/components/useCartStore'

interface Product {
  _id: string
  handle: string
  title: string
  images?: { src: string; alt?: string }[]
  variants?: {
    price: number
    compareAtPrice?: number
    option1Value?: string
  }[]
  reviews?: { star: number }[]
  productCategory?: string
  tags?: string[]
}

interface FeaturedProductsProps {
  products?: Product[]
  title?: string
  subtitle?: string
  className?: string
}

export default function FeaturedProducts({
  products = [],
  title = 'Bestsellers',
  subtitle = 'Our most loved products by the Gibbon community',
  className = '',
}: FeaturedProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)
  const { addItem } = useCart()

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400
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
      variants: variant.option1Value ? [{ name: 'Size', option: variant.option1Value }] : [],
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

  if (!products || products.length === 0) {
    return null
  }

  return (
    <section className={`relative overflow-hidden bg-white py-20 lg:py-32 dark:bg-neutral-900 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-2 inline-block text-sm font-bold uppercase tracking-wider text-[#1B198F]">
              ⚡ Trending Now
            </span>
            <h2 className="font-[family-name:var(--font-family-antonio)] text-4xl font-black uppercase text-neutral-900 sm:text-5xl dark:text-white">
              {title}
            </h2>
            <p className="mt-2 max-w-md text-neutral-600 dark:text-neutral-400">{subtitle}</p>
          </motion.div>

          {/* Navigation Arrows */}
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-neutral-200 bg-white text-neutral-700 transition-all hover:border-[#1B198F] hover:bg-[#1B198F] hover:text-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-neutral-200 bg-white text-neutral-700 transition-all hover:border-[#1B198F] hover:bg-[#1B198F] hover:text-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Products Carousel */}
        <div
          ref={scrollRef}
          className="-mx-4 flex gap-6 overflow-x-auto px-4 pb-4 scrollbar-hide"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {products.map((product, index) => {
            const variant = product.variants?.[0]
            const price = variant?.price || 0
            const compareAtPrice = variant?.compareAtPrice
            const discount = getDiscount(price, compareAtPrice)
            const rating = getAverageRating(product.reviews)
            const isHovered = hoveredProduct === product._id

            return (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="w-[280px] flex-shrink-0 sm:w-[320px]"
                style={{ scrollSnapAlign: 'start' }}
                onMouseEnter={() => setHoveredProduct(product._id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                <div className="group relative">
                  {/* Image Container */}
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                    <Link href={`/products/${product.handle}`}>
                      <Image
                        src={product.images?.[0]?.src || '/placeholder-images.webp'}
                        alt={product.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {/* Second Image on Hover */}
                      {product.images?.[1] && (
                        <Image
                          src={product.images[1].src}
                          alt={product.title}
                          fill
                          className="absolute inset-0 object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                        />
                      )}
                    </Link>

                    {/* Badges */}
                    <div className="absolute left-3 top-3 flex flex-col gap-2">
                      {discount > 0 && (
                        <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                          -{discount}%
                        </span>
                      )}
                      {index < 3 && (
                        <span className="rounded-full bg-[#1B198F] px-3 py-1 text-xs font-bold text-white">
                          BESTSELLER
                        </span>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
                      className="absolute right-3 top-3 flex flex-col gap-2"
                    >
                      <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-700 shadow-lg transition-colors hover:bg-[#1B198F] hover:text-white">
                        <Heart className="h-4 w-4" />
                      </button>
                      <Link
                        href={`/products/${product.handle}`}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-700 shadow-lg transition-colors hover:bg-[#1B198F] hover:text-white"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </motion.div>

                    {/* Quick Add Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
                      className="absolute bottom-4 left-4 right-4"
                    >
                      <button
                        onClick={() => handleQuickAdd(product)}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1B198F] py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-[#1B198F]/90"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        Quick Add
                      </button>
                    </motion.div>
                  </div>

                  {/* Product Info */}
                  <div className="mt-4">
                    {/* Category */}
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      {product.productCategory || 'Supplements'}
                    </p>

                    {/* Title */}
                    <Link href={`/products/${product.handle}`}>
                      <h3 className="mb-2 text-lg font-bold text-neutral-900 transition-colors hover:text-[#1B198F] dark:text-white">
                        {product.title}
                      </h3>
                    </Link>

                    {/* Rating */}
                    {rating > 0 && (
                      <div className="mb-2 flex items-center gap-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'fill-neutral-200 text-neutral-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-neutral-500">({product.reviews?.length || 0})</span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-neutral-900 dark:text-white">₹{price}</span>
                      {compareAtPrice && compareAtPrice > price && (
                        <span className="text-sm text-neutral-500 line-through">₹{compareAtPrice}</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <Link
            href="/collections/all"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#1B198F] transition-colors hover:text-[#1B198F]/80"
          >
            View All Products
            <ChevronRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
