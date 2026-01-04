'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PageSignUp() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to the custom register page
    router.replace('/register')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-[#1B198F]"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Redirecting to sign up...</p>
        </div>
      </div>
    </div>
  )
}
