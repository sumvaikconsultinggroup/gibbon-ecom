'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Package,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit2,
  Save,
  X,
  ArrowUpDown,
  Download,
  Upload,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Box,
  Layers,
} from 'lucide-react'

interface ProductInventory {
  handle: string
  title: string
  image: string
  variants: {
    option1Value: string
    sku: string
    inventoryQty: number
    inventoryPolicy: 'deny' | 'continue'
    price: number
    costPerItem?: number
  }[]
  totalStock: number
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
}

export default function InventoryPage() {
  const [products, setProducts] = useState<ProductInventory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'title' | 'stock' | 'status'>('title')
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      
      const inventoryData: ProductInventory[] = (data.data || []).map((product: any) => {
        const totalStock = product.variants?.reduce((acc: number, v: any) => acc + (v.inventoryQty || 0), 0) || 0
        let status: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock'
        if (totalStock === 0) status = 'out_of_stock'
        else if (totalStock < 10) status = 'low_stock'
        
        return {
          handle: product.handle,
          title: product.title,
          image: product.images?.[0]?.src || '/placeholder-images.webp',
          variants: product.variants?.map((v: any) => ({
            option1Value: v.option1Value || 'Default',
            sku: v.sku || '-',
            inventoryQty: v.inventoryQty || 0,
            inventoryPolicy: v.inventoryPolicy || 'deny',
            price: v.price || 0,
            costPerItem: v.costPerItem,
          })) || [{ option1Value: 'Default', sku: '-', inventoryQty: 0, inventoryPolicy: 'deny', price: 0 }],
          totalStock,
          status,
        }
      })
      
      setProducts(inventoryData)
    } catch (error) {
      console.error('Error fetching inventory:', error)
    }
    setLoading(false)
  }

  const handleSaveInventory = async (handle: string) => {
    setSaving(true)
    try {
      // Find product and update variants
      const product = products.find(p => p.handle === handle)
      if (!product) return

      const updatedVariants = product.variants.map((v, i) => ({
        ...v,
        inventoryQty: editValues[`${handle}-${i}`] ?? v.inventoryQty,
      }))

      await fetch(`/api/products/${handle}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variants: updatedVariants }),
      })

      // Update local state
      setProducts(products.map(p => {
        if (p.handle === handle) {
          const totalStock = updatedVariants.reduce((acc, v) => acc + v.inventoryQty, 0)
          let status: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock'
          if (totalStock === 0) status = 'out_of_stock'
          else if (totalStock < 10) status = 'low_stock'
          return { ...p, variants: updatedVariants, totalStock, status }
        }
        return p
      }))

      setEditingProduct(null)
      setEditValues({})
    } catch (error) {
      console.error('Error saving inventory:', error)
    }
    setSaving(false)
  }

  const startEditing = (product: ProductInventory) => {
    setEditingProduct(product.handle)
    const values: Record<string, number> = {}
    product.variants.forEach((v, i) => {
      values[`${product.handle}-${i}`] = v.inventoryQty
    })
    setEditValues(values)
  }

  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.variants.some(v => v.sku.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesFilter = filterStatus === 'all' || p.status === filterStatus
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      if (sortBy === 'stock') return b.totalStock - a.totalStock
      if (sortBy === 'status') {
        const order = { out_of_stock: 0, low_stock: 1, in_stock: 2 }
        return order[a.status] - order[b.status]
      }
      return 0
    })

  const stats = {
    total: products.length,
    inStock: products.filter(p => p.status === 'in_stock').length,
    lowStock: products.filter(p => p.status === 'low_stock').length,
    outOfStock: products.filter(p => p.status === 'out_of_stock').length,
    totalUnits: products.reduce((acc, p) => acc + p.totalStock, 0),
  }

  const statusConfig = {
    in_stock: { label: 'In Stock', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    low_stock: { label: 'Low Stock', color: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
    out_of_stock: { label: 'Out of Stock', color: 'bg-red-100 text-red-700', icon: XCircle },
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Inventory</h1>
          <p className="text-neutral-500">Track and manage your product stock levels</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchInventory}
            className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-[#1B198F] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#1B198F]/90">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B198F]/10">
              <Package className="h-5 w-5 text-[#1B198F]" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Total Products</p>
              <p className="text-xl font-bold text-neutral-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">In Stock</p>
              <p className="text-xl font-bold text-green-600">{stats.inStock}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Low Stock</p>
              <p className="text-xl font-bold text-amber-600">{stats.lowStock}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Out of Stock</p>
              <p className="text-xl font-bold text-red-600">{stats.outOfStock}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
              <Layers className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Total Units</p>
              <p className="text-xl font-bold text-purple-600">{stats.totalUnits.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search products or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-12 pr-4 outline-none transition-all focus:border-[#1B198F] focus:ring-2 focus:ring-[#1B198F]/20 dark:border-neutral-700 dark:bg-neutral-800"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-800"
          >
            <option value="all">All Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-800"
          >
            <option value="title">Sort by Name</option>
            <option value="stock">Sort by Stock</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
      </div>

      {/* Low Stock Alert */}
      {stats.lowStock > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20"
        >
          <AlertTriangle className="h-6 w-6 text-amber-600" />
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-200">
              {stats.lowStock} product{stats.lowStock > 1 ? 's' : ''} running low on stock
            </p>
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Consider restocking these items to avoid stockouts
            </p>
          </div>
        </motion.div>
      )}

      {/* Inventory Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Product</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Variant</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">SKU</th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-neutral-500">Stock</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
                    </td>
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, pi) => (
                  product.variants.map((variant, vi) => {
                    const StatusIcon = statusConfig[product.status].icon
                    const isEditing = editingProduct === product.handle
                    const editKey = `${product.handle}-${vi}`
                    
                    return (
                      <motion.tr
                        key={`${product.handle}-${vi}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: (pi * product.variants.length + vi) * 0.02 }}
                        className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
                      >
                        {vi === 0 && (
                          <td className="px-6 py-4" rowSpan={product.variants.length}>
                            <div className="flex items-center gap-3">
                              <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-neutral-100">
                                <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
                              </div>
                              <div>
                                <p className="font-medium text-neutral-900 dark:text-white">{product.title}</p>
                                <p className="text-sm text-neutral-500">{product.variants.length} variant{product.variants.length > 1 ? 's' : ''}</p>
                              </div>
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4 text-neutral-700 dark:text-neutral-300">
                          {variant.option1Value}
                        </td>
                        <td className="px-6 py-4 font-mono text-sm text-neutral-500">
                          {variant.sku}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editValues[editKey] ?? variant.inventoryQty}
                              onChange={(e) => setEditValues({ ...editValues, [editKey]: Number(e.target.value) })}
                              min="0"
                              className="w-20 rounded-lg border border-[#1B198F] px-3 py-1 text-center outline-none focus:ring-2 focus:ring-[#1B198F]/20 dark:bg-neutral-900"
                            />
                          ) : (
                            <span className={`font-semibold ${
                              variant.inventoryQty === 0 ? 'text-red-600' :
                              variant.inventoryQty < 10 ? 'text-amber-600' : 'text-neutral-900 dark:text-white'
                            }`}>
                              {variant.inventoryQty}
                            </span>
                          )}
                        </td>
                        {vi === 0 && (
                          <td className="px-6 py-4" rowSpan={product.variants.length}>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig[product.status].color}`}>
                              <StatusIcon className="h-3.5 w-3.5" />
                              {statusConfig[product.status].label}
                            </span>
                          </td>
                        )}
                        {vi === 0 && (
                          <td className="px-6 py-4" rowSpan={product.variants.length}>
                            <div className="flex items-center justify-end gap-2">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={() => { setEditingProduct(null); setEditValues({}) }}
                                    className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                                  >
                                    <X className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() => handleSaveInventory(product.handle)}
                                    disabled={saving}
                                    className="rounded-lg bg-[#1B198F] p-2 text-white transition-colors hover:bg-[#1B198F]/90 disabled:opacity-50"
                                  >
                                    {saving ? (
                                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    ) : (
                                      <Save className="h-5 w-5" />
                                    )}
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => startEditing(product)}
                                  className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-[#1B198F]"
                                >
                                  <Edit2 className="h-5 w-5" />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </motion.tr>
                    )
                  })
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
