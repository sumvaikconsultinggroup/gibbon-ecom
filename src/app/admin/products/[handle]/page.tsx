'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Eye,
  Trash2,
  Plus,
  X,
  Upload,
  GripVertical,
  ChevronDown,
  Info,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react'

interface ProductVariant {
  option1Value?: string
  price: number
  compareAtPrice?: number
  inventoryQty?: number
  sku?: string
}

interface ProductImage {
  src: string
  alt?: string
}

interface ProductFormData {
  title: string
  handle: string
  description: string
  bodyHtml: string
  productCategory: string
  tags: string[]
  published: boolean
  images: ProductImage[]
  variants: ProductVariant[]
  ingredients?: string
  howToUse?: string
  benefits?: string[]
}

const categories = [
  'Protein',
  'Pre-Workout',
  'Mass Gainer',
  'BCAA',
  'Creatine',
  'Fat Burner',
  'Vitamins',
  'Accessories',
]

export default function ProductEditPage() {
  const router = useRouter()
  const params = useParams()
  const isNew = params.handle === 'new'
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    handle: '',
    description: '',
    bodyHtml: '',
    productCategory: '',
    tags: [],
    published: false,
    images: [],
    variants: [{ option1Value: 'Default', price: 0, compareAtPrice: 0, inventoryQty: 0, sku: '' }],
    ingredients: '',
    howToUse: '',
    benefits: [],
  })

  const [tagInput, setTagInput] = useState('')
  const [benefitInput, setBenefitInput] = useState('')

  useEffect(() => {
    if (!isNew) {
      fetchProduct()
    }
  }, [params.handle])

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${params.handle}`)
      const data = await res.json()
      if (data.data) {
        const product = data.data
        setFormData({
          title: product.title || '',
          handle: product.handle || '',
          description: product.description || '',
          bodyHtml: product.bodyHtml || '',
          productCategory: product.productCategory || '',
          tags: product.tags || [],
          published: product.published || false,
          images: product.images || [],
          variants: product.variants?.length > 0 ? product.variants : [{ option1Value: 'Default', price: 0, compareAtPrice: 0, inventoryQty: 0, sku: '' }],
          ingredients: product.ingredients || '',
          howToUse: product.howToUse || '',
          benefits: product.benefits || [],
        })
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = isNew ? '/api/products' : `/api/products/${params.handle}`
      const method = isNew ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setHasChanges(false)
        router.push('/admin/products')
      } else {
        const error = await res.json()
        alert(error.message || 'Error saving product')
      }
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Error saving product')
    }
    setSaving(false)
  }

  const updateField = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)

    // Auto-generate handle from title
    if (field === 'title' && isNew) {
      const handle = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      setFormData(prev => ({ ...prev, handle }))
    }
  }

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const newVariants = [...formData.variants]
    newVariants[index] = { ...newVariants[index], [field]: value }
    updateField('variants', newVariants)
  }

  const addVariant = () => {
    updateField('variants', [
      ...formData.variants,
      { option1Value: '', price: 0, compareAtPrice: 0, inventoryQty: 0, sku: '' }
    ])
  }

  const removeVariant = (index: number) => {
    if (formData.variants.length > 1) {
      updateField('variants', formData.variants.filter((_, i) => i !== index))
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      updateField('tags', [...formData.tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    updateField('tags', formData.tags.filter(t => t !== tag))
  }

  const addBenefit = () => {
    if (benefitInput.trim()) {
      updateField('benefits', [...(formData.benefits || []), benefitInput.trim()])
      setBenefitInput('')
    }
  }

  const removeBenefit = (index: number) => {
    updateField('benefits', formData.benefits?.filter((_, i) => i !== index))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    // For now, use placeholder URLs - in production, upload to Cloudinary
    for (const file of Array.from(files)) {
      const url = URL.createObjectURL(file)
      updateField('images', [...formData.images, { src: url, alt: file.name }])
    }
  }

  const removeImage = (index: number) => {
    updateField('images', formData.images.filter((_, i) => i !== index))
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B198F]" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 text-neutral-500 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {isNew ? 'Add Product' : 'Edit Product'}
            </h1>
            {!isNew && (
              <p className="text-sm text-neutral-500">/{formData.handle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isNew && (
            <Link
              href={`/products/${formData.handle}`}
              target="_blank"
              className="flex items-center gap-2 rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Link>
          )}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-[#1B198F] px-6 py-2 text-sm font-medium text-white transition-all hover:bg-[#1B198F]/90 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Info */}
          <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-800">
            <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Product Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="e.g., Premium Whey Protein - Chocolate"
                  className="w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none transition-all focus:border-[#1B198F] focus:ring-2 focus:ring-[#1B198F]/20 dark:border-neutral-700 dark:bg-neutral-900"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Handle (URL)
                </label>
                <div className="flex items-center rounded-xl border border-neutral-200 dark:border-neutral-700">
                  <span className="px-4 text-neutral-500">/products/</span>
                  <input
                    type="text"
                    value={formData.handle}
                    onChange={(e) => updateField('handle', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="flex-1 rounded-r-xl border-0 px-0 py-3 outline-none dark:bg-neutral-900"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Short Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={3}
                  placeholder="Brief description for product cards and search results..."
                  className="w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none transition-all focus:border-[#1B198F] focus:ring-2 focus:ring-[#1B198F]/20 dark:border-neutral-700 dark:bg-neutral-900"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Full Description (HTML supported)
                </label>
                <textarea
                  value={formData.bodyHtml}
                  onChange={(e) => updateField('bodyHtml', e.target.value)}
                  rows={6}
                  placeholder="Detailed product description..."
                  className="w-full rounded-xl border border-neutral-200 px-4 py-3 font-mono text-sm outline-none transition-all focus:border-[#1B198F] focus:ring-2 focus:ring-[#1B198F]/20 dark:border-neutral-700 dark:bg-neutral-900"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-800">
            <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">Images</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {formData.images.map((image, index) => (
                <div key={index} className="group relative aspect-square overflow-hidden rounded-xl bg-neutral-100">
                  <Image src={image.src} alt={image.alt || ''} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                      Main
                    </span>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 text-neutral-400 transition-colors hover:border-[#1B198F] hover:text-[#1B198F] dark:border-neutral-600"
              >
                <Upload className="h-8 w-8" />
                <span className="mt-2 text-sm font-medium">Add Image</span>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <p className="mt-2 text-sm text-neutral-500">
              Upload product images. First image will be the main image.
            </p>
          </div>

          {/* Variants */}
          <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Variants & Pricing</h2>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-1 text-sm font-medium text-[#1B198F] hover:underline"
              >
                <Plus className="h-4 w-4" /> Add Variant
              </button>
            </div>
            <div className="space-y-4">
              {formData.variants.map((variant, index) => (
                <div key={index} className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-500">Variant {index + 1}</span>
                    {formData.variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-neutral-500">Size/Option</label>
                      <input
                        type="text"
                        value={variant.option1Value || ''}
                        onChange={(e) => updateVariant(index, 'option1Value', e.target.value)}
                        placeholder="e.g., 1kg, 2kg"
                        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-neutral-500">Price (₹) *</label>
                      <input
                        type="number"
                        value={variant.price || ''}
                        onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                        placeholder="1499"
                        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-neutral-500">Compare at Price</label>
                      <input
                        type="number"
                        value={variant.compareAtPrice || ''}
                        onChange={(e) => updateVariant(index, 'compareAtPrice', parseFloat(e.target.value) || 0)}
                        placeholder="1999"
                        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-neutral-500">Inventory</label>
                      <input
                        type="number"
                        value={variant.inventoryQty || ''}
                        onChange={(e) => updateVariant(index, 'inventoryQty', parseInt(e.target.value) || 0)}
                        placeholder="100"
                        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-900"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-800">
            <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">Additional Information</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Ingredients
                </label>
                <textarea
                  value={formData.ingredients || ''}
                  onChange={(e) => updateField('ingredients', e.target.value)}
                  rows={4}
                  placeholder="List of ingredients..."
                  className="w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none transition-all focus:border-[#1B198F] focus:ring-2 focus:ring-[#1B198F]/20 dark:border-neutral-700 dark:bg-neutral-900"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  How to Use
                </label>
                <textarea
                  value={formData.howToUse || ''}
                  onChange={(e) => updateField('howToUse', e.target.value)}
                  rows={3}
                  placeholder="Usage instructions..."
                  className="w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none transition-all focus:border-[#1B198F] focus:ring-2 focus:ring-[#1B198F]/20 dark:border-neutral-700 dark:bg-neutral-900"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Benefits
                </label>
                <div className="mb-2 flex flex-wrap gap-2">
                  {formData.benefits?.map((benefit, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"
                    >
                      {benefit}
                      <button type="button" onClick={() => removeBenefit(index)}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={benefitInput}
                    onChange={(e) => setBenefitInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                    placeholder="Add a benefit..."
                    className="flex-1 rounded-xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-900"
                  />
                  <button
                    type="button"
                    onClick={addBenefit}
                    className="rounded-xl bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-800">
            <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">Status</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-neutral-900 dark:text-white">
                  {formData.published ? 'Published' : 'Draft'}
                </p>
                <p className="text-sm text-neutral-500">
                  {formData.published ? 'Visible on store' : 'Not visible on store'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateField('published', !formData.published)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  formData.published ? 'bg-green-500' : 'bg-neutral-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    formData.published ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Category */}
          <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-800">
            <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">Category</h2>
            <select
              value={formData.productCategory}
              onChange={(e) => updateField('productCategory', e.target.value)}
              className="w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-900"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-800">
            <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">Tags</h2>
            <div className="mb-3 flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-[#1B198F]/10 px-3 py-1 text-sm text-[#1B198F]"
                >
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tag..."
                className="flex-1 rounded-xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-900"
              />
              <button
                type="button"
                onClick={addTag}
                className="rounded-xl bg-[#1B198F] px-4 py-2 text-sm font-medium text-white"
              >
                Add
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {['bestseller', 'new arrival', 'sale', 'trending'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => !formData.tags.includes(tag) && updateField('tags', [...formData.tags, tag])}
                  className="rounded-full border border-neutral-200 px-2 py-0.5 text-xs text-neutral-500 hover:border-[#1B198F] hover:text-[#1B198F] dark:border-neutral-700"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
