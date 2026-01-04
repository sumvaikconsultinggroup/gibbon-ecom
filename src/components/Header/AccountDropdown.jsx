'use client'

import { useAuth } from '@/context/UserAuthContext'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { User, Heart, Wallet, ShoppingBag, LogOut, Loader2 } from 'lucide-react'

const AccountDropdown = () => {
  const { user, isLoading, isSignedIn, signOut } = useAuth()
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

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="h-8 w-8 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
      </div>
    )
  }

  if (!isSignedIn || !user) {
    return (
      <Link
        href="/login"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 transition-all hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
      >
        <User className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
      </Link>
    )
  }

  const displayName = user.firstName 
    ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
    : user.email?.split('@')[0] || 'User'
  
  const initials = user.firstName 
    ? user.firstName.charAt(0).toUpperCase()
    : user.email?.charAt(0).toUpperCase() || 'U'

  return (
    <div className="group relative flex h-full items-center">
      <button className="relative h-8 w-8 overflow-hidden rounded-full bg-[#1B198F] ring-2 ring-transparent transition-all hover:ring-neutral-200 dark:hover:ring-neutral-700">
        {user.imageUrl ? (
          <Image
            src={user.imageUrl}
            alt={displayName}
            fill
            className="object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-white">
            {initials}
          </span>
        )}
      </button>

      <div className="invisible absolute right-0 top-full z-50 w-48 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
          <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
            <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
              {displayName}
            </p>
            <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
              {user.email}
            </p>
          </div>
          <div className="py-1">
            <Link
              href="/account"
              className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              <User className="h-4 w-4" />
              Account
            </Link>
            <Link
              href="/account-wishlists"
              className="flex items-center justify-between px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              <span className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Wishlist
              </span>
              {wishlistCount > 0 && (
                <span className="h-2 w-2 rounded-full bg-blue-500" />
              )}
            </Link>
            <Link
              href="/account-wallet"
              className="flex items-center justify-between px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              <span className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Wallet
              </span>
              <span className="text-xs font-medium text-green-600 dark:text-green-500">
                {walletPoints} pts
              </span>
            </Link>
            <Link
              href="/cart"
              className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              <ShoppingBag className="h-4 w-4" />
              View Order
            </Link>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountDropdown
