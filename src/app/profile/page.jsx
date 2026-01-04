'use client'

import { useUser } from '@/context/UserAuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export default function ProfilePage() {
  const { user, isLoading, isSignedIn } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isSignedIn) {
      router.push('/login')
    }
  }, [isLoading, isSignedIn, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B198F]" />
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Redirecting to login...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm dark:bg-neutral-800">
        <h1 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-white">
          Hello, {user?.firstName || 'User'}!
        </h1>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-500">Email</label>
            <p className="text-neutral-900 dark:text-white">{user?.email}</p>
          </div>
          {user?.firstName && (
            <div>
              <label className="text-sm font-medium text-neutral-500">First Name</label>
              <p className="text-neutral-900 dark:text-white">{user.firstName}</p>
            </div>
          )}
          {user?.lastName && (
            <div>
              <label className="text-sm font-medium text-neutral-500">Last Name</label>
              <p className="text-neutral-900 dark:text-white">{user.lastName}</p>
            </div>
          )}
          {user?.phone && (
            <div>
              <label className="text-sm font-medium text-neutral-500">Phone</label>
              <p className="text-neutral-900 dark:text-white">{user.phone}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
