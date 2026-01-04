'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import {
  SlidersHorizontal,
  Grid3X3,
  LayoutGrid,
  ChevronDown,
  X,
  Star,
  ShoppingBag,
  Heart,
  Eye,
  Check,
  ArrowUpDown,
} from 'lucide-react'
import { useCart } from '@/components/useCartStore'

interface Product {
  _id: string
  handle: string
  title: string
  images?: { src: string; alt?: string }[]
  variants?: { price: number; compareAtPrice?: number; option1Value?: string }[]
  reviews?: { star: number }[]
  productCategory?: string
  tags?: string[]
}

interface CollectionPageClientProps {
  initialProducts: Product[]
  collection: string
  totalCount: number
}

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'bestselling', label: 'Bestselling' },
]

const priceRanges = [
  { min: 0, max: 999, label: 'Under ₹999' },
  { min: 1000, max: 1999, label: '₹1,000 - ₹1,999' },
  { min: 2000, max: 2999, label: '₹2,000 - ₹2,999' },
  { min: 3000, max: 4999, label: '₹3,000 - ₹4,999' },
  { min: 5000, max: 100000, label: '₹5,000+' },
]

const categories = [
  'Whey Protein',
  'Pre-Workout',
  'Mass Gainer',
  'BCAA',
  'Creatine',
  'Vitamins',
  'Fish Oil',
]

export default function CollectionPageClient({
  initialProducts,
  collection,
  totalCount,
}: CollectionPageClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [products, setProducts] = useState(initialProducts)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [gridCols, setGridCols] = useState(4)
  const [isLoading, setIsLoading] = useState(false)
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)

  const [filters, setFilters] = useState({
    priceRange: searchParams.get('price') || '',
    category: searchParams.get('category') || '',
    sort: searchParams.get('sort') || 'newest',
  })

  const { addItem } = useCart()

  const updateURL = useCallback(
    (newFilters: typeof filters) => {
      const params = new URLSearchParams()
      if (newFilters.priceRange) params.set('price', newFilters.priceRange)
      if (newFilters.category) params.set('category', newFilters.category)
      if (newFilters.sort) params.set('sort', newFilters.sort)
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router]
  )

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    updateURL(newFilters)
  }

  const clearFilters = () => {
    const newFilters = { priceRange: '', category: '', sort: 'newest' }
    setFilters(newFilters)
    router.push(pathname)
  }

  const activeFiltersCount = [filters.priceRange, filters.category].filter(Boolean).length

  const handleQuickAdd = (product: Product) => {
    const variant = product.variants?.[0]
    if (!variant) return
    addItem({
      productId: product._id,
      name: product.title,
      price: variant.price,
      imageUrl: product.images?.[0]?.src || '',
      handle: product.handle,
      variants: variant.option1Value ? [{ name: 'Size', option: variant.option1Value }] : [],
    })
  }

  const getAverageRating = (reviews?: { star: number }[]) => {
    if (!reviews || reviews.length === 0) return 0
    return reviews.reduce((acc, r) => acc + r.star, 0) / reviews.length
  }

  const getDiscount = (price: number, compareAt?: number) => {
    if (!compareAt || compareAt <= price) return 0
    return Math.round(((compareAt - price) / compareAt) * 100)
  }

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (collection !== 'all') params.set('collection', collection)
        if (filters.category) params.set('category', filters.category)
        if (filters.sort) params.set('sort', filters.sort)
        if (filters.priceRange) {
          const range = priceRanges.find((r) => `${r.min}-${r.max}` === filters.priceRange)
          if (range) {
            params.set('minPrice', String(range.min))
            params.set('maxPrice', String(range.max))
          }
        }

        const res = await fetch(`/api/products?${params.toString()}`)
        if (!res.ok) {
          console.error('Failed to fetch products:', res.status)
          return
        }
        const text = await res.text()
        try {
          const data = JSON.parse(text)
          setProducts(data.products || data.data || [])
        } catch (e) {
          console.error('Failed to parse products response:', e)
        }
      } catch (err) {
        console.error('Error fetching products:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [filters, collection])

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Collection Header */}
      <div className="bg-gradient-to-r from-[#1B198F] to-[#1B198F]/80 py-12 text-white">
        <div className="container mx-auto px-4">
          <nav className="mb-4 text-sm text-white/70">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span className="capitalize">{collection.replace(/-/g, ' ')}</span>
          </nav>
          <h1 className="font-[family-name:var(--font-family-antonio)] text-4xl font-black uppercase sm:text-5xl">
            {collection === 'all' ? 'All Products' : collection.replace(/-/g, ' ')}
          </h1>
          <p className="mt-2 text-white/70">{totalCount} products</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Toolbar */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-900">
          {/* Filter Button */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2.5 text-sm font-semibold transition-colors hover:border-[#1B198F] hover:bg-[#1B198F]/5 dark:border-neutral-700"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1B198F] text-xs text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {filters.priceRange && (
                <span className="flex items-center gap-1 rounded-full bg-[#1B198F]/10 px-3 py-1.5 text-xs font-semibold text-[#1B198F]">
                  {priceRanges.find((r) => `${r.min}-${r.max}` === filters.priceRange)?.label}
                  <button onClick={() => handleFilterChange('priceRange', '')}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.category && (
                <span className="flex items-center gap-1 rounded-full bg-[#1B198F]/10 px-3 py-1.5 text-xs font-semibold text-[#1B198F]">
                  {filters.category}
                  <button onClick={() => handleFilterChange('category', '')}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              <button onClick={clearFilters} className="text-xs font-semibold text-neutral-500 hover:text-[#1B198F]">
                Clear All
              </button>
            </div>
          )}

          <div className="flex items-center gap-4">
            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2.5 text-sm font-semibold dark:border-neutral-700"
              >
                <ArrowUpDown className="h-4 w-4" />
                {sortOptions.find((o) => o.value === filters.sort)?.label}
                <ChevronDown className="h-4 w-4" />
              </button>
              <AnimatePresence>
                {isSortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full z-20 mt-2 w-48 rounded-xl border border-neutral-200 bg-white py-2 shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
                  >
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          handleFilterChange('sort', option.value)
                          setIsSortOpen(false)
                        }}
                        className={`flex w-full items-center justify-between px-4 py-2 text-sm ${
                          filters.sort === option.value
                            ? 'bg-[#1B198F]/10 text-[#1B198F]'
                            : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                        }`}
                      >
                        {option.label}
                        {filters.sort === option.value && <Check className="h-4 w-4" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Grid Toggle */}
            <div className="hidden items-center gap-1 rounded-full border border-neutral-200 p-1 sm:flex dark:border-neutral-700">
              {[3, 4].map((cols) => (
                <button
                  key={cols}
                  onClick={() => setGridCols(cols)}
                  className={`rounded-full p-2 ${
                    gridCols === cols ? 'bg-[#1B198F] text-white' : 'text-neutral-500 hover:bg-neutral-100'
                  }`}
                >
                  {cols === 3 ? <Grid3X3 className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
                <div className="mt-4 h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="mt-2 h-4 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg text-neutral-500">No products found</p>
            <button onClick={clearFilters} className="mt-4 text-[#1B198F] hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <div
            className={`grid gap-4 sm:gap-6 ${
              gridCols === 3 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
            }`}
          >
            {products.map((product, index) => {
              const variant = product.variants?.[0]
              const price = variant?.price || 0
              const compareAtPrice = variant?.compareAtPrice
              const discount = getDiscount(price, compareAtPrice)
              const rating = getAverageRating(product.reviews)
              const isHovered = hoveredProduct === product._id

              return (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group"
                  onMouseEnter={() => setHoveredProduct(product._id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-lg dark:bg-neutral-900">
                    <Link href={`/products/${product.handle}`}>
                      <Image
                        src={product.images?.[0]?.src || '/placeholder-images.webp'}
                        alt={product.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {product.images?.[1] && (
                        <Image
                          src={product.images[1].src}
                          alt={product.title}
                          fill
                          className="absolute inset-0 object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                        />
                      )}
                    </Link>

                    {/* Badges */}
                    <div className="absolute left-3 top-3 flex flex-col gap-2">
                      {discount > 0 && (
                        <span className="rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
                          -{discount}%
                        </span>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isHovered ? 1 : 0 }}
                      className="absolute right-3 top-3 flex flex-col gap-2"
                    >
                      <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-700 shadow-lg transition-colors hover:bg-[#1B198F] hover:text-white">
                        <Heart className="h-4 w-4" />
                      </button>
                      <Link
                        href={`/products/${product.handle}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-700 shadow-lg transition-colors hover:bg-[#1B198F] hover:text-white"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </motion.div>

                    {/* Quick Add */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
                      className="absolute bottom-3 left-3 right-3"
                    >
                      <button
                        onClick={() => handleQuickAdd(product)}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1B198F] py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#1B198F]/90"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        Quick Add
                      </button>
                    </motion.div>
                  </div>

                  {/* Product Info */}
                  <div className="mt-4">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      {product.productCategory || 'Supplements'}
                    </p>
                    <Link href={`/products/${product.handle}`}>
                      <h3 className="line-clamp-2 font-semibold text-neutral-900 transition-colors hover:text-[#1B198F] dark:text-white">
                        {product.title}
                      </h3>
                    </Link>
                    {rating > 0 && (
                      <div className="mt-1 flex items-center gap-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-neutral-200 text-neutral-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-neutral-500">({product.reviews?.length || 0})</span>
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-lg font-bold text-neutral-900 dark:text-white">₹{price}</span>
                      {compareAtPrice && compareAtPrice > price && (
                        <span className="text-sm text-neutral-500 line-through">₹{compareAtPrice}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Filter Drawer - Mobile Optimized */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => setIsFilterOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 z-50 h-full w-[85vw] max-w-sm overflow-y-auto bg-white p-4 sm:p-6 pb-24 dark:bg-neutral-900"
              style={{ maxHeight: '100dvh' }}
            >
              <div className="safe-area-top mb-6 flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold">Filters</h2>
                <button 
                  onClick={() => setIsFilterOpen(false)} 
                  className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-neutral-100 active:scale-95 dark:hover:bg-neutral-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-neutral-500">Price Range</h3>
                <div className="space-y-2">
                  {priceRanges.map((range) => (
                    <button
                      key={range.label}
                      onClick={() => handleFilterChange('priceRange', `${range.min}-${range.max}`)}
                      className={`flex min-h-[44px] w-full items-center justify-between rounded-xl px-4 py-3 text-sm active:scale-[0.98] ${
                        filters.priceRange === `${range.min}-${range.max}`
                          ? 'bg-[#1B198F] text-white'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
                      }`}
                    >
                      {range.label}
                      {filters.priceRange === `${range.min}-${range.max}` && <Check className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-neutral-500">Category</h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleFilterChange('category', cat)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm ${
                        filters.category === cat
                          ? 'bg-[#1B198F] text-white'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
                      }`}
                    >
                      {cat}
                      {filters.category === cat && <Check className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Apply Button */}
              <div className="mt-auto flex gap-3">
                <button
                  onClick={clearFilters}
                  className="flex-1 rounded-full border border-neutral-200 py-3 font-semibold dark:border-neutral-700"
                >
                  Clear
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-1 rounded-full bg-[#1B198F] py-3 font-semibold text-white"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
