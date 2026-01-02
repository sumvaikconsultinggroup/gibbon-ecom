'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Phone,
  Truck,
  Shield,
  Award,
  Percent,
  Clock,
  MapPin,
} from 'lucide-react'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { useCart } from '@/components/useCartStore'
import { useAside } from '@/components/aside/aside'

const categories = [
  {
    name: 'Protein',
    href: '/collections/protein',
    featured: true,
    subcategories: [
      { name: 'Whey Protein', href: '/collections/whey-protein', badge: 'Bestseller' },
      { name: 'Whey Isolate', href: '/collections/whey-isolate', badge: 'Premium' },
      { name: 'Plant Protein', href: '/collections/plant-protein', badge: 'Vegan' },
      { name: 'Casein Protein', href: '/collections/casein' },
      { name: 'Protein Blends', href: '/collections/protein-blends' },
    ],
    image: '/GibbonBanner-1.png',
    description: 'Premium protein for maximum muscle growth',
  },
  {
    name: 'Pre-Workout',
    href: '/collections/pre-workout',
    subcategories: [
      { name: 'JOLT Pre-Workout', href: '/products/jolt', badge: 'New' },
      { name: 'Caffeine Free', href: '/collections/caffeine-free' },
      { name: 'Pump Formulas', href: '/collections/pump' },
    ],
    image: '/GibbonBanner-2.png',
    description: 'Explosive energy for intense workouts',
  },
  {
    name: 'Mass Gainer',
    href: '/collections/mass-gainer',
    subcategories: [
      { name: 'High Calorie', href: '/collections/high-calorie' },
      { name: 'Lean Mass', href: '/collections/lean-mass' },
    ],
    image: '/GibbonBanner-3.png',
    description: 'Calorie-dense formulas for serious gains',
  },
  {
    name: 'Amino Acids',
    href: '/collections/amino-acids',
    subcategories: [
      { name: 'BCAAs', href: '/collections/bcaa' },
      { name: 'EAAs', href: '/collections/eaa' },
      { name: 'Glutamine', href: '/collections/glutamine' },
    ],
  },
  {
    name: 'Creatine',
    href: '/collections/creatine',
    subcategories: [
      { name: 'Creatine Monohydrate', href: '/collections/creatine-mono' },
      { name: 'Creatine HCL', href: '/collections/creatine-hcl' },
    ],
  },
  {
    name: 'Vitamins & Health',
    href: '/collections/vitamins',
    subcategories: [
      { name: 'Multivitamins', href: '/collections/multivitamins' },
      { name: 'Omega 3', href: '/collections/omega' },
      { name: 'Vitamin D', href: '/collections/vitamin-d' },
      { name: 'ZMA', href: '/collections/zma' },
    ],
  },
]

const quickLinks = [
  { name: 'Bestsellers', href: '/collections/bestsellers', icon: Award },
  { name: 'New Arrivals', href: '/collections/new', icon: Clock },
  { name: 'Offers', href: '/collections/offers', icon: Percent },
]

export default function MegaHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const searchRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const { items } = useCart()
  const { open: openCart } = useAside()

  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setActiveCategory(null)
  }, [pathname])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search functionality
  useEffect(() => {
    if (searchQuery.length > 2) {
      const timer = setTimeout(async () => {
        try {
          const res = await fetch(`/api/products?search=${searchQuery}&limit=5`)
          const data = await res.json()
          setSearchResults(data.products || [])
        } catch (err) {
          console.error('Search error:', err)
        }
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  return (
    <>
      {/* Top Bar */}
      <div className="bg-neutral-900 text-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-2 text-xs">
          <div className="hidden items-center gap-6 sm:flex">
            <a href="tel:+917717495954" className="flex items-center gap-1.5 hover:text-[#12C6FF]">
              <Phone className="h-3 w-3" /> +91 77174 95954
            </a>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3" /> Pan India Delivery
            </span>
          </div>
          <div className="flex w-full items-center justify-center gap-4 sm:w-auto sm:justify-end">
            <span className="flex items-center gap-1.5">
              <Truck className="h-3 w-3 text-green-400" /> Free Shipping ₹999+
            </span>
            <span className="hidden items-center gap-1.5 sm:flex">
              <Shield className="h-3 w-3 text-blue-400" /> 100% Authentic
            </span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 shadow-lg backdrop-blur-md dark:bg-neutral-900/95'
            : 'bg-white dark:bg-neutral-900'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-4 lg:h-20">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-100 lg:hidden dark:hover:bg-neutral-800"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/GibbonLogoEccom.png"
                alt="Gibbon Nutrition"
                width={140}
                height={42}
                className="h-10 w-auto lg:h-12"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden flex-1 items-center justify-center lg:flex">
              <ul className="flex items-center gap-1">
                {categories.map((category) => (
                  <li
                    key={category.name}
                    onMouseEnter={() => setActiveCategory(category.name)}
                    onMouseLeave={() => setActiveCategory(null)}
                    className="relative"
                  >
                    <Link
                      href={category.href}
                      className={`flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                        activeCategory === category.name
                          ? 'bg-[#1B198F] text-white'
                          : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {category.name}
                      <ChevronDown className={`h-4 w-4 transition-transform ${activeCategory === category.name ? 'rotate-180' : ''}`} />
                    </Link>
                  </li>
                ))}
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
                    >
                      <link.icon className="h-4 w-4 text-[#1B198F]" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <div ref={searchRef} className="relative">
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                </button>

                <AnimatePresence>
                  {isSearchOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xl sm:w-96 dark:border-neutral-700 dark:bg-neutral-900"
                    >
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search products..."
                          className="w-full rounded-full border border-neutral-200 bg-neutral-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-[#1B198F] focus:ring-2 focus:ring-[#1B198F]/20 dark:border-neutral-700 dark:bg-neutral-800"
                          autoFocus
                        />
                      </div>

                      {searchResults.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {searchResults.map((product: any) => (
                            <Link
                              key={product._id}
                              href={`/products/${product.handle}`}
                              onClick={() => setIsSearchOpen(false)}
                              className="flex items-center gap-3 rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            >
                              <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-neutral-100">
                                {product.images?.[0]?.src && (
                                  <Image src={product.images[0].src} alt={product.title} fill className="object-cover" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-neutral-900 dark:text-white">{product.title}</p>
                                <p className="text-sm font-bold text-[#1B198F]">₹{product.variants?.[0]?.price}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}

                      {searchQuery.length > 2 && searchResults.length === 0 && (
                        <p className="mt-4 text-center text-sm text-neutral-500">No products found</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="hidden h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-100 sm:flex dark:hover:bg-neutral-800"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
                aria-label="Cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#1B198F] text-[10px] font-bold text-white">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {/* Account */}
              <SignedIn>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'h-10 w-10',
                    },
                  }}
                />
              </SignedIn>
              <SignedOut>
                <Link
                  href="/sign-in"
                  className="hidden items-center gap-2 rounded-full bg-[#1B198F] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#1B198F]/90 sm:flex"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-in"
                  className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-100 sm:hidden dark:hover:bg-neutral-800"
                  aria-label="Sign In"
                >
                  <User className="h-5 w-5" />
                </Link>
              </SignedOut>
            </div>
          </div>
        </div>

        {/* Mega Menu Dropdown */}
        <AnimatePresence>
          {activeCategory && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 right-0 top-full hidden border-t border-neutral-200 bg-white shadow-2xl lg:block dark:border-neutral-700 dark:bg-neutral-900"
              onMouseEnter={() => setActiveCategory(activeCategory)}
              onMouseLeave={() => setActiveCategory(null)}
            >
              <div className="container mx-auto px-4 py-8">
                {categories
                  .filter((c) => c.name === activeCategory)
                  .map((category) => (
                    <div key={category.name} className="grid grid-cols-4 gap-8">
                      {/* Subcategories */}
                      <div className="col-span-2">
                        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-neutral-500">
                          Shop {category.name}
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {category.subcategories.map((sub) => (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              className="group flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            >
                              <span className="font-medium text-neutral-700 group-hover:text-[#1B198F] dark:text-neutral-200">
                                {sub.name}
                              </span>
                              {sub.badge && (
                                <span className="rounded-full bg-[#1B198F]/10 px-2 py-0.5 text-xs font-semibold text-[#1B198F]">
                                  {sub.badge}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                        <Link
                          href={category.href}
                          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#1B198F] hover:underline"
                        >
                          View All {category.name}
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>

                      {/* Featured Image */}
                      {category.image && (
                        <div className="col-span-2">
                          <Link href={category.href} className="group relative block overflow-hidden rounded-2xl">
                            <div className="relative aspect-[2/1]">
                              <Image
                                src={category.image}
                                alt={category.name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                              <div className="absolute bottom-6 left-6">
                                <h4 className="mb-1 text-2xl font-bold text-white">{category.name}</h4>
                                <p className="text-sm text-white/80">{category.description}</p>
                              </div>
                            </div>
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 z-50 h-full w-80 overflow-y-auto bg-white dark:bg-neutral-900"
            >
              <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-700">
                <Image src="/GibbonLogoEccom.png" alt="Gibbon" width={120} height={36} className="h-8 w-auto" />
                <button onClick={() => setIsMobileMenuOpen(false)} className="rounded-full p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-4">
                {categories.map((category) => (
                  <div key={category.name} className="border-b border-neutral-100 py-3 dark:border-neutral-800">
                    <Link
                      href={category.href}
                      className="flex items-center justify-between py-2 font-semibold text-neutral-900 dark:text-white"
                    >
                      {category.name}
                      <ChevronRight className="h-5 w-5 text-neutral-400" />
                    </Link>
                    <div className="mt-2 space-y-1 pl-4">
                      {category.subcategories.slice(0, 3).map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className="block py-1.5 text-sm text-neutral-600 dark:text-neutral-400"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="mt-6 space-y-3">
                  {quickLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="flex items-center gap-3 rounded-lg bg-neutral-100 p-3 font-semibold dark:bg-neutral-800"
                    >
                      <link.icon className="h-5 w-5 text-[#1B198F]" />
                      {link.name}
                    </Link>
                  ))}
                </div>

                <div className="mt-6 space-y-3">
                  <Link href="/wishlist" className="flex items-center gap-3 py-2 text-neutral-700 dark:text-neutral-300">
                    <Heart className="h-5 w-5" /> Wishlist
                  </Link>
                  <Link href="/account" className="flex items-center gap-3 py-2 text-neutral-700 dark:text-neutral-300">
                    <User className="h-5 w-5" /> My Account
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
