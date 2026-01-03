'use client'

import { useUser } from '@/context/UserAuthContext'
import { useRouter } from 'next/navigation'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'

export default function CheckoutButton() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()

  const handleCheckout = () => {
    if (!isSignedIn) {
      // If the user is not signed in, redirect them to the login page.
      router.push('/login')
      return
    }

    // If the user is signed in, proceed to the checkout page.
    console.log('User is signed in, proceeding to checkout.')
    router.push('/checkout')
  }

  // We wait for auth to load before rendering the button
  if (!isLoaded) {
    return <div className="h-12 w-36 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
  }

  return <ButtonPrimary onClick={handleCheckout}>Proceed to Checkout</ButtonPrimary>
}