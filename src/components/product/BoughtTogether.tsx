'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ShoppingBag, Plus, Check, ShoppingCart } from 'lucide-react'
import { useCart } from '@/components/useCartStore'
import toast from 'react-hot-toast'

interface RecommendedProduct {
  handle: string
  title: string
  image: string
  price: number
}

interface BoughtTogetherProps {
  productHandle: string
  currentProduct: {
    handle: string
    title: string
    image: string
    price: number
  }
}

export default function BoughtTogether({ productHandle, currentProduct }: BoughtTogetherProps) {
  const [products, setProducts] = useState<RecommendedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const { addItem } = useCart()

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await fetch(`/api/recommendations/${productHandle}?type=bought_together`)
        const data = await res.json()
        if (data.success && data.data.boughtTogether?.length) {
          setProducts(data.data.boughtTogether)
          // Auto-select first 2 products
          const initial = new Set<string>()
          initial.add(currentProduct.handle)
          data.data.boughtTogether.slice(0, 2).forEach((p: RecommendedProduct) => initial.add(p.handle))
          setSelectedProducts(initial)
        }
      } catch (error) {
        console.error('Error fetching bought together:', error)
      } finally {
        setLoading(false)
      }
    }

    if (productHandle) {
      fetchRecommendations()
    }
  }, [productHandle, currentProduct.handle])

  const toggleProduct = (handle: string) => {
    if (handle === currentProduct.handle) return // Can't deselect current product
    
    const newSelected = new Set(selectedProducts)
    if (newSelected.has(handle)) {
      newSelected.delete(handle)
    } else {
      newSelected.add(handle)
    }
    setSelectedProducts(newSelected)
  }

  const getTotalPrice = () => {
    let total = selectedProducts.has(currentProduct.handle) ? currentProduct.price : 0
    products.forEach(p => {
      if (selectedProducts.has(p.handle)) total += p.price
    })
    return total
  }

  const addAllToCart = () => {
    // Add current product
    if (selectedProducts.has(currentProduct.handle)) {
      addItem({
        id: currentProduct.handle,
        name: currentProduct.title,
        price: currentProduct.price,
        image: currentProduct.image,
        quantity: 1
      })
    }
    
    // Add selected recommended products
    products.forEach(p => {
      if (selectedProducts.has(p.handle)) {
        addItem({
          id: p.handle,
          name: p.title,
          price: p.price,
          image: p.image,
          quantity: 1
        })
      }
    })
    
    toast.success(`Added ${selectedProducts.size} items to cart!`)
  }

  if (loading || products.length === 0) return null

  const allProducts = [currentProduct, ...products]

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
      <div className="mb-6 flex items-center gap-3">
        <ShoppingBag className="h-6 w-6 text-blue-500" />
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Frequently Bought Together</h2>
      </div>
      
      <div className="flex flex-wrap items-center justify-center gap-4">
        {allProducts.map((product, index) => (
          <div key={product.handle} className="flex items-center gap-4">
            <motion.button
              onClick={() => toggleProduct(product.handle)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative rounded-xl border-2 p-3 transition-all ${
                selectedProducts.has(product.handle)
                  ? 'border-[#1B198F] bg-[#1B198F]/5'
                  : 'border-neutral-200 hover:border-neutral-300'
              } ${product.handle === currentProduct.handle ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <div className="relative h-24 w-24 overflow-hidden rounded-lg">
                {product.image ? (
                  <Image src={product.image} alt={product.title} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-neutral-100">
                    <ShoppingCart className="h-8 w-8 text-neutral-300" />
                  </div>
                )}
              </div>
              <div className="mt-2 max-w-[100px]">
                <p className="text-xs font-medium line-clamp-2">{product.title}</p>
                <p className="mt-1 text-sm font-bold text-[#1B198F]">₹{product.price?.toLocaleString()}</p>
              </div>
              
              {/* Selection indicator */}
              <div className={`absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full transition-all ${
                selectedProducts.has(product.handle)
                  ? 'bg-[#1B198F] text-white'
                  : 'bg-neutral-200 text-neutral-400'
              }`}>
                <Check className="h-4 w-4" />
              </div>
              
              {product.handle === currentProduct.handle && (
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] font-medium text-white">
                  This item
                </span>
              )}
            </motion.button>
            
            {index < allProducts.length - 1 && (
              <Plus className="h-6 w-6 text-neutral-300" />
            )}
          </div>
        ))}
      </div>
      
      {/* Total and Add to Cart */}
      <div className="mt-6 flex flex-col items-center gap-4 border-t border-neutral-200 pt-6 sm:flex-row sm:justify-between dark:border-neutral-700">
        <div>
          <p className="text-sm text-neutral-500">
            Total price for {selectedProducts.size} items:
          </p>
          <p className="text-2xl font-black text-[#1B198F]">
            ₹{getTotalPrice().toLocaleString()}
          </p>
        </div>
        <button
          onClick={addAllToCart}
          disabled={selectedProducts.size === 0}
          className="flex items-center gap-2 rounded-xl bg-[#1B198F] px-6 py-3 font-semibold text-white transition-all hover:bg-[#1B198F]/90 disabled:opacity-50"
        >
          <ShoppingCart className="h-5 w-5" />
          Add {selectedProducts.size} Items to Cart
        </button>
      </div>
    </section>
  )
}
