'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ShoppingBag, Clock, Zap, ChevronRight } from 'lucide-react'
import { useCart } from '@/components/useCartStore'

interface Product {
  _id: string
  handle: string
  title: string
  images?: { src: string }[]
  variants?: { price: number; compareAtPrice?: number }[]
  productCategory?: string
}

interface FlashDealsProps {
  products: Product[]
}

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        return { hours: 23, minutes: 59, seconds: 59 }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex items-center gap-2">
      <Clock className="h-5 w-5 text-red-500" />
      <div className="flex items-center gap-1 font-mono text-lg font-bold">
        <span className="rounded bg-red-500 px-2 py-1 text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="text-red-500">:</span>
        <span className="rounded bg-red-500 px-2 py-1 text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="text-red-500">:</span>
        <span className="rounded bg-red-500 px-2 py-1 text-white">{String(timeLeft.seconds).padStart(2, '0')}</span>
      </div>
    </div>
  )
}

export default function FlashDeals({ products }: FlashDealsProps) {
  const { addItem } = useCart()

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

  const getDiscount = (price: number, compareAt?: number) => {
    if (!compareAt || compareAt <= price) return 0
    return Math.round(((compareAt - price) / compareAt) * 100)
  }

  // Filter products with discounts
  const dealsProducts = products.filter(p => {
    const variant = p.variants?.[0]
    return variant?.compareAtPrice && variant.compareAtPrice > variant.price
  })

  if (dealsProducts.length === 0) return null

  return (
    <section className="py-10 bg-gradient-to-r from-red-600 to-orange-500">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-4"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur">
              <Zap className="h-7 w-7 text-yellow-300" />
            </div>
            <div>
              <h2 className="font-[family-name:var(--font-family-antonio)] text-2xl sm:text-3xl font-black uppercase text-white">
                Flash Deals
              </h2>
              <p className="text-white/80">Limited time offers - Don't miss out!</p>
            </div>
          </motion.div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2">
              <span className="text-sm text-white/80 mr-2">Ends in:</span>
              <CountdownTimer />
            </div>
            <Link
              href="/collections/offers"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-red-600 hover:bg-neutral-100"
            >
              View All Deals
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Products */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {dealsProducts.slice(0, 4).map((product, index) => {
            const variant = product.variants?.[0]
            const price = variant?.price || 0
            const compareAtPrice = variant?.compareAtPrice || 0
            const discount = getDiscount(price, compareAtPrice)

            return (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group rounded-2xl bg-white p-3 shadow-xl"
              >
                <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100">
                  <Link href={`/products/${product.handle}`}>
                    <Image
                      src={product.images?.[0]?.src || '/placeholder-images.webp'}
                      alt={product.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </Link>
                  <span className="absolute left-2 top-2 rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white">
                    -{discount}% OFF
                  </span>
                </div>
                <div className="mt-3">
                  <Link href={`/products/${product.handle}`}>
                    <h3 className="font-semibold text-neutral-900 line-clamp-1 hover:text-[#1B198F]">
                      {product.title}
                    </h3>
                  </Link>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-lg font-bold text-red-600">₹{price.toLocaleString()}</span>
                    <span className="text-sm text-neutral-500 line-through">₹{compareAtPrice.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => handleQuickAdd(product)}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#1B198F] py-2.5 text-sm font-bold text-white hover:bg-[#1B198F]/90"
                  >
                    <ShoppingBag className="h-4 w-4" /> Add to Cart
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
