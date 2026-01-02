'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Tag,
  Truck,
  Shield,
  ChevronRight,
  X,
  Gift,
  Percent,
  CheckCircle,
} from 'lucide-react'
import { useCart } from '@/components/useCartStore'
import MegaHeader from '@/components/Header/MegaHeader'
import Footer from '@/components/Footer'

const freeShippingThreshold = 999

export default function CartPage() {
  const { items, removeItem, updateItemQuantity, removeAll } = useCart()
  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoError, setPromoError] = useState('')
  const [promoSuccess, setPromoSuccess] = useState('')
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const shipping = subtotal >= freeShippingThreshold ? 0 : 99
  const total = subtotal - promoDiscount + shipping
  const progressToFreeShipping = Math.min((subtotal / freeShippingThreshold) * 100, 100)
  const amountToFreeShipping = Math.max(freeShippingThreshold - subtotal, 0)

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return
    setIsApplyingPromo(true)
    setPromoError('')
    setPromoSuccess('')

    try {
      const res = await fetch('/api/promoCode/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, cartTotal: subtotal }),
      })
      const data = await res.json()

      if (data.success && data.discount) {
        setPromoDiscount(data.discount)
        setPromoSuccess(`Code applied! You save ₹${data.discount}`)
      } else {
        setPromoError(data.message || 'Invalid promo code')
      }
    } catch (err) {
      setPromoError('Failed to apply promo code')
    } finally {
      setIsApplyingPromo(false)
    }
  }

  const removePromo = () => {
    setPromoCode('')
    setPromoDiscount(0)
    setPromoSuccess('')
    setPromoError('')
  }

  if (items.length === 0) {
    return (
      <>
        <MegaHeader />
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
            <ShoppingBag className="h-12 w-12 text-neutral-400" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-neutral-900 dark:text-white">Your cart is empty</h1>
          <p className="mb-8 text-neutral-500">Looks like you haven't added anything to your cart yet.</p>
          <Link
            href="/collections/all"
            className="flex items-center gap-2 rounded-full bg-[#1B198F] px-8 py-4 font-bold text-white transition-all hover:bg-[#1B198F]/90"
          >
            Start Shopping
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <MegaHeader />
      <div className="min-h-screen bg-neutral-50 py-8 lg:py-12 dark:bg-neutral-950">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-[family-name:var(--font-family-antonio)] text-3xl font-black uppercase text-neutral-900 sm:text-4xl dark:text-white">
              Shopping Cart
            </h1>
            <p className="mt-2 text-neutral-500">{items.length} item(s) in your cart</p>
          </div>

          {/* Free Shipping Progress */}
          {subtotal < freeShippingThreshold && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 p-4 dark:from-green-900/20 dark:to-emerald-900/20"
            >
              <div className="flex items-center gap-3">
                <Truck className="h-6 w-6 text-green-600" />
                <div className="flex-1">
                  <p className="font-semibold text-green-800 dark:text-green-400">
                    Add ₹{amountToFreeShipping.toFixed(0)} more for FREE shipping!
                  </p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-green-200 dark:bg-green-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressToFreeShipping}%` }}
                      className="h-full rounded-full bg-green-500"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div
                      key={`${item.productId}-${item.variantId}`}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-900 sm:gap-6 sm:p-6"
                    >
                      {/* Image */}
                      <Link href={`/products/${item.handle}`} className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:h-32 sm:w-32">
                        <Image src={item.imageUrl || '/placeholder-images.webp'} alt={item.name} fill className="object-cover" />
                      </Link>

                      {/* Info */}
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between">
                          <div>
                            <Link href={`/products/${item.handle}`} className="font-semibold text-neutral-900 hover:text-[#1B198F] dark:text-white">
                              {item.name}
                            </Link>
                            {item.variants && item.variants.length > 0 && (
                              <p className="mt-1 text-sm text-neutral-500">
                                {item.variants.map((v) => `${v.name}: ${v.option}`).join(' | ')}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(item.productId, item.variantId)}
                            className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="mt-auto flex items-end justify-between pt-4">
                          {/* Quantity */}
                          <div className="flex items-center rounded-full border border-neutral-200 dark:border-neutral-700">
                            <button
                              onClick={() => updateItemQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="flex h-9 w-9 items-center justify-center text-neutral-500 hover:text-neutral-900"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                              className="flex h-9 w-9 items-center justify-center text-neutral-500 hover:text-neutral-900"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Price */}
                          <p className="text-lg font-bold text-neutral-900 dark:text-white">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Clear Cart */}
              <div className="mt-6 flex justify-end">
                <button onClick={removeAll} className="text-sm font-semibold text-red-500 hover:text-red-600">
                  Clear Cart
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-900">
                <h2 className="mb-6 text-xl font-bold text-neutral-900 dark:text-white">Order Summary</h2>

                {/* Promo Code */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Promo Code
                  </label>
                  {promoSuccess ? (
                    <div className="flex items-center justify-between rounded-xl bg-green-50 p-3 dark:bg-green-900/20">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-semibold text-green-700 dark:text-green-400">{promoSuccess}</span>
                      </div>
                      <button onClick={removePromo} className="text-green-600 hover:text-green-700">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        className="flex-1 rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-800"
                      />
                      <button
                        onClick={applyPromoCode}
                        disabled={isApplyingPromo}
                        className="rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-50 dark:bg-neutral-700"
                      >
                        {isApplyingPromo ? '...' : 'Apply'}
                      </button>
                    </div>
                  )}
                  {promoError && <p className="mt-2 text-sm text-red-500">{promoError}</p>}
                </div>

                {/* Summary Lines */}
                <div className="space-y-3 border-b border-neutral-200 pb-4 dark:border-neutral-700">
                  <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center gap-1">
                        <Tag className="h-4 w-4" /> Discount
                      </span>
                      <span>-₹{promoDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'font-semibold text-green-600' : ''}>
                      {shipping === 0 ? 'FREE' : `₹${shipping}`}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between py-4">
                  <span className="text-lg font-bold text-neutral-900 dark:text-white">Total</span>
                  <span className="text-2xl font-black text-neutral-900 dark:text-white">₹{total.toLocaleString()}</span>
                </div>

                {/* Checkout Button */}
                <Link
                  href="/checkout"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1B198F] py-4 font-bold uppercase tracking-wider text-white transition-all hover:bg-[#1B198F]/90"
                >
                  Proceed to Checkout
                  <ArrowRight className="h-5 w-5" />
                </Link>

                {/* Trust Badges */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <Shield className="h-4 w-4" /> Secure Payment
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <Truck className="h-4 w-4" /> Fast Delivery
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
