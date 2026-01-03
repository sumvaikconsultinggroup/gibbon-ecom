'use client'

import { useUser } from '@/context/UserAuthContext'
import axios from 'axios'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

const WishlistBtn = () => {
  const { isSignedIn } = useUser()
  const [count, setCount] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchWishlist = async () => {
    if (!isSignedIn) {
      setCount(0)
      return
    }
    try {
      const { data } = await axios.get('/api/wishlists')
      if (data && data.wishlist) {
        setCount(data.wishlist.length)
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    }
  }

  useEffect(() => {
    if (isSignedIn) {
      fetchWishlist()
    } else {
      setCount(0)
    }

    const handleWishlistUpdate = () => {
      fetchWishlist()
    }

    window.addEventListener('wishlist-updated', handleWishlistUpdate)
    return () => {
      window.removeEventListener('wishlist-updated', handleWishlistUpdate)
    }
  }, [isSignedIn])

  if (!mounted) return null

  return (
    <Link
      href="/wishlist"
      className="relative flex h-10 w-10 font-bold items-center justify-center rounded-full text-black hover:bg-neutral-100 transition-colors dark:text-neutral-300 dark:hover:bg-neutral-800"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[10px] font-medium text-white ring-2 ring-white dark:ring-neutral-900">
          {count}
        </span>
      )}
    </Link>
  )
}

export default WishlistBtn