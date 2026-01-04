'use client'

import ProductCard from '@/components/ProductCard'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { useUser } from '@/context/UserAuthContext'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { HeartIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'

const Page = () => {
  const { user, isLoading, isSignedIn } = useUser()
  const router = useRouter()
  
  const [wishlistProducts, setWishlistProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isLoading && !isSignedIn) {
      router.push('/login?redirect=/account-wishlists')
    }
  }, [isSignedIn, isLoading, router])

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (!isSignedIn || !user) {
        setLoading(false)
        return
      }

      try {
        const wishlistResponse = await axios.get('/api/wishlists')
        const wishlist = wishlistResponse.data.wishlist || []

        if (wishlist.length === 0) {
          setWishlistProducts([])
          setLoading(false)
          return
        }

        const productsResponse = await axios.get('/api/products')
        const allProducts = productsResponse.data.data || []

        const wishlistProductIds = wishlist.map(item => item.productId)
        const filteredProducts = allProducts.filter(product => 
          wishlistProductIds.includes(product._id)
        )

        setWishlistProducts(filteredProducts)
      } catch (error) {
        console.error('Error fetching wishlist:', error)
        setError('Failed to load your wishlist. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    if (isSignedIn && user) {
      fetchWishlistProducts()
    }
  }, [isSignedIn, user])

  const handleProductRemoved = (productId) => {
    setWishlistProducts(prev => prev.filter(product => product._id !== productId))
    router.refresh()
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-[#E3F2FD] border-t-[#3086C8]"></div>
          <p className="font-family-roboto text-lg font-medium text-neutral-700 dark:text-neutral-300">
            Loading your wishlist...
          </p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-[#1B198F]/10 to-[#3086C8]/10">
            <HeartIcon className="h-12 w-12 text-[#3086C8]" />
          </div>
          <h2 className="font-family-antonio mb-3 text-3xl font-black uppercase text-[#1B198F] dark:text-[#3086C8]">
            Sign In Required
          </h2>
          <p className="mb-8 font-family-roboto text-neutral-600 dark:text-neutral-400">
            Please sign in to view and manage your saved products
          </p>
          <ButtonPrimary 
            onClick={() => router.push('/login?redirect=/account-wishlists')}
            className="rounded-xl bg-linear-to-r from-[#1B198F] to-[#3086C8] px-8 py-3 font-family-antonio text-base font-bold uppercase"
          >
            Sign In Now
          </ButtonPrimary>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-[#E3F2FD] border-t-[#3086C8]"></div>
          <p className="font-family-roboto text-lg font-medium text-neutral-700 dark:text-neutral-300">
            Loading your favorites...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <svg className="h-12 w-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="font-family-antonio mb-3 text-2xl font-black uppercase text-red-600 dark:text-red-400">
            Oops! Something Went Wrong
          </h2>
          <p className="mb-8 font-family-roboto text-neutral-600 dark:text-neutral-400">
            {error}
          </p>
          <ButtonPrimary 
            onClick={() => window.location.reload()}
            className="rounded-xl bg-red-600 px-8 py-3 font-family-antonio text-base font-bold uppercase hover:bg-red-700"
          >
            Try Again
          </ButtonPrimary>
        </div>
      </div>
    )
  }

  if (wishlistProducts.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-xl text-center">
          <div className="relative mx-auto mb-8 inline-block">
            <div className="absolute inset-0 animate-ping rounded-full bg-[#3086C8]/20"></div>
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-[#1B198F] to-[#3086C8] shadow-xl">
              <HeartIcon className="h-16 w-16 text-white" strokeWidth={2} />
            </div>
          </div>
          
          <h2 className="font-family-antonio mb-4 text-4xl font-black uppercase text-[#1B198F] dark:text-[#3086C8]">
            Your Wishlist is Empty
          </h2>
          
          <p className="mb-10 font-family-roboto text-lg text-neutral-600 dark:text-neutral-400">
            Start building your collection of favorite products. <br />
            Click the heart icon on any product to add it here!
          </p>

          {/* Feature Cards */}
          <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
              <div className="mb-2 text-2xl">💙</div>
              <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Save Favorites</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
              <div className="mb-2 text-2xl">🔔</div>
              <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Get Notified</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
              <div className="mb-2 text-2xl">🛒</div>
              <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Quick Access</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => router.push('/collections/all-items')}
              className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1B198F] to-[#3086C8] px-8 py-4 font-family-antonio text-base font-bold uppercase text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            >
              <ShoppingBagIcon className="h-5 w-5 transition-transform group-hover:scale-110" />
              Explore Products
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#3086C8] bg-transparent px-8 py-4 font-family-antonio text-base font-bold uppercase text-[#3086C8] transition-all hover:bg-[#3086C8]/10"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 font-family-roboto">
      {/* Header Card */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-r from-white to-[#E3F2FD]/30 shadow-sm dark:border-neutral-700 dark:from-neutral-800 dark:to-neutral-800">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1B198F] to-[#3086C8] shadow-lg">
                <HeartIcon className="h-8 w-8 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="font-family-antonio text-3xl font-black uppercase text-[#1B198F] dark:text-[#3086C8]">
                  My Wishlist
                </h1>
                <p className="mt-1 flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3086C8] text-xs font-bold text-white">
                    {wishlistProducts.length}
                  </span>
                  {wishlistProducts.length === 1 ? 'Saved Product' : 'Saved Products'}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="hidden sm:flex gap-3">
              <button
                onClick={() => router.push('/collections/all-items')}
                className="rounded-lg border-2 border-[#3086C8] bg-transparent px-4 py-2 text-sm font-semibold text-[#3086C8] transition-all hover:bg-[#3086C8]/10"
              >
                Browse More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter/Sort Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-[#3086C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
          <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            All Items
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Click the heart to remove items
        </div>
      </div>

      {/* Products Grid - Original ProductCard */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:gap-x-8 lg:grid-cols-3">
        {wishlistProducts.map((product) => (
          <ProductCard 
            key={product._id}
            data={product}
            isLiked={true}
            onWishlistChange={() => handleProductRemoved(product._id)}
          />
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="rounded-2xl border-2 border-dashed border-[#3086C8]/30 bg-gradient-to-br from-[#E3F2FD]/30 to-white p-8 text-center dark:border-[#3086C8]/20 dark:from-neutral-800 dark:to-neutral-800">
        <div className="mx-auto max-w-md">
          <div className="mb-4 text-4xl">🎉</div>
          <h3 className="font-family-antonio mb-2 text-2xl font-black uppercase text-[#1B198F] dark:text-[#3086C8]">
            Love What You See?
          </h3>
          <p className="mb-6 text-neutral-600 dark:text-neutral-400">
            Discover more amazing products to add to your collection
          </p>
          <button
            onClick={() => router.push('/collections/all-items')}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1B198F] to-[#3086C8] px-8 py-3 font-family-antonio text-base font-bold uppercase text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            <ShoppingBagIcon className="h-5 w-5" />
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  )
}

export default Page
