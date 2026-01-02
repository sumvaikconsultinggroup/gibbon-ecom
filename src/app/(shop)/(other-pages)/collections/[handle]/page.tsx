'use client'

import { Divider } from '@/components/Divider'
import { FilterSortByMenuListBox } from '@/components/FilterSortByMenu'
import { FiltersMenuTabs } from '@/components/FiltersMenu'
import ProductCard from '@/components/ProductCard'
import {
  Pagination,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from '@/shared/Pagination/Pagination'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Product {
  _id: string
  title: string
  createdAt: string
  variants?: { price: number }[]
  productCategory?: string
  options?: {
    name: string
    values: string[]
  }[]
  images?: { src: string }[]
}

export default function CollectionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Extract category from URL path
  // e.g., /collections/all -> null, /collections/creatine -> 'creatine'
  const categoryFromUrl = pathname.split('/collections/')[1]
  const isAllProducts = categoryFromUrl === 'all'

  // Filter states
  const [sortBy, setSortBy] = useState('')
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 })
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  // Pagination states
  const currentPage = Number(searchParams.get('page')) || 1
  const itemsPerPage = 12
  const [totalPages, setTotalPages] = useState(1)
  const [paginatedProducts, setPaginatedProducts] = useState<Product[]>([])

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)

        // Default API URL - fetch all products
        let apiUrl = '/api/products?all=true'

        // Only add category filter if it's a specific category (not 'all' or 'all-items')
        if (categoryFromUrl && categoryFromUrl !== 'all' && categoryFromUrl !== 'all-items') {
          const decodedCategory = decodeURIComponent(categoryFromUrl)
          apiUrl = `/api/products?all=true&category=${encodeURIComponent(decodedCategory)}`
        }

        console.log('the url which bring the products', apiUrl)

        const response = await fetch(apiUrl)
        const data = await response.json()

        if (data.success) {
          setProducts(data.data)
          setFilteredProducts(data.data)
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [categoryFromUrl, isAllProducts])

  // Apply filters when any filter changes
  useEffect(() => {
    let filtered = [...products]

    // Filter by price range
    filtered = filtered.filter((product) => {
      const price = product?.variants?.[0]?.price || 0
      return price >= priceRange.min && price <= priceRange.max
    })

    // Filter by selected categories (additional client-side filtering)
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) => {
        const productCategory = product.productCategory?.toLowerCase() || ''
        const categoryParts = productCategory.split('>').map((part) => part.trim().toLowerCase())
        const lastCategory = categoryParts[categoryParts.length - 1]

        return selectedCategories.some(
          (cat) => lastCategory === cat.toLowerCase() || productCategory.includes(cat.toLowerCase())
        )
      })
    }

    // Filter by flavors
    if (selectedFlavors.length > 0) {
      filtered = filtered.filter((product) => {
        const productFlavors =
          product.options?.find((opt) => opt.name.toLowerCase() === 'flavors' || opt.name.toLowerCase() === 'flavor')
            ?.values || []

        return selectedFlavors.some((flavor) => productFlavors.some((pf) => pf.toLowerCase() === flavor.toLowerCase()))
      })
    }

    // Sort products
    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()

          case 'oldest':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()

          case 'price-low-to-high':
            const priceA = a.variants?.[0]?.price || 0
            const priceB = b.variants?.[0]?.price || 0
            return priceA - priceB

          case 'price-high-to-low':
            const priceA2 = a.variants?.[0]?.price || 0
            const priceB2 = b.variants?.[0]?.price || 0
            return priceB2 - priceA2

          case 'a-to-z':
            return (a.title || '').localeCompare(b.title || '')

          case 'z-to-a':
            return (b.title || '').localeCompare(a.title || '')

          default:
            return 0
        }
      })
    }

    setFilteredProducts(filtered)

    // Reset to page 1 when filters change
    if (currentPage > 1) {
      router.push(`${pathname}?page=1`)
    }
  }, [sortBy, priceRange, selectedFlavors, selectedCategories, products])

  // Handle pagination
  useEffect(() => {
    const total = Math.ceil(filteredProducts.length / itemsPerPage)
    setTotalPages(total)

    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginated = filteredProducts.filter((p) => p.images?.[0]?.src).slice(startIndex, endIndex)

    setPaginatedProducts(paginated)
  }, [filteredProducts, currentPage])

  // Get all unique flavors from products
  const getAllFlavors = () => {
    const flavors = new Set<string>()
    products.forEach((product) => {
      const flavorOption = product.options?.find(
        (opt) => opt.name.toLowerCase() === 'flavors' || opt.name.toLowerCase() === 'flavor'
      )
      flavorOption?.values?.forEach((flavor) => flavors.add(flavor))
    })
    return Array.from(flavors)
  }

  // Get all unique categories from products
  const getAllCategories = () => {
    const categories = new Set<string>()
    products.forEach((product) => {
      if (product.productCategory) {
        const categoryParts = product.productCategory.split('>').map((part) => part.trim())
        const lastCategory = categoryParts[categoryParts.length - 1]
        categories.add(lastCategory)
      }
    })
    return Array.from(categories)
  }

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort)
  }

  const handlePriceRangeChange = (min: number, max: number) => {
    setPriceRange({ min, max })
  }

  const handleFlavorsChange = (flavors: string[]) => {
    setSelectedFlavors(flavors)
  }

  const handleCategoriesChange = (categories: string[]) => {
    setSelectedCategories(categories)
  }

  const clearAllFilters = () => {
    setPriceRange({ min: 0, max: 10000 })
    setSelectedFlavors([])
    setSelectedCategories([])
    setSortBy('')
  }

  const hasActiveFilters =
    priceRange.min > 0 || priceRange.max < 10000 || selectedFlavors.length > 0 || selectedCategories.length > 0

  // Generate pagination pages
  const generatePaginationPages = () => {
    const pages = []
    const maxVisiblePages = 5

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return pages
  }

  if (loading) {
    return (
      <main>
        <div className="flex items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary-500"></div>
        </div>
      </main>
    )
  }

  return (
    <main>
      {/* Category Title */}
      {/* {!isAllProducts && categoryFromUrl && (
        <div className="mb-6">
          <h1 className="text-3xl font-bold capitalize">{decodeURIComponent(categoryFromUrl.replace(/-/g, ' '))}</h1>
        </div>
      )} */}

      {/* TABS FILTER */}
      <div className="flex flex-wrap items-center gap-2.5">
        <FiltersMenuTabs
          priceRange={priceRange}
          onPriceRangeChange={handlePriceRangeChange}
          selectedFlavors={selectedFlavors}
          onFlavorsChange={handleFlavorsChange}
          selectedCategories={selectedCategories}
          onCategoriesChange={handleCategoriesChange}
          availableFlavors={getAllFlavors()}
          availableCategories={
            categoryFromUrl && categoryFromUrl !== 'all' && categoryFromUrl !== 'all-items'
              ? []
              : getAllCategories()
          }
        />
        <FilterSortByMenuListBox className="ml-auto" onSortChange={handleSortChange} currentSort={sortBy} />
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap items-center gap-2 font-family-roboto">
          <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Active filters:</span>

          {(priceRange.min > 0 || priceRange.max < 10000) && (
            <span className="inline-flex items-center gap-2 rounded-full border border-[#1b198f]/10 bg-[#1b198f]/5 px-3 py-1.5 text-sm font-medium text-[#1b198f] dark:bg-[#1b198f]/20 dark:text-white">
              ₹{priceRange.min} - ₹{priceRange.max}
              <button
                onClick={() => handlePriceRangeChange(0, 10000)}
                className="hover:text-[#1b198f] dark:hover:text-white"
              >
                ×
              </button>
            </span>
          )}

          {selectedFlavors.map((flavor) => (
            <span
              key={flavor}
              className="inline-flex items-center gap-2 rounded-full border border-[#1b198f]/10 bg-[#1b198f]/5 px-3 py-1.5 text-sm font-medium text-[#1b198f] dark:bg-[#1b198f]/20 dark:text-white"
            >
              {flavor}
              <button
                onClick={() => handleFlavorsChange(selectedFlavors.filter((f) => f !== flavor))}
                className="hover:text-[#1b198f] dark:hover:text-white"
              >
                ×
              </button>
            </span>
          ))}

          {selectedCategories.map((cat) => (
            <span
              key={cat}
              className="inline-flex items-center gap-2 rounded-full border border-[#1b198f]/10 bg-[#1b198f]/5 px-3 py-1.5 text-sm font-medium text-[#1b198f] dark:bg-[#1b198f]/20 dark:text-white"
            >
              {cat}
              <button
                onClick={() => handleCategoriesChange(selectedCategories.filter((c) => c !== cat))}
                className="hover:text-[#1b198f] dark:hover:text-white"
              >
                ×
              </button>
            </span>
          ))}

          <button
            onClick={clearAllFilters}
            className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            Clear all
          </button>
        </div>
      )}

      <Divider className="mt-8" />

      {/* Results Count */}
      <div className="mt-4 font-family-roboto text-sm text-neutral-600 dark:text-neutral-400">
        Showing {paginatedProducts.length} of {filteredProducts.filter((p) => p.images?.[0]?.src).length} products
      </div>

      {/* LOOP ITEMS */}
      {paginatedProducts.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-lg text-neutral-500">No products found</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3 xl:grid-cols-4">
          {paginatedProducts.map((product) => (
            <ProductCard data={product} isLiked={false} key={product._id} />
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="mt-20 flex justify-center lg:mt-24">
          <Pagination className="mx-auto">
            <PaginationPrevious
              href={currentPage > 1 ? `?page=${currentPage - 1}` : '#'}
              aria-disabled={currentPage === 1}
            />
            <PaginationList>
              {generatePaginationPages().map((page) => (
                <PaginationPage key={page} href={`?page=${page}`} current={page === currentPage}>
                  {page}
                </PaginationPage>
              ))}
            </PaginationList>
            <PaginationNext
              href={currentPage < totalPages ? `?page=${currentPage + 1}` : '#'}
              aria-disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      )}
    </main>
  )
}
