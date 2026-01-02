'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  X,
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  Truck,
  Gift,
  Tag,
  ChevronRight,
  Sparkles,
  Clock,
  Shield,
  Package,
  ArrowRight,
  Heart,
  Percent,
  Zap,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { useAside } from './aside/aside'
import { CartItem, useCart } from './useCartStore'

// Recommended products for upsell
const recommendedProducts = [
  {
    id: '1',
    name: 'BCAA Energy',
    price: 1499,
    compareAtPrice: 1999,
    image: '/placeholder-images.webp',
    handle: 'bcaa-energy',
  },
  {
    id: '2', 
    name: 'Creatine Mono',
    price: 999,
    compareAtPrice: 1299,
    image: '/placeholder-images.webp',
    handle: 'creatine-mono',
  },
]

// Progress milestones
const milestones = [
  { threshold: 999, label: 'Free Shipping', icon: Truck, achieved: false },
  { threshold: 2999, label: '5% OFF', icon: Tag, achieved: false },
  { threshold: 4999, label: '10% OFF', icon: Gift, achieved: false },
]

export default function PremiumCartDrawer() {
  const { type, close } = useAside()
  const isOpen = type === 'cart'
  const { items, removeItem, updateItemQuantity, totalItems } = useCart()
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [showCouponInput, setShowCouponInput] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  
  // Calculate progress and discounts
  const currentMilestones = milestones.map(m => ({
    ...m,
    achieved: subtotal >= m.threshold,
    remaining: Math.max(0, m.threshold - subtotal),
  }))

  const nextMilestone = currentMilestones.find(m => !m.achieved)
  const progress = nextMilestone 
    ? Math.min((subtotal / nextMilestone.threshold) * 100, 100)
    : 100

  // Calculate discount
  let discountPercent = 0
  if (subtotal >= 4999) discountPercent = 10
  else if (subtotal >= 2999) discountPercent = 5
  
  const discountAmount = (subtotal * discountPercent) / 100
  const shippingFee = subtotal >= 999 ? 0 : 99
  const total = subtotal - discountAmount + shippingFee

  const handleRemove = async (id: string) => {
    setRemovingId(id)
    await new Promise(resolve => setTimeout(resolve, 300))
    removeItem(id)
    setRemovingId(null)
  }

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'GIBBON10') {
      setAppliedCoupon('GIBBON10')
      setShowCouponInput(false)
    }
  }

  return (
    <Dialog as="div" className="relative z-[9999]" onClose={close} open={isOpen}>
      <DialogBackdrop
        as={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
      />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
            <DialogPanel
              as={motion.div}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="pointer-events-auto w-screen max-w-md"
            >
              <div className="flex h-full flex-col bg-white shadow-2xl dark:bg-neutral-900">
                {/* Header */}
                <div className="relative overflow-hidden bg-gradient-to-r from-[#1B198F] to-blue-600 px-6 py-5">
                  {/* Animated background pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute -left-4 -top-4 h-24 w-24 rounded-full bg-white" />
                    <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-white" />
                  </div>
                  
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                        <ShoppingBag className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white">Your Cart</h2>
                        <p className="text-sm text-white/80">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={close}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
                    >
                      <X className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>

                {/* Progress Bar Section */}
                {items.length > 0 && (
                  <div className="border-b border-neutral-100 bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 dark:border-neutral-800 dark:from-amber-900/20 dark:to-orange-900/20">
                    {/* Progress Milestones */}
                    <div className="mb-3 flex items-center justify-between">
                      {currentMilestones.map((milestone, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                              milestone.achieved
                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                                : 'bg-neutral-200 text-neutral-400 dark:bg-neutral-700'
                            }`}
                          >
                            {milestone.achieved ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <milestone.icon className="h-4 w-4" />
                            )}
                          </motion.div>
                          <span className={`mt-1 text-[10px] font-semibold ${
                            milestone.achieved ? 'text-green-600' : 'text-neutral-500'
                          }`}>
                            {milestone.label}
                          </span>
                          <span className="text-[9px] text-neutral-400">₹{milestone.threshold.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
                      />
                      {/* Animated shimmer */}
                      <motion.div
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      />
                    </div>

                    {/* Next milestone message */}
                    {nextMilestone && (
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-center text-sm font-medium text-amber-700 dark:text-amber-400"
                      >
                        <Sparkles className="mr-1 inline-block h-4 w-4" />
                        Add ₹{nextMilestone.remaining.toLocaleString()} more for {nextMilestone.label}!
                      </motion.p>
                    )}
                  </div>
                )}

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto">
                  {items.length > 0 ? (
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                      <AnimatePresence mode="popLayout">
                        {items.map((item, index) => (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: removingId === item.id ? 0.5 : 1, x: 0 }}
                            exit={{ opacity: 0, x: -100, height: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="relative p-4"
                          >
                            <div className="flex gap-4">
                              {/* Product Image */}
                              <Link 
                                href={`/products/${item.handle}`}
                                onClick={close}
                                className="group relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800"
                              >
                                {item.imageUrl && (
                                  <Image
                                    src={item.imageUrl}
                                    alt={item.name}
                                    fill
                                    className="object-cover transition-transform group-hover:scale-110"
                                  />
                                )}
                                {item.comapreAtPrice && item.comapreAtPrice > item.price && (
                                  <span className="absolute left-1 top-1 rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                    -{Math.round(((item.comapreAtPrice - item.price) / item.comapreAtPrice) * 100)}%
                                  </span>
                                )}
                              </Link>

                              {/* Product Details */}
                              <div className="flex flex-1 flex-col justify-between">
                                <div>
                                  <Link 
                                    href={`/products/${item.handle}`}
                                    onClick={close}
                                    className="font-semibold text-neutral-900 transition-colors hover:text-[#1B198F] dark:text-white"
                                  >
                                    {item.name}
                                  </Link>
                                  {item.variant && (
                                    <p className="mt-0.5 text-sm text-neutral-500">
                                      {[item.variant.option1Value, item.variant.option2Value].filter(Boolean).join(' / ')}
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center justify-between">
                                  {/* Quantity Controls */}
                                  <div className="flex items-center rounded-full border border-neutral-200 dark:border-neutral-700">
                                    <motion.button
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => item.quantity > 1 && updateItemQuantity(item.id, item.quantity - 1)}
                                      disabled={item.quantity <= 1}
                                      className="flex h-8 w-8 items-center justify-center text-neutral-500 transition-colors hover:text-neutral-900 disabled:opacity-30 dark:hover:text-white"
                                    >
                                      <Minus className="h-4 w-4" />
                                    </motion.button>
                                    <span className="w-8 text-center text-sm font-bold text-neutral-900 dark:text-white">
                                      {item.quantity}
                                    </span>
                                    <motion.button
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                      className="flex h-8 w-8 items-center justify-center text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-white"
                                    >
                                      <Plus className="h-4 w-4" />
                                    </motion.button>
                                  </div>

                                  {/* Price */}
                                  <div className="text-right">
                                    <p className="font-bold text-[#1B198F]">
                                      ₹{(item.price * item.quantity).toLocaleString()}
                                    </p>
                                    {item.comapreAtPrice && (
                                      <p className="text-xs text-neutral-400 line-through">
                                        ₹{(item.comapreAtPrice * item.quantity).toLocaleString()}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Remove Button */}
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleRemove(item.id)}
                                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:bg-neutral-800 dark:hover:bg-red-900/30"
                              >
                                <Trash2 className="h-4 w-4" />
                              </motion.button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex h-full flex-col items-center justify-center p-8 text-center"
                    >
                      <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                        <ShoppingBag className="h-12 w-12 text-neutral-300 dark:text-neutral-600" />
                      </div>
                      <h3 className="mb-2 text-xl font-bold text-neutral-900 dark:text-white">Your cart is empty</h3>
                      <p className="mb-6 text-neutral-500">Looks like you haven't added anything yet.</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={close}
                      >
                        <Link
                          href="/collections/all"
                          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#1B198F] to-blue-600 px-6 py-3 font-semibold text-white shadow-lg"
                        >
                          Start Shopping
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Upsell Section */}
                  {items.length > 0 && (
                    <div className="border-t border-neutral-100 bg-gradient-to-b from-neutral-50 to-white p-4 dark:border-neutral-800 dark:from-neutral-800/50 dark:to-neutral-900">
                      <div className="mb-3 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-bold text-neutral-900 dark:text-white">Complete Your Stack</span>
                      </div>
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {recommendedProducts.map((product) => (
                          <Link
                            key={product.id}
                            href={`/products/${product.handle}`}
                            onClick={close}
                            className="group flex-shrink-0"
                          >
                            <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform group-hover:scale-110"
                              />
                              <span className="absolute bottom-1 left-1 rounded bg-green-500 px-1 py-0.5 text-[9px] font-bold text-white">
                                -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                              </span>
                            </div>
                            <p className="mt-1 w-20 truncate text-xs font-medium text-neutral-700 group-hover:text-[#1B198F] dark:text-neutral-300">
                              {product.name}
                            </p>
                            <p className="text-xs font-bold text-[#1B198F]">₹{product.price}</p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer - Order Summary */}
                {items.length > 0 && (
                  <div className="border-t border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
                    {/* Coupon Section */}
                    <AnimatePresence>
                      {showCouponInput ? (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mb-4 overflow-hidden"
                        >
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value)}
                              placeholder="Enter coupon code"
                              className="flex-1 rounded-xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-800"
                            />
                            <button
                              onClick={applyCoupon}
                              className="rounded-xl bg-[#1B198F] px-4 py-2 text-sm font-semibold text-white"
                            >
                              Apply
                            </button>
                          </div>
                        </motion.div>
                      ) : !appliedCoupon ? (
                        <button
                          onClick={() => setShowCouponInput(true)}
                          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 py-2 text-sm font-medium text-neutral-500 transition-colors hover:border-[#1B198F] hover:text-[#1B198F] dark:border-neutral-700"
                        >
                          <Tag className="h-4 w-4" />
                          Have a coupon code?
                        </button>
                      ) : (
                        <div className="mb-4 flex items-center justify-between rounded-xl bg-green-50 px-4 py-2 dark:bg-green-900/20">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-semibold text-green-700 dark:text-green-400">{appliedCoupon} applied!</span>
                          </div>
                          <button onClick={() => setAppliedCoupon(null)} className="text-xs text-red-500 hover:underline">
                            Remove
                          </button>
                        </div>
                      )}
                    </AnimatePresence>

                    {/* Order Summary */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                        <span>Subtotal</span>
                        <span>₹{subtotal.toLocaleString()}</span>
                      </div>
                      {discountPercent > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span className="flex items-center gap-1">
                            <Percent className="h-3 w-3" />
                            Discount ({discountPercent}%)
                          </span>
                          <span>-₹{discountAmount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Truck className="h-3 w-3" />
                          Shipping
                        </span>
                        <span className={shippingFee === 0 ? 'text-green-600' : ''}>
                          {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                        </span>
                      </div>
                      <div className="border-t border-neutral-200 pt-2 dark:border-neutral-700">
                        <div className="flex justify-between text-lg font-bold text-neutral-900 dark:text-white">
                          <span>Total</span>
                          <span className="text-[#1B198F]">₹{total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-4 flex items-center justify-center gap-4 text-xs text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Shield className="h-3 w-3" /> Secure Checkout
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="h-3 w-3" /> Fast Delivery
                      </span>
                    </div>

                    {/* Checkout Button */}
                    <motion.div className="mt-4">
                      <Link
                        href="/checkout"
                        onClick={close}
                        className="group relative block overflow-hidden rounded-xl bg-gradient-to-r from-[#1B198F] to-blue-600 p-4 text-center shadow-lg shadow-[#1B198F]/30 transition-all hover:shadow-xl"
                      >
                        {/* Animated shine effect */}
                        <motion.div
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
                          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        />
                        <div className="relative flex items-center justify-center gap-3">
                          <span className="text-lg font-bold uppercase tracking-wider text-white">
                            Checkout
                          </span>
                          <ArrowRight className="h-5 w-5 text-white transition-transform group-hover:translate-x-1" />
                        </div>
                        <div className="relative mt-1 flex items-center justify-center gap-2">
                          <span className="text-xs text-white/80">Pay securely with</span>
                          <div className="flex -space-x-1">
                            {['/paytm.png', '/phonepe.png', '/google.png'].map((src, i) => (
                              <div key={i} className="relative h-5 w-5 overflow-hidden rounded-full border border-white/50 bg-white">
                                <Image src={src} alt="payment" fill className="object-cover" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </Link>
                    </motion.div>

                    {/* Continue Shopping */}
                    <button
                      onClick={close}
                      className="mt-3 flex w-full items-center justify-center gap-1 text-sm font-medium text-neutral-500 transition-colors hover:text-[#1B198F]"
                    >
                      Continue Shopping
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
