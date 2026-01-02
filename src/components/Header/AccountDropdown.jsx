// c:\Users\dell\Desktop\gibbon-ecomm\src\components\Header\AccountDropdown.tsx
'use client'

import { useClerk, useUser } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useEffect, useState } from 'react'

const AccountDropdown = () => {
  const { isLoaded, user } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const [wishlistCount, setWishlistCount] = useState(0)
  const [walletPoints, setWalletPoints] = useState(0)

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) return
      try {
        const { data } = await axios.get('/api/wishlists')
        if (data && data.wishlist) {
          setWishlistCount(data.wishlist.length)
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error)
      }
    }

    const fetchWallet = async () => {
      if (!user) return
      try {
        const { data } = await axios.get(`/api/wallet?userId=${user.id}`)
        if (data) {
          setWalletPoints(data.points || 0)
        }
      } catch (error) {
        console.error('Error fetching wallet:', error)
      }
    }

    if (user) {
      fetchWishlist()
      fetchWallet()
    }

    const handleWishlistUpdate = () => fetchWishlist()
    window.addEventListener('wishlist-updated', handleWishlistUpdate)
    return () => window.removeEventListener('wishlist-updated', handleWishlistUpdate)
  }, [user])

  if (!isLoaded || !user) {
    return (
      <div className="h-8 w-8 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700" />
    )
  }

  return (
    <div className="group relative flex h-full items-center">
      <button className="relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-transparent transition-all hover:ring-neutral-200 dark:hover:ring-neutral-700">
        <Image
          src={user.imageUrl}
          alt={user.fullName || 'Account'}
          fill
          className="object-cover"
        />
      </button>

      <div className="invisible absolute right-0 top-full z-50 w-48 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
          <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
            <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
              {user.fullName}
            </p>
            <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>
          <div className="py-1">
            <Link
              href="/account"
              className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              Account
            </Link>
            <Link
              href="/account-wishlists"
              className="flex items-center justify-between px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              <span>Wishlist</span>
              {wishlistCount > 0 && (
                <span className="h-2 w-2 rounded-full bg-blue-500" />
              )}
            </Link>
            <Link
              href="/account-wallet"
              className="flex items-center justify-between px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              <span>Wallet</span>
              <span className="text-xs font-medium text-green-600 dark:text-green-500">
                {walletPoints} pts
              </span>
            </Link>
            <Link
              href="/cart"
              className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              View Order
            </Link>
            <button
              onClick={() => signOut(() => router.push('/'))}
              className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountDropdown
