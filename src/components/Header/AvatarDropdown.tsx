'use client'

import { useUser, useAuth } from '@/context/UserAuthContext'
import Link from 'next/link'
import { useState } from 'react'
import { User, LogOut } from 'lucide-react'

interface Props {
  className?: string
}

export default function AvatarDropdown({ className }: Props) {
  const { user, isSignedIn, isLoaded } = useUser()
  const { signOut } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)

  if (!isLoaded) {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700" />
  }

  if (!isSignedIn) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Link
          href="/login"
          className="text-sm font-medium text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white transition-colors"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="text-sm font-medium bg-primary-600 text-white px-3 py-1.5 rounded-md hover:bg-primary-700 transition-colors"
        >
          Sign Up
        </Link>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white"
      >
        {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
      </button>
      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 top-10 z-50 w-48 rounded-lg border border-neutral-200 bg-white py-2 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
            <Link
              href="/account"
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
              onClick={() => setShowDropdown(false)}
            >
              <User className="h-4 w-4" />
              My Account
            </Link>
            <button
              onClick={() => {
                setShowDropdown(false)
                signOut()
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  )
}
