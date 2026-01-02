'use client'

import { useCart } from '@/components/useCartStore'
import { Input } from '@/shared/input'
import NcImage from '@/shared/NcImage/NcImage'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { CartItem } from '@/components/useCartStore'

interface OrderSummaryProps {
  onSummaryUpdate: (details: { subtotal: number; discount: number; shipping: number; taxes: number; total: number }) => void
}

interface PromoCodeDetails {
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  appliesTo: 'all' | 'products' | 'categories'
  productIds?: string[]
  categoryNames?: string[]
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ onSummaryUpdate }) => {
  const {
    items: cartItems,
    removeItem,
    updateItemQuantity,
    applyPromoCode: applyPromoCodeToStore,
    removePromoCode: removePromoCodeFromStore,
    appliedPromoCode: appliedPromoCodeFromStore,
  } = useCart()

  const [isClient, setIsClient] = useState(false)
  const [promoCodeInput, setPromoCodeInput] = useState('')
  const [promoMessage, setPromoMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Combined state for discount details
  const [appliedPromoCode, setAppliedPromoCode] = useState<PromoCodeDetails | null>(null)
  const [discount, setDiscount] = useState(0)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const shipping = 0

  // Effect to calculate discount and update parent
  useEffect(() => {
    let newDiscount = 0
    let finalPromoCode = appliedPromoCode

    // Automatic discount suggestions (they don't apply automatically)
    if (!finalPromoCode) {
      if (subtotal >= 10000) {
        // Suggest GIBBON10 but don't apply it
      } else if (subtotal >= 5000) {
        // Suggest GIBBON5
      }
    }

    if (finalPromoCode) {
      const applicableItems =
        finalPromoCode.appliesTo === 'all'
          ? cartItems
          : cartItems.filter((item) => {
            if (finalPromoCode.appliesTo === 'products' && finalPromoCode.productIds) {
              return finalPromoCode.productIds.includes(item.productId)
            }
            if (finalPromoCode.appliesTo === 'categories' && finalPromoCode.categoryNames && item.category) {
              return finalPromoCode.categoryNames.includes(item.category)
            }
            return false
          })

      const applicableSubtotal = applicableItems.reduce((acc, item) => acc + item.price * item.quantity, 0)

      if (finalPromoCode.discountType === 'percentage') {
        newDiscount = applicableSubtotal * (finalPromoCode.discountValue / 100)
      } else {
        newDiscount = finalPromoCode.discountValue
      }
    }

    const taxes = 0 // Assuming taxes are not calculated yet.
    setDiscount(newDiscount)
    const total = Math.max(0, subtotal + shipping - newDiscount)
    onSummaryUpdate({ subtotal, discount: newDiscount, shipping, taxes, total })
  }, [subtotal, shipping, onSummaryUpdate, appliedPromoCode, cartItems])

  const handleApplyPromoCode = async (code: string) => {
    if (!code) return
    setIsLoading(true)
    setPromoMessage('')

    // Optimistically apply automatic discounts locally
    if (code.toUpperCase() === 'GIBBON10' && subtotal >= 10000) {
      const promoDetails: PromoCodeDetails = {
        code: 'GIBBON10',
        discountType: 'percentage',
        discountValue: 10,
        appliesTo: 'all',
      }
      setAppliedPromoCode(promoDetails)
      setPromoMessage('Applied 10% discount!')
      setPromoCodeInput(code)
      setIsLoading(false)
      return
    }
    if (code.toUpperCase() === 'GIBBON5' && subtotal >= 5000) {
      const promoDetails: PromoCodeDetails = {
        code: 'GIBBON5',
        discountType: 'percentage',
        discountValue: 5,
        appliesTo: 'all',
      }
      setAppliedPromoCode(promoDetails)
      setPromoMessage('Applied 5% discount!')
      setPromoCodeInput(code)
      setIsLoading(false)
      return
    }

    // Check backend for other codes
    try {
      const response = await fetch('/api/promoCode/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code,
          cartItems: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      })

      const result = await response.json()

      if (result.success) {
        setAppliedPromoCode(result.promoCode)
        setPromoMessage('Promo code applied successfully!')
        setPromoCodeInput(result.promoCode.code)
      } else {
        setPromoMessage(result.message || 'Failed to apply promo code.')
        setAppliedPromoCode(null)
      }
    } catch (error) {
      console.error('Promo code fetch error:', error)
      setPromoMessage('An error occurred while applying the promo code.')
      setAppliedPromoCode(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemovePromoCode = () => {
    setAppliedPromoCode(null)
    setPromoCodeInput('')
    setDiscount(0)
    setPromoMessage('Promo code removed.')
  }

  const total = Math.max(0, subtotal + shipping - discount)

  if (!isClient) {
    return null
  }

  return (
    <div className="sticky top-28">
      <h3 className="text-lg font-semibold">Order Summary</h3>
      <div className="mt-7 divide-y divide-neutral-200/70 border-y border-neutral-200/70 dark:divide-neutral-700 dark:border-neutral-700">
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <div key={item.id} className="flex py-5 last:pb-0">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                {item.imageUrl && <NcImage src={item.imageUrl} alt={item.name} fill sizes="100px" className="h-full w-full object-contain object-center" />}
                <Link className="absolute inset-0" href={`/product-detail/${item.productId}`} />
              </div>
              <div className="ml-4 flex flex-1 flex-col">
                <div>
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-sm font-medium">
                        <Link href={`/product-detail/${item.productId}`}>{item.name}</Link>
                      </h3>
                      {item.variants && item.variants.length > 0 && (
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                          {item.variants.map((v) => v.option).join(' / ')}
                        </p>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm font-medium">₹{item.price.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex flex-1 items-end justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center overflow-hidden rounded-md border border-neutral-300 dark:border-neutral-600">
                      <button
                        type="button"
                        onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="flex h-6 w-6 items-center justify-center text-xs font-medium transition-colors hover:bg-neutral-100 disabled:opacity-40 dark:hover:bg-neutral-800"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>

                      <span className="flex h-6 min-w-7 items-center justify-center border-x border-neutral-300 text-xs font-semibold dark:border-neutral-600">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= 99}
                        className="flex h-6 w-6 items-center justify-center text-xs font-medium transition-colors hover:bg-neutral-100 disabled:opacity-40 dark:hover:bg-neutral-800"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                  </div>
                  <div className="flex">
                    <button type="button" onClick={() => removeItem(item.id)} className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-500">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="py-5 text-neutral-500">Your cart is empty.</p>
        )}
      </div>

      <div className="mt-10 space-y-4 pt-6 text-sm text-neutral-500 dark:text-neutral-400">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-medium text-neutral-900 dark:text-neutral-200">₹{subtotal.toFixed(2)}</span>
        </div>
        {discount > 0 && appliedPromoCode && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>
                Discount <span className="text-xs font-normal">({appliedPromoCode.code})</span>
              </span>
              <button onClick={handleRemovePromoCode} className="text-xs font-medium text-red-500">
                Remove
              </button>
            </div>
            <span className="font-medium text-green-600 dark:text-green-500">-₹{discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Shipping estimate</span>
          <span className="font-medium text-neutral-900 dark:text-neutral-200">₹{shipping.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-neutral-200/70 pt-4 text-base font-semibold text-neutral-900 dark:border-neutral-700 dark:text-neutral-200">
          <span>Order total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
      </div>

      {!appliedPromoCode && (
        <div className="mt-4 space-y-2">
          {subtotal >= 10000 ? (
            <button
              onClick={() => handleApplyPromoCode('GIBBON10')}
              className="w-full rounded-lg border border-dashed border-green-500 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
            >
              Apply 10% OFF (GIBBON10)
            </button>
          ) : (
            subtotal >= 5000 && (
              <button
                onClick={() => handleApplyPromoCode('GIBBON5')}
                className="w-full rounded-lg border border-dashed border-green-500 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
              >
                Apply 5% OFF (GIBBON5)
              </button>
            )
          )}
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-base font-semibold">Promo code</h3>
        <div className="mt-3.5 flex">
          <Input
            className="flex-1"
            placeholder="Promo code"
            value={promoCodeInput}
            onChange={(e) => setPromoCodeInput(e.target.value)}
            disabled={!!appliedPromoCode || isLoading}
          />
          <button
            onClick={() => handleApplyPromoCode(promoCodeInput)}
            disabled={!!appliedPromoCode || isLoading || !promoCodeInput}
            className="ml-2 flex w-24 items-center justify-center rounded-lg bg-neutral-200 px-4 text-sm font-medium hover:bg-neutral-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-700 dark:hover:bg-neutral-600"
          >
            {isLoading ? (
              <svg className="h-5 w-5 animate-spin text-neutral-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Apply'
            )}
          </button>
        </div>
        {promoMessage && (
          <p className={`mt-2 text-sm ${promoMessage.includes('Failed') || promoMessage.includes('error') || promoMessage.includes('invalid') ? 'text-red-500' : 'text-green-500'}`}>
            {promoMessage}
          </p>
        )}
      </div>
    </div>
  )
}

export default OrderSummary