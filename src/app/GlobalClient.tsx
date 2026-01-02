'use client'

import { Toaster } from 'react-hot-toast'
import { Suspense } from 'react'
import CartInitializer from '@/components/CartInitializer'

const GlobalClient = () => {
  return (
    <>
      <Suspense fallback={null}>
        <CartInitializer />
      </Suspense>
      <Toaster />
    </>
  )
}

export default GlobalClient
