'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import {
  Star,
  Heart,
  ShoppingBag,
  Share2,
  Check,
  ChevronLeft,
  ChevronRight,
  Truck,
  Shield,
  RotateCcw,
  Award,
  Minus,
  Plus,
  Clock,
  Users,
  Zap,
  ChevronDown,
  Play,
  X,
  Flame,
  Package,
  BadgeCheck,
  Eye,
  TrendingUp,
  MapPin,
  Timer,
  Sparkles,
  Beaker,
  Dumbbell,
  Target,
  Info,
  ThumbsUp,
  MessageCircle,
  ZoomIn,
  Maximize2,
  Copy,
  Facebook,
  Twitter,
} from 'lucide-react'
import { useCart } from '@/components/useCartStore'
import { useAside } from '@/components/aside/aside'

interface ProductImage {
  src: string
  alt?: string
}

interface ProductVariant {
  _id?: string
  price: number
  compareAtPrice?: number
  option1Value?: string
  option2Value?: string
  inventoryQty?: number
  sku?: string
}

interface ProductReview {
  _id: string
  star: number
  text?: string
  name?: string
  reviewerName?: string
  reviewDescription?: string
  createdAt?: string
  image?: string
  helpful?: number
}

interface Product {
  _id: string
  handle: string
  title: string
  description?: string
  bodyHtml?: string
  images?: ProductImage[]
  variants?: ProductVariant[]
  reviews?: ProductReview[]
  productCategory?: string
  tags?: string[]
  options?: { name: string; values: string[] }[]
  benefits?: string[]
  nutritionFacts?: { name: string; value: string; percentage?: number }[]
  ingredients?: string
  howToUse?: string
  vendor?: string
}

interface PremiumProductPageProps {
  product: Product
  relatedProducts?: Product[]
}

// Trust badges with enhanced design
const trustBadges = [
  { icon: Truck, text: 'Free Shipping', subtext: 'Orders ₹999+', color: 'text-green-500', bg: 'bg-green-50' },
  { icon: Shield, text: '100% Authentic', subtext: 'Guaranteed', color: 'text-blue-500', bg: 'bg-blue-50' },
  { icon: RotateCcw, text: 'Easy Returns', subtext: '7 Day Policy', color: 'text-purple-500', bg: 'bg-purple-50' },
  { icon: Award, text: 'Lab Tested', subtext: 'Quality Assured', color: 'text-amber-500', bg: 'bg-amber-50' },
]

// Product highlights
const highlights = [
  { icon: Dumbbell, label: '24g Protein', desc: 'Per Serving' },
  { icon: Beaker, label: 'Lab Tested', desc: 'Certified' },
  { icon: Target, label: 'Fast Absorbing', desc: 'Whey Protein' },
  { icon: Sparkles, label: 'Premium Quality', desc: 'Imported' },
]

// FAQ data
const productFAQs = [
  { q: 'How should I take this product?', a: 'Mix 1 scoop (30g) with 200-250ml of cold water or milk. Shake well and consume immediately. Best taken post-workout or between meals.' },
  { q: 'Is this product suitable for beginners?', a: 'Yes! This protein is perfect for both beginners and advanced athletes. Start with one serving per day and adjust based on your protein needs.' },
  { q: 'Are there any side effects?', a: 'Our product is made from high-quality ingredients and is generally well-tolerated. However, if you have any pre-existing conditions, consult your doctor first.' },
  { q: 'How long will one pack last?', a: 'A 1kg pack contains approximately 33 servings. If you consume one serving daily, it will last about a month.' },
]

