'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { useCart } from '@/components/useCartStore'
import MegaHeader from '@/components/Header/MegaHeader'
import Footer from '@/components/Footer'

interface WishlistItem {
  _id: string
  handle: string
  title: string
  images?: { src: string }[]
  variants?: { price: number; compareAtPrice?: number }[]
}

export default function WishlistPage() {
  const { isSignedIn, user } = useUser()
  const { addItem } = useCart()
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!isSignedIn || !user) {
        setIsLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/wishlists?clerkId=${user.id}`)
        const data = await res.json()
        if (data.success && data.data) {
          setWishlist(data.data.productIds || [])
        }
      } catch (err) {
        console.error('Error fetching wishlist:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWishlist()
  }, [isSignedIn, user])

  const removeFromWishlist = async (productId: string) => {
    if (!user) return

    try {
      await fetch('/api/wishlists', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clerkId: user.id, productId }),
      })
      setWishlist((prev) => prev.filter((item) => item._id !== productId))
    } catch (err) {
      console.error('Error removing from wishlist:', err)
    }
  }

  const handleAddToCart = (item: WishlistItem) => {
    const variant = item.variants?.[0]
    if (!variant) return
    addItem({
      productId: item._id,
      name: item.title,
      price: variant.price,
      imageUrl: item.images?.[0]?.src || '',
      handle: item.handle,
      variants: [],
    })
  }

  if (!isSignedIn) {
    return (
      <>
        <MegaHeader />
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20">
          <Heart className="mb-6 h-16 w-16 text-neutral-300" />
          <h1 className="mb-2 text-2xl font-bold">Sign in to view your wishlist</h1>
          <p className="mb-8 text-neutral-500">Keep track of your favorite products</p>
          <Link
            href="/sign-in"
            className="rounded-full bg-[#1B198F] px-8 py-4 font-bold text-white transition-all hover:bg-[#1B198F]/90"
          >
            Sign In
          </Link>
        </div>
        <Footer />
      </>
    )
  }

  if (isLoading) {
    return (
      <>
        <MegaHeader />
        <div className="min-h-[60vh] py-12">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square rounded-2xl bg-neutral-200" />
                  <div className="mt-4 h-4 w-3/4 rounded bg-neutral-200" />
                  <div className="mt-2 h-4 w-1/2 rounded bg-neutral-200" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (wishlist.length === 0) {
    return (
      <>
        <MegaHeader />
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20">
          <Heart className="mb-6 h-16 w-16 text-neutral-300" />
          <h1 className="mb-2 text-2xl font-bold">Your wishlist is empty</h1>
          <p className="mb-8 text-neutral-500">Save your favorite items to buy later</p>
          <Link
            href="/collections/all"
            className="flex items-center gap-2 rounded-full bg-[#1B198F] px-8 py-4 font-bold text-white transition-all hover:bg-[#1B198F]/90"
          >
            Explore Products
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <MegaHeader />
      <div className="min-h-screen bg-neutral-50 py-8 lg:py-12 dark:bg-neutral-950">
        <div className="container mx-auto px-4">
          <h1 className="mb-8 font-[family-name:var(--font-family-antonio)] text-3xl font-black uppercase sm:text-4xl">
            My Wishlist ({wishlist.length})
          </h1>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {wishlist.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-900"
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                    <Link href={`/products/${item.handle}`}>
                      <Image
                        src={item.images?.[0]?.src || '/placeholder-images.webp'}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </Link>
                    <button
                      onClick={() => removeFromWishlist(item._id)}
                      className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-red-500 shadow-lg transition-colors hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4">
                    <Link href={`/products/${item.handle}`}>
                      <h3 className="font-semibold text-neutral-900 hover:text-[#1B198F] dark:text-white">
                        {item.title}
                      </h3>
                    </Link>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-lg font-bold">₹{item.variants?.[0]?.price || 0}</span>
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1B198F] text-white transition-colors hover:bg-[#1B198F]/90"
                      >
                        <ShoppingBag className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
