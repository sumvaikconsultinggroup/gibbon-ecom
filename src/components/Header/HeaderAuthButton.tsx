'use client'

import { useUser, useAuth } from '@/context/UserAuthContext'
import Link from 'next/link'
import { useState } from 'react'
import { User, ShoppingBag, LogOut, Heart, Settings } from 'lucide-react'
import AccountDropdown from './AccountDropdown'

export default function HeaderAuthButton() {
  const { user, isSignedIn, isLoaded } = useUser()
  const { signOut } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)

  if (!isLoaded) {
    return (
      <div className="flex h-10 w-10 animate-pulse items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700" />
    )
  }

  if (!isSignedIn) {
    return (
      <>
        <Link
          href="/login"
          className="ml-2 hidden items-center justify-center rounded-full bg-[#1B198F] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#1B198F]/90 sm:flex"
        >
          Sign In
        </Link>
        <Link
          href="/login"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-neutral-100 sm:hidden dark:hover:bg-neutral-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-neutral-700 dark:text-neutral-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </Link>
      </>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1B198F] text-sm font-semibold text-white transition-colors hover:bg-[#1B198F]/90"
      >
        {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
      </button>
      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)} 
          />
          <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-neutral-200 bg-white py-2 shadow-xl dark:border-neutral-700 dark:bg-neutral-800">
            <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
              <p className="font-medium text-neutral-900 dark:text-neutral-100">
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'User'}
              </p>
              <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">{user?.email}</p>
            </div>
            <div className="py-1">
              <Link
                href="/account"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700"
                onClick={() => setShowDropdown(false)}
              >
                <User className="h-4 w-4" />
                My Account
              </Link>
              <Link
                href="/orders"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700"
                onClick={() => setShowDropdown(false)}
              >
                <ShoppingBag className="h-4 w-4" />
                My Orders
              </Link>
              <Link
                href="/wishlist"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700"
                onClick={() => setShowDropdown(false)}
              >
                <Heart className="h-4 w-4" />
                Wishlist
              </Link>
            </div>
            <div className="border-t border-neutral-200 py-1 dark:border-neutral-700">
              <button
                onClick={() => {
                  setShowDropdown(false)
                  signOut()
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