export default function PremiumProductPage({ product, relatedProducts = [] }: PremiumProductPageProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const [showStickyBar, setShowStickyBar] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [showLightbox, setShowLightbox] = useState(false)
  const [pincode, setPincode] = useState('')
  const [deliveryInfo, setDeliveryInfo] = useState<{available: boolean; date: string; cod: boolean} | null>(null)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [liveViewers, setLiveViewers] = useState(Math.floor(Math.random() * 50) + 20)
  const [recentPurchases, setRecentPurchases] = useState(Math.floor(Math.random() * 100) + 50)
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)
  const [helpfulReviews, setHelpfulReviews] = useState<Set<string>>(new Set())
  
  const imageRef = useRef<HTMLDivElement>(null)
  const addToCartRef = useRef<HTMLButtonElement>(null)
  const productInfoRef = useRef<HTMLDivElement>(null)

  const { addItem } = useCart()

  const images = product.images || []
  const variants = product.variants || []
  const reviews = product.reviews || []
  const currentVariant = variants[selectedVariant] || variants[0]
  const price = currentVariant?.price || 0
  const compareAtPrice = currentVariant?.compareAtPrice
  const discount = compareAtPrice && compareAtPrice > price ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0
  const avgRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.star, 0) / reviews.length : 0
  const inStock = (currentVariant?.inventoryQty ?? 10) > 0
  const lowStock = (currentVariant?.inventoryQty ?? 10) <= 5 && (currentVariant?.inventoryQty ?? 10) > 0

  // Get unique options
  const sizeOptions = [...new Set(variants.map((v) => v.option1Value).filter(Boolean))]

  // Simulated live viewers update
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveViewers(prev => prev + Math.floor(Math.random() * 5) - 2)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Sticky bar visibility
  useEffect(() => {
    const handleScroll = () => {
      if (addToCartRef.current) {
        const rect = addToCartRef.current.getBoundingClientRect()
        setShowStickyBar(rect.bottom < 0)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Image zoom handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return
    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x, y })
  }

  // Check delivery
  const checkDelivery = () => {
    if (pincode.length === 6) {
      // Simulate delivery check
      const date = new Date()
      date.setDate(date.getDate() + Math.floor(Math.random() * 3) + 3)
      setDeliveryInfo({
        available: true,
        date: date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
        cod: Math.random() > 0.3,
      })
    }
  }

  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    addItem({
      productId: product._id,
      variantId: currentVariant?._id,
      name: product.title,
      price: price,
      imageUrl: images[0]?.src || '',
      handle: product.handle,
      quantity: quantity,
      variants: currentVariant?.option1Value ? [{ name: 'Size', option: currentVariant.option1Value }] : [],
    })
    setIsAddingToCart(false)
  }

  const handleBuyNow = () => {
    handleAddToCart()
    window.location.href = '/checkout'
  }

  const markHelpful = (reviewId: string) => {
    setHelpfulReviews(prev => new Set(prev).add(reviewId))
  }

  const shareProduct = (platform: string) => {
    const url = window.location.href
    const text = `Check out ${product.title} at Gibbon Nutrition!`
    
    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      copy: url,
    }
    
    if (platform === 'copy') {
      navigator.clipboard.writeText(url)
      alert('Link copied!')
    } else {
      window.open(urls[platform], '_blank')
    }
    setShowShareMenu(false)
  }

  // Rating distribution calculation
  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.star === star).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.star === star).length / reviews.length) * 100 : 0,
  }))

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Breadcrumb with enhanced design */}
      <div className="bg-gradient-to-r from-neutral-50 to-neutral-100 py-3 dark:from-neutral-900 dark:to-neutral-900">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-neutral-500 transition-colors hover:text-[#1B198F]">Home</Link>
            <ChevronRight className="h-4 w-4 text-neutral-400" />
            <Link href="/collections/all" className="text-neutral-500 transition-colors hover:text-[#1B198F]">Products</Link>
            <ChevronRight className="h-4 w-4 text-neutral-400" />
            <span className="font-medium text-neutral-900 dark:text-white">{product.title}</span>
          </nav>
        </div>
      </div>

      {/* Live Social Proof Banner */}
      <div className="border-b border-neutral-100 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 py-2 dark:border-neutral-800 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-amber-900/20">
        <div className="container mx-auto flex flex-wrap items-center justify-center gap-6 px-4 text-sm">
          <motion.div 
            className="flex items-center gap-2"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Eye className="h-4 w-4 text-orange-500" />
            <span className="font-semibold text-orange-700 dark:text-orange-400">{liveViewers} people</span>
            <span className="text-orange-600 dark:text-orange-500">viewing this right now</span>
          </motion.div>
          <div className="hidden h-4 w-px bg-orange-200 dark:bg-orange-800 sm:block" />
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="font-semibold text-green-700 dark:text-green-400">{recentPurchases}+ sold</span>
            <span className="text-green-600 dark:text-green-500">in last 7 days</span>
          </div>
        </div>
      </div>

      {/* Main Product Section */}
      <section className="py-8 lg:py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
            {/* Enhanced Image Gallery */}
            <div className="space-y-4">
              {/* Main Image with Zoom */}
              <div
                ref={imageRef}
                className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-100 to-neutral-50 shadow-lg dark:from-neutral-900 dark:to-neutral-800"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
                onClick={() => setShowLightbox(true)}
              >
                {images[selectedImage] && (
                  <Image
                    src={images[selectedImage].src}
                    alt={images[selectedImage].alt || product.title}
                    fill
                    className={`object-cover transition-transform duration-300 ${
                      isZoomed ? 'scale-150' : 'scale-100'
                    }`}
                    style={isZoomed ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` } : {}}
                    priority
                  />
                )}

                {/* Badges */}
                <div className="absolute left-4 top-4 flex flex-col gap-2">
                  {discount > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-4 py-2 text-sm font-bold text-white shadow-lg"
                    >
                      -{discount}% OFF
                    </motion.span>
                  )}
                  {lowStock && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1.5 text-sm font-bold text-white shadow-lg"
                    >
                      <Flame className="h-4 w-4" /> Only {currentVariant?.inventoryQty} left!
                    </motion.span>
                  )}
                  {product.tags?.includes('bestseller') && (
                    <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-[#1B198F] to-blue-600 px-3 py-1.5 text-sm font-bold text-white shadow-lg">
                      <Award className="h-4 w-4" /> Bestseller
                    </span>
                  )}
                </div>

                {/* Zoom & Fullscreen Icons */}
                <div className="absolute right-4 top-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-all hover:bg-white">
                    <ZoomIn className="h-5 w-5 text-neutral-700" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowLightbox(true); }}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-all hover:bg-white"
                  >
                    <Maximize2 className="h-5 w-5 text-neutral-700" />
                  </button>
                </div>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1)); }}
                      className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-xl backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0)); }}
                      className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-xl backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
                  {selectedImage + 1} / {images.length}
                </div>
              </div>

              {/* Enhanced Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedImage(index)}
                      className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                        selectedImage === index 
                          ? 'border-[#1B198F] shadow-lg shadow-[#1B198F]/30' 
                          : 'border-transparent hover:border-neutral-300'
                      }`}
                    >
                      <Image src={image.src} alt={`${product.title} ${index + 1}`} fill className="object-cover" />
                      {selectedImage === index && (
                        <div className="absolute inset-0 bg-[#1B198F]/10" />
                      )}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Product Highlights Grid */}
              <div className="grid grid-cols-4 gap-3 rounded-2xl bg-gradient-to-br from-neutral-50 to-neutral-100 p-4 dark:from-neutral-900 dark:to-neutral-800">
                {highlights.map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex flex-col items-center gap-1 text-center"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1B198F]/10">
                      <item.icon className="h-5 w-5 text-[#1B198F]" />
                    </div>
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">{item.label}</span>
                    <span className="text-[10px] text-neutral-500">{item.desc}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div ref={productInfoRef} className="lg:sticky lg:top-24 lg:self-start">
              {/* Category & Rating */}
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-gradient-to-r from-[#1B198F] to-blue-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
                  {product.productCategory || 'Supplements'}
                </span>
                {avgRating > 0 && (
                  <div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 dark:bg-amber-900/30">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(avgRating) ? 'fill-amber-400 text-amber-400' : 'fill-neutral-200 text-neutral-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
                      {avgRating.toFixed(1)}
                    </span>
                    <span className="text-sm text-amber-600 dark:text-amber-500">
                      ({reviews.length} reviews)
                    </span>
                  </div>
                )}
              </div>

              {/* Title */}
              <h1 className="mb-4 font-[family-name:var(--font-family-antonio)] text-3xl font-black uppercase leading-tight text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white">
                {product.title}
              </h1>

              {/* Price Section */}
              <div className="mb-6 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 p-4 dark:from-green-900/20 dark:to-emerald-900/20">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-4xl font-black text-neutral-900 dark:text-white">₹{price.toLocaleString()}</span>
                  {compareAtPrice && compareAtPrice > price && (
                    <>
                      <span className="text-xl text-neutral-400 line-through">₹{compareAtPrice.toLocaleString()}</span>
                      <span className="rounded-full bg-green-500 px-3 py-1 text-sm font-bold text-white">
                        Save ₹{(compareAtPrice - price).toLocaleString()}
                      </span>
                    </>
                  )}
                </div>
                <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                  <Check className="mr-1 inline-block h-4 w-4" />
                  Inclusive of all taxes
                </p>
              </div>

              {/* Short Description */}
              {(product.description || product.bodyHtml) && (
                <p className="mb-6 text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {(product.description || product.bodyHtml || '').slice(0, 200)}...
                </p>
              )}

              {/* Size Options with Price */}
              {sizeOptions.length > 0 && (
                <div className="mb-6">
                  <label className="mb-3 flex items-center justify-between text-sm font-bold uppercase tracking-wider text-neutral-500">
                    <span>Select Size</span>
                    <button className="flex items-center gap-1 text-xs font-normal text-[#1B198F] hover:underline">
                      <Info className="h-3 w-3" /> Size Guide
                    </button>
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {sizeOptions.map((size, index) => {
                      const variantIndex = variants.findIndex((v) => v.option1Value === size)
                      const variant = variants[variantIndex]
                      const isSelected = currentVariant?.option1Value === size
                      return (
                        <motion.button
                          key={size}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedVariant(variantIndex >= 0 ? variantIndex : 0)}
                          className={`relative rounded-2xl border-2 px-6 py-3 transition-all ${
                            isSelected
                              ? 'border-[#1B198F] bg-[#1B198F] text-white shadow-lg shadow-[#1B198F]/30'
                              : 'border-neutral-200 bg-white text-neutral-700 hover:border-[#1B198F] hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                          }`}
                        >
                          <span className="text-sm font-bold">{size}</span>
                          {variant && (
                            <span className={`block text-xs ${isSelected ? 'text-white/80' : 'text-neutral-500'}`}>
                              ₹{variant.price.toLocaleString()}
                            </span>
                          )}
                          {isSelected && (
                            <motion.div
                              layoutId="selected-size"
                              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500"
                            >
                              <Check className="h-3 w-3 text-white" />
                            </motion.div>
                          )}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="mb-3 block text-sm font-bold uppercase tracking-wider text-neutral-500">Quantity</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center rounded-full border-2 border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="flex h-12 w-12 items-center justify-center text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-white"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <span className="w-12 text-center text-lg font-bold text-neutral-900 dark:text-white">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="flex h-12 w-12 items-center justify-center text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-white"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  {lowStock && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-1 text-sm font-semibold text-orange-500"
                    >
                      <Flame className="h-4 w-4" />
                      Only {currentVariant?.inventoryQty} left in stock!
                    </motion.span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                <motion.button
                  ref={addToCartRef}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={!inStock || isAddingToCart}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-[#1B198F] bg-white px-8 py-4 text-sm font-bold uppercase tracking-wider text-[#1B198F] transition-all hover:bg-[#1B198F]/5 disabled:opacity-50"
                >
                  {isAddingToCart ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Adding...
                    </span>
                  ) : (
                    <>
                      <ShoppingBag className="h-5 w-5" />
                      Add to Cart
                    </>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBuyNow}
                  disabled={!inStock}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#1B198F] to-blue-600 px-8 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-[#1B198F]/30 transition-all hover:shadow-xl disabled:opacity-50"
                >
                  <Zap className="h-5 w-5" />
                  Buy Now
                </motion.button>
              </div>

              {/* Wishlist & Share */}
              <div className="mb-6 flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    isWishlisted 
                      ? 'bg-red-50 text-red-500 dark:bg-red-900/30' 
                      : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                </motion.button>
                <div className="relative">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                  >
                    <Share2 className="h-5 w-5" />
                    Share
                  </motion.button>
                  <AnimatePresence>
                    {showShareMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute left-0 top-full z-20 mt-2 flex gap-2 rounded-xl bg-white p-2 shadow-xl dark:bg-neutral-800"
                      >
                        <button onClick={() => shareProduct('facebook')} className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600">
                          <Facebook className="h-5 w-5" />
                        </button>
                        <button onClick={() => shareProduct('twitter')} className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-white hover:bg-sky-600">
                          <Twitter className="h-5 w-5" />
                        </button>
                        <button onClick={() => shareProduct('whatsapp')} className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600">
                          <MessageCircle className="h-5 w-5" />
                        </button>
                        <button onClick={() => shareProduct('copy')} className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-500 text-white hover:bg-neutral-600">
                          <Copy className="h-5 w-5" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Delivery Check */}
              <div className="mb-6 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-700">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white">
                  <MapPin className="h-4 w-4 text-[#1B198F]" />
                  Check Delivery
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter Pincode"
                    className="flex-1 rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-800"
                  />
                  <button
                    onClick={checkDelivery}
                    disabled={pincode.length !== 6}
                    className="rounded-xl bg-[#1B198F] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    Check
                  </button>
                </div>
                {deliveryInfo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 space-y-2"
                  >
                    <p className="flex items-center gap-2 text-sm text-green-600">
                      <Check className="h-4 w-4" />
                      Delivery available to {pincode}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <Truck className="h-4 w-4" />
                      Expected delivery by <span className="font-semibold">{deliveryInfo.date}</span>
                    </p>
                    {deliveryInfo.cod && (
                      <p className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                        <BadgeCheck className="h-4 w-4 text-green-500" />
                        Cash on Delivery available
                      </p>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Enhanced Trust Badges */}
              <div className="grid grid-cols-2 gap-3">
                {trustBadges.map((badge, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-3 rounded-2xl ${badge.bg} p-4 dark:bg-opacity-20`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ${badge.color}`}>
                      <badge.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-neutral-900 dark:text-white">{badge.text}</p>
                      <p className="text-xs text-neutral-500">{badge.subtext}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Product Details Tabs */}
      <section className="border-t border-neutral-200 bg-gradient-to-b from-neutral-50 to-white py-12 dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-950">
        <div className="container mx-auto px-4">
          {/* Sticky Tabs */}
          <div className="mb-8 flex overflow-x-auto rounded-2xl bg-white p-2 shadow-sm dark:bg-neutral-800">
            {['description', 'ingredients', 'how-to-use', 'reviews', 'faq'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative whitespace-nowrap rounded-xl px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab
                    ? 'bg-[#1B198F] text-white shadow-md'
                    : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-700 dark:hover:text-white'
                }`}
              >
                {tab.replace('-', ' ')}
                {tab === 'reviews' && ` (${reviews.length})`}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-3xl bg-white p-6 shadow-sm dark:bg-neutral-800 lg:p-8"
            >
              {activeTab === 'description' && (
                <div className="prose prose-neutral max-w-none dark:prose-invert">
                  <p className="text-lg leading-relaxed">{product.description || product.bodyHtml || 'No description available.'}</p>
                  {product.benefits && product.benefits.length > 0 && (
                    <div className="mt-8">
                      <h3 className="mb-6 text-2xl font-bold">Key Benefits</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {product.benefits.map((benefit, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-4 rounded-2xl bg-green-50 p-4 dark:bg-green-900/20"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                              <Check className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-medium text-neutral-900 dark:text-white">{benefit}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'ingredients' && (
                <div className="prose prose-neutral max-w-none dark:prose-invert">
                  <div className="rounded-2xl bg-amber-50 p-6 dark:bg-amber-900/20">
                    <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
                      <Beaker className="h-6 w-6 text-amber-500" />
                      Ingredients
                    </h3>
                    <p className="whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
                      {product.ingredients || 'Ingredients information not available.'}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'how-to-use' && (
                <div className="prose prose-neutral max-w-none dark:prose-invert">
                  <div className="rounded-2xl bg-blue-50 p-6 dark:bg-blue-900/20">
                    <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
                      <Target className="h-6 w-6 text-blue-500" />
                      How to Use
                    </h3>
                    <p className="whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
                      {product.howToUse || 'Usage instructions not available.'}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  {/* Rating Summary */}
                  <div className="mb-8 grid gap-8 lg:grid-cols-3">
                    <div className="text-center">
                      <div className="text-6xl font-black text-neutral-900 dark:text-white">{avgRating.toFixed(1)}</div>
                      <div className="mt-2 flex justify-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-6 w-6 ${i < Math.floor(avgRating) ? 'fill-amber-400 text-amber-400' : 'fill-neutral-200 text-neutral-200'}`}
                          />
                        ))}
                      </div>
                      <p className="mt-2 text-neutral-500">Based on {reviews.length} reviews</p>
                    </div>
                    <div className="lg:col-span-2">
                      {ratingDistribution.map(({ star, count, percentage }) => (
                        <div key={star} className="mb-2 flex items-center gap-3">
                          <span className="w-8 text-sm font-medium">{star} ★</span>
                          <div className="h-3 flex-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.5 }}
                              className="h-full rounded-full bg-amber-400"
                            />
                          </div>
                          <span className="w-12 text-right text-sm text-neutral-500">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reviews List */}
                  {reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <motion.div 
                          key={review._id} 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="rounded-2xl border border-neutral-200 p-6 dark:border-neutral-700"
                        >
                          <div className="mb-4 flex items-start justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#1B198F] to-blue-600 text-lg font-bold text-white">
                                {(review.name || review.reviewerName || 'A').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-neutral-900 dark:text-white">{review.name || review.reviewerName || 'Anonymous'}</p>
                                <div className="flex items-center gap-2">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${i < review.star ? 'fill-amber-400 text-amber-400' : 'fill-neutral-200 text-neutral-200'}`}
                                      />
                                    ))}
                                  </div>
                                  {review.createdAt && (
                                    <span className="text-xs text-neutral-500">
                                      {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              <BadgeCheck className="h-3 w-3" /> Verified
                            </span>
                          </div>
                          <p className="text-neutral-600 dark:text-neutral-400">{review.text || review.reviewDescription}</p>
                          <div className="mt-4 flex items-center gap-4">
                            <button 
                              onClick={() => markHelpful(review._id)}
                              disabled={helpfulReviews.has(review._id)}
                              className={`flex items-center gap-1 text-sm ${helpfulReviews.has(review._id) ? 'text-green-500' : 'text-neutral-500 hover:text-neutral-900'}`}
                            >
                              <ThumbsUp className="h-4 w-4" />
                              Helpful {helpfulReviews.has(review._id) ? '✓' : `(${review.helpful || 0})`}
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <MessageCircle className="mx-auto mb-4 h-16 w-16 text-neutral-300" />
                      <p className="text-lg text-neutral-500">No reviews yet. Be the first to review!</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'faq' && (
                <div className="space-y-4">
                  {productFAQs.map((faq, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="rounded-2xl border border-neutral-200 dark:border-neutral-700"
                    >
                      <button
                        onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                        className="flex w-full items-center justify-between p-6 text-left"
                      >
                        <span className="font-bold text-neutral-900 dark:text-white">{faq.q}</span>
                        <ChevronDown className={`h-5 w-5 text-neutral-500 transition-transform ${expandedFAQ === index ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {expandedFAQ === index && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <p className="border-t border-neutral-200 p-6 text-neutral-600 dark:border-neutral-700 dark:text-neutral-400">
                              {faq.a}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-family-antonio)] text-3xl font-black uppercase">You May Also Like</h2>
              <Link href="/collections/all" className="flex items-center gap-1 text-sm font-semibold text-[#1B198F] hover:underline">
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {relatedProducts.slice(0, 4).map((p, index) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/products/${p.handle}`} className="group block">
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-100 shadow-sm transition-shadow hover:shadow-lg dark:bg-neutral-900">
                      <Image
                        src={p.images?.[0]?.src || '/placeholder-images.webp'}
                        alt={p.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {p.variants?.[0]?.compareAtPrice && p.variants[0].compareAtPrice > (p.variants[0]?.price || 0) && (
                        <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
                          -{Math.round(((p.variants[0].compareAtPrice - (p.variants[0]?.price || 0)) / p.variants[0].compareAtPrice) * 100)}%
                        </span>
                      )}
                    </div>
                    <h3 className="mt-4 font-semibold text-neutral-900 transition-colors group-hover:text-[#1B198F] dark:text-white">
                      {p.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-bold text-[#1B198F]">₹{p.variants?.[0]?.price?.toLocaleString()}</span>
                      {p.variants?.[0]?.compareAtPrice && (
                        <span className="text-sm text-neutral-400 line-through">₹{p.variants[0].compareAtPrice.toLocaleString()}</span>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Enhanced Sticky Add to Cart Bar */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200 bg-white/95 py-3 shadow-2xl backdrop-blur-lg dark:border-neutral-700 dark:bg-neutral-900/95"
          >
            <div className="container mx-auto flex items-center justify-between gap-4 px-4">
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 overflow-hidden rounded-xl shadow-md">
                  {images[0] && <Image src={images[0].src} alt={product.title} fill className="object-cover" />}
                </div>
                <div className="hidden sm:block">
                  <p className="line-clamp-1 font-semibold text-neutral-900 dark:text-white">{product.title}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-[#1B198F]">₹{price.toLocaleString()}</span>
                    {compareAtPrice && (
                      <span className="text-sm text-neutral-400 line-through">₹{compareAtPrice.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex items-center gap-2 rounded-full border-2 border-[#1B198F] px-6 py-3 text-sm font-bold text-[#1B198F] transition-all hover:bg-[#1B198F]/5"
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span className="hidden sm:inline">Add to Cart</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#1B198F] to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {showLightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setShowLightbox(false)}
          >
            <button 
              onClick={() => setShowLightbox(false)}
              className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1)); }}
              className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0)); }}
              className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            <motion.div
              key={selectedImage}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative h-[80vh] w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              {images[selectedImage] && (
                <Image
                  src={images[selectedImage].src}
                  alt={product.title}
                  fill
                  className="object-contain"
                />
              )}
            </motion.div>
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.stopPropagation(); setSelectedImage(index); }}
                  className={`h-2 w-2 rounded-full transition-all ${selectedImage === index ? 'w-8 bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
