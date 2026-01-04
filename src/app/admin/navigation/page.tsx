'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { 
  Plus, Edit2, Trash2, ChevronRight, ChevronDown, GripVertical, 
  Image as ImageIcon, Link, Eye, EyeOff, Save, X, Menu, 
  ExternalLink, Smartphone, Monitor, ArrowUpDown, Search,
  Layers, FolderTree, LayoutGrid, Settings2, MoreVertical,
  Copy, MoveUp, MoveDown, Shield, Tag, FileText
} from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface NavigationItem {
  _id: string
  name: string
  href: string
  slug: string
  order: number
  isActive: boolean
  type: 'category' | 'subcategory' | 'link' | 'megamenu'
  parent: string | null
  icon?: string
  badge?: string
  badgeColor?: string
  description?: string
  image?: { src: string; alt: string }
  featuredProducts?: any[]
  showInHeader: boolean
  showInFooter: boolean
  showInMobile: boolean
  openInNewTab: boolean
  cssClass?: string
  children?: NavigationItem[]
}

interface Product {
  _id: string
  title: string
  handle: string
  images?: { src: string }[]
  variants?: { price: number }[]
}

export default function NavigationManagementPage() {
  const { isAuthenticated, isLoading: authLoading } = useAdminAuth()
  const router = useRouter()
  
  const [navItems, setNavItems] = useState<NavigationItem[]>([])
  const [flatItems, setFlatItems] = useState<NavigationItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'tree' | 'flat'>('tree')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  
  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null)
  const [parentId, setParentId] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    href: '',
    type: 'link' as NavigationItem['type'],
    icon: '',
    badge: '',
    badgeColor: '#1B198F',
    description: '',
    imageSrc: '',
    imageAlt: '',
    showInHeader: true,
    showInFooter: false,
    showInMobile: true,
    openInNewTab: false,
    cssClass: '',
    featuredProducts: [] as string[]
  })

  const fetchNavigation = useCallback(async () => {
    try {
      setLoading(true)
      const [navRes, flatRes] = await Promise.all([
        fetch('/api/admin/navigation'),
        fetch('/api/admin/navigation?flat=true')
      ])
      
      // Check for non-JSON responses (520 proxy errors return HTML)
      const navContentType = navRes.headers.get('content-type')
      const flatContentType = flatRes.headers.get('content-type')
      
      if (!navContentType?.includes('application/json') || !flatContentType?.includes('application/json')) {
        console.error('Non-JSON response received - possible proxy error')
        toast.error('Failed to load navigation - server error')
        setLoading(false)
        return
      }
      
      if (navRes.ok && flatRes.ok) {
        const navData = await navRes.json()
        const flatData = await flatRes.json()
        if (navData.success) {
          setNavItems(navData.data || [])
        }
        if (flatData.success) {
          setFlatItems(flatData.data || [])
        }
      } else {
        console.error('API error:', navRes.status, flatRes.status)
        toast.error('Failed to load navigation')
      }
    } catch (error) {
      console.error('Error fetching navigation:', error)
      toast.error('Failed to load navigation')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products?limit=100')
      if (res.ok) {
        const data = await res.json()
        if (data.success || data.data) {
          setProducts(data.data || [])
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin')
    }
  }, [isAuthenticated, authLoading, router])

  // Fetch on mount regardless of auth (read-only)
  useEffect(() => {
    fetchNavigation()
    fetchProducts()
  }, [fetchNavigation, fetchProducts])

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const expandAll = () => {
    const allIds = new Set(flatItems.map(item => item._id))
    setExpandedItems(allIds)
  }

  const collapseAll = () => {
    setExpandedItems(new Set())
  }

  const openCreateModal = (parent: string | null = null) => {
    setParentId(parent)
    setEditingItem(null)
    setFormData({
      name: '',
      href: '',
      type: parent ? 'subcategory' : 'category',
      icon: '',
      badge: '',
      badgeColor: '#1B198F',
      description: '',
      imageSrc: '',
      imageAlt: '',
      showInHeader: true,
      showInFooter: false,
      showInMobile: true,
      openInNewTab: false,
      cssClass: '',
      featuredProducts: []
    })
    setShowModal(true)
  }

  const openEditModal = (item: NavigationItem) => {
    setEditingItem(item)
    setParentId(item.parent)
    setFormData({
      name: item.name,
      href: item.href,
      type: item.type,
      icon: item.icon || '',
      badge: item.badge || '',
      badgeColor: item.badgeColor || '#1B198F',
      description: item.description || '',
      imageSrc: item.image?.src || '',
      imageAlt: item.image?.alt || '',
      showInHeader: item.showInHeader,
      showInFooter: item.showInFooter,
      showInMobile: item.showInMobile,
      openInNewTab: item.openInNewTab,
      cssClass: item.cssClass || '',
      featuredProducts: item.featuredProducts?.map((p: any) => p._id || p) || []
    })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.href) {
      toast.error('Name and URL are required')
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: formData.name,
        href: formData.href,
        type: formData.type,
        parent: parentId,
        icon: formData.icon || undefined,
        badge: formData.badge || undefined,
        badgeColor: formData.badgeColor,
        description: formData.description || undefined,
        image: formData.imageSrc ? { src: formData.imageSrc, alt: formData.imageAlt || formData.name } : undefined,
        showInHeader: formData.showInHeader,
        showInFooter: formData.showInFooter,
        showInMobile: formData.showInMobile,
        openInNewTab: formData.openInNewTab,
        cssClass: formData.cssClass || undefined,
        featuredProducts: formData.featuredProducts
      }

      const url = editingItem 
        ? `/api/admin/navigation/${editingItem._id}`
        : '/api/admin/navigation'
      
      const res = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      
      if (data.success) {
        toast.success(editingItem ? 'Menu item updated!' : 'Menu item created!')
        setShowModal(false)
        fetchNavigation()
      } else {
        toast.error(data.error || 'Failed to save')
      }
    } catch (error) {
      console.error('Error saving:', error)
      toast.error('Failed to save menu item')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item: NavigationItem) => {
    const hasChildren = item.children && item.children.length > 0
    const message = hasChildren 
      ? `Delete "${item.name}" and all its ${item.children?.length} sub-items?`
      : `Delete "${item.name}"?`
    
    if (!confirm(message)) return

    try {
      const res = await fetch(`/api/admin/navigation/${item._id}`, {
        method: 'DELETE'
      })

      const data = await res.json()
      
      if (data.success) {
        toast.success('Menu item deleted!')
        fetchNavigation()
      } else {
        toast.error(data.error || 'Failed to delete')
      }
    } catch (error) {
      console.error('Error deleting:', error)
      toast.error('Failed to delete menu item')
    }
  }

  const toggleActive = async (item: NavigationItem) => {
    try {
      const res = await fetch(`/api/admin/navigation/${item._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !item.isActive })
      })

      if (res.ok) {
        toast.success(`Menu item ${item.isActive ? 'disabled' : 'enabled'}`)
        fetchNavigation()
      }
    } catch (error) {
      console.error('Error toggling status:', error)
      toast.error('Failed to update status')
    }
  }

  const moveItem = async (item: NavigationItem, direction: 'up' | 'down') => {
    const siblings = flatItems.filter(i => i.parent === item.parent).sort((a, b) => a.order - b.order)
    const currentIndex = siblings.findIndex(i => i._id === item._id)
    
    if (direction === 'up' && currentIndex === 0) return
    if (direction === 'down' && currentIndex === siblings.length - 1) return

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    const swapItem = siblings[swapIndex]

    try {
      await fetch('/api/admin/navigation/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            { id: item._id, order: swapItem.order },
            { id: swapItem._id, order: item.order }
          ]
        })
      })
      fetchNavigation()
    } catch (error) {
      console.error('Error reordering:', error)
      toast.error('Failed to reorder')
    }
  }

  const duplicateItem = async (item: NavigationItem) => {
    try {
      const res = await fetch('/api/admin/navigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${item.name} (Copy)`,
          href: item.href,
          type: item.type,
          parent: item.parent,
          icon: item.icon,
          badge: item.badge,
          badgeColor: item.badgeColor,
          description: item.description,
          image: item.image,
          showInHeader: item.showInHeader,
          showInFooter: item.showInFooter,
          showInMobile: item.showInMobile,
          openInNewTab: item.openInNewTab,
          cssClass: item.cssClass,
          featuredProducts: item.featuredProducts?.map((p: any) => p._id || p)
        })
      })

      if (res.ok) {
        toast.success('Menu item duplicated!')
        fetchNavigation()
      }
    } catch (error) {
      console.error('Error duplicating:', error)
      toast.error('Failed to duplicate')
    }
  }

  const renderTreeItem = (item: NavigationItem, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.has(item._id)
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.href.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch && !hasChildren) return null

    return (
      <div key={item._id} className="select-none">
        <div 
          className={`group flex items-center gap-2 rounded-lg border px-3 py-2.5 transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800 ${
            item.isActive 
              ? 'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800' 
              : 'border-dashed border-neutral-300 bg-neutral-50 opacity-60 dark:border-neutral-600 dark:bg-neutral-900'
          }`}
          style={{ marginLeft: depth * 24 }}
        >
          {/* Drag Handle */}
          <GripVertical className="h-4 w-4 cursor-grab text-neutral-400 opacity-0 group-hover:opacity-100" />
          
          {/* Expand/Collapse */}
          {hasChildren ? (
            <button 
              onClick={() => toggleExpand(item._id)}
              className="rounded p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-neutral-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-neutral-500" />
              )}
            </button>
          ) : (
            <div className="w-5" />
          )}

          {/* Type Icon */}
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            item.type === 'megamenu' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' :
            item.type === 'category' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' :
            item.type === 'subcategory' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' :
            'bg-neutral-100 text-neutral-600 dark:bg-neutral-700'
          }`}>
            {item.type === 'megamenu' ? <LayoutGrid className="h-4 w-4" /> :
             item.type === 'category' ? <FolderTree className="h-4 w-4" /> :
             item.type === 'subcategory' ? <Layers className="h-4 w-4" /> :
             <Link className="h-4 w-4" />}
          </div>

          {/* Image Preview */}
          {item.image?.src && (
            <div className="relative h-8 w-12 overflow-hidden rounded border border-neutral-200 dark:border-neutral-600">
              <Image src={item.image.src} alt={item.image.alt || ''} fill className="object-cover" />
            </div>
          )}

          {/* Name & Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`font-medium truncate ${!item.isActive && 'line-through'}`}>
                {item.name}
              </span>
              {item.badge && (
                <span 
                  className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded"
                  style={{ backgroundColor: `${item.badgeColor}20`, color: item.badgeColor }}
                >
                  {item.badge}
                </span>
              )}
              {item.openInNewTab && <ExternalLink className="h-3 w-3 text-neutral-400" />}
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span className="truncate">{item.href}</span>
              {!item.showInMobile && <Smartphone className="h-3 w-3 line-through" />}
            </div>
          </div>

          {/* Children Count */}
          {hasChildren && (
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
              {item.children?.length} items
            </span>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => toggleActive(item)}
              className={`rounded p-1.5 transition-colors ${
                item.isActive 
                  ? 'hover:bg-yellow-100 text-yellow-600' 
                  : 'hover:bg-green-100 text-green-600'
              }`}
              title={item.isActive ? 'Disable' : 'Enable'}
            >
              {item.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
            
            <button
              onClick={() => openCreateModal(item._id)}
              className="rounded p-1.5 text-blue-600 hover:bg-blue-100"
              title="Add Sub-item"
            >
              <Plus className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => openEditModal(item)}
              className="rounded p-1.5 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
              title="Edit"
            >
              <Edit2 className="h-4 w-4" />
            </button>

            <div className="relative group/dropdown">
              <button className="rounded p-1.5 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700">
                <MoreVertical className="h-4 w-4" />
              </button>
              <div className="absolute right-0 top-full z-10 hidden w-40 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg group-hover/dropdown:block dark:border-neutral-700 dark:bg-neutral-800">
                <button
                  onClick={() => moveItem(item, 'up')}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  <MoveUp className="h-4 w-4" /> Move Up
                </button>
                <button
                  onClick={() => moveItem(item, 'down')}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  <MoveDown className="h-4 w-4" /> Move Down
                </button>
                <button
                  onClick={() => duplicateItem(item)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  <Copy className="h-4 w-4" /> Duplicate
                </button>
                <hr className="my-1 border-neutral-200 dark:border-neutral-700" />
                <button
                  onClick={() => handleDelete(item)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children?.map(child => renderTreeItem(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-200 border-t-[#1B198F]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/95">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Navigation Manager</h1>
            <p className="text-sm text-neutral-500">
              Manage your website's header, footer, and mobile navigation
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => openCreateModal(null)}
              className="flex items-center gap-2 rounded-lg bg-[#1B198F] px-4 py-2.5 font-medium text-white transition-colors hover:bg-[#1B198F]/90"
            >
              <Plus className="h-5 w-5" />
              Add Menu Item
            </button>
            <button
              onClick={fetchNavigation}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-[#1B198F]" />
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              Refresh
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-4 border-t border-neutral-100 px-6 py-3 dark:border-neutral-800">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-[#1B198F] focus:ring-2 focus:ring-[#1B198F]/20 dark:border-neutral-700 dark:bg-neutral-800"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
            <button
              onClick={() => setViewMode('tree')}
              className={`flex items-center gap-2 rounded-l-lg px-3 py-2 text-sm ${
                viewMode === 'tree' 
                  ? 'bg-[#1B198F] text-white' 
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700'
              }`}
            >
              <FolderTree className="h-4 w-4" /> Tree
            </button>
            <button
              onClick={() => setViewMode('flat')}
              className={`flex items-center gap-2 rounded-r-lg px-3 py-2 text-sm ${
                viewMode === 'flat' 
                  ? 'bg-[#1B198F] text-white' 
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700'
              }`}
            >
              <Menu className="h-4 w-4" /> Flat
            </button>
          </div>

          {/* Expand/Collapse */}
          <div className="flex items-center gap-1">
            <button
              onClick={expandAll}
              className="rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              Collapse All
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-neutral-500">
            <span>{flatItems.length} total items</span>
            <span>{flatItems.filter(i => !i.parent).length} root items</span>
            <span>{flatItems.filter(i => !i.isActive).length} disabled</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {navItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-white py-16 dark:border-neutral-700 dark:bg-neutral-800">
            <Menu className="h-16 w-16 text-neutral-300 dark:text-neutral-600" />
            <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-white">No menu items yet</h3>
            <p className="mt-2 text-neutral-500">Get started by creating your first navigation item</p>
            <button
              onClick={() => openCreateModal(null)}
              className="mt-6 flex items-center gap-2 rounded-lg bg-[#1B198F] px-4 py-2.5 font-medium text-white"
            >
              <Plus className="h-5 w-5" />
              Create First Menu Item
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {viewMode === 'tree' 
              ? navItems.map(item => renderTreeItem(item))
              : flatItems
                  .filter(item => !searchQuery || 
                    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.href.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .sort((a, b) => a.order - b.order)
                  .map(item => renderTreeItem(item, 0))
            }
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-2xl dark:bg-neutral-800"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-700">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                    {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
                  </h2>
                  {parentId && (
                    <p className="text-sm text-neutral-500">
                      Adding to: {flatItems.find(i => i._id === parentId)?.name}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-full p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="max-h-[calc(100vh-250px)] overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 outline-none focus:border-[#1B198F] focus:ring-2 focus:ring-[#1B198F]/20 dark:border-neutral-600 dark:bg-neutral-700"
                        placeholder="e.g., Protein"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        URL *
                      </label>
                      <input
                        type="text"
                        value={formData.href}
                        onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                        className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 outline-none focus:border-[#1B198F] focus:ring-2 focus:ring-[#1B198F]/20 dark:border-neutral-600 dark:bg-neutral-700"
                        placeholder="e.g., /collections/protein"
                      />
                    </div>
                  </div>

                  {/* Type & Parent */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 outline-none focus:border-[#1B198F] dark:border-neutral-600 dark:bg-neutral-700"
                      >
                        <option value="megamenu">Mega Menu (with image & products)</option>
                        <option value="category">Category (with sub-items)</option>
                        <option value="subcategory">Sub-category</option>
                        <option value="link">Simple Link</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Parent Menu
                      </label>
                      <select
                        value={parentId || ''}
                        onChange={(e) => setParentId(e.target.value || null)}
                        className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 outline-none focus:border-[#1B198F] dark:border-neutral-600 dark:bg-neutral-700"
                      >
                        <option value="">Root Level (Top Navigation)</option>
                        {flatItems
                          .filter(i => i._id !== editingItem?._id)
                          .map(item => (
                            <option key={item._id} value={item._id}>
                              {item.parent ? '-- ' : ''}{item.name}
                            </option>
                          ))
                        }
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Description (shown in mega menu)
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 outline-none focus:border-[#1B198F] dark:border-neutral-600 dark:bg-neutral-700"
                      placeholder="e.g., Premium quality proteins for muscle growth"
                    />
                  </div>

                  {/* Badge */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Badge Text
                      </label>
                      <input
                        type="text"
                        value={formData.badge}
                        onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                        className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 outline-none focus:border-[#1B198F] dark:border-neutral-600 dark:bg-neutral-700"
                        placeholder="e.g., New, Sale, Premium"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Badge Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.badgeColor}
                          onChange={(e) => setFormData({ ...formData, badgeColor: e.target.value })}
                          className="h-10 w-14 cursor-pointer rounded border border-neutral-300"
                        />
                        <input
                          type="text"
                          value={formData.badgeColor}
                          onChange={(e) => setFormData({ ...formData, badgeColor: e.target.value })}
                          className="flex-1 rounded-lg border border-neutral-300 px-4 py-2.5 outline-none dark:border-neutral-600 dark:bg-neutral-700"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Image */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Featured Image (shown in mega menu hover)
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={formData.imageSrc}
                        onChange={(e) => setFormData({ ...formData, imageSrc: e.target.value })}
                        className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 outline-none focus:border-[#1B198F] dark:border-neutral-600 dark:bg-neutral-700"
                        placeholder="Image URL"
                      />
                      <input
                        type="text"
                        value={formData.imageAlt}
                        onChange={(e) => setFormData({ ...formData, imageAlt: e.target.value })}
                        className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 outline-none focus:border-[#1B198F] dark:border-neutral-600 dark:bg-neutral-700"
                        placeholder="Alt text"
                      />
                    </div>
                    {formData.imageSrc && (
                      <div className="relative mt-3 h-32 w-full overflow-hidden rounded-lg border border-neutral-200">
                        <Image src={formData.imageSrc} alt={formData.imageAlt || 'Preview'} fill className="object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Featured Products */}
                  {(formData.type === 'megamenu' || formData.type === 'category') && (
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Featured Products (shown in mega menu)
                      </label>
                      <select
                        multiple
                        value={formData.featuredProducts}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, option => option.value)
                          setFormData({ ...formData, featuredProducts: selected })
                        }}
                        className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 outline-none focus:border-[#1B198F] dark:border-neutral-600 dark:bg-neutral-700"
                        style={{ minHeight: '120px' }}
                      >
                        {products.map(p => (
                          <option key={p._id} value={p._id}>
                            {p.title} - ₹{p.variants?.[0]?.price}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-neutral-500">Hold Ctrl/Cmd to select multiple products</p>
                    </div>
                  )}

                  {/* Display Options */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Display Options
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: 'showInHeader', label: 'Show in Header', icon: Monitor },
                        { key: 'showInFooter', label: 'Show in Footer', icon: FileText },
                        { key: 'showInMobile', label: 'Show on Mobile', icon: Smartphone },
                        { key: 'openInNewTab', label: 'Open in New Tab', icon: ExternalLink },
                      ].map(({ key, label, icon: Icon }) => (
                        <label key={key} className="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-200 p-3 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-700">
                          <input
                            type="checkbox"
                            checked={(formData as any)[key]}
                            onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                            className="h-4 w-4 rounded border-neutral-300 text-[#1B198F] focus:ring-[#1B198F]"
                          />
                          <Icon className="h-4 w-4 text-neutral-500" />
                          <span className="text-sm">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* CSS Class */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Custom CSS Class
                    </label>
                    <input
                      type="text"
                      value={formData.cssClass}
                      onChange={(e) => setFormData({ ...formData, cssClass: e.target.value })}
                      className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 outline-none focus:border-[#1B198F] dark:border-neutral-600 dark:bg-neutral-700"
                      placeholder="e.g., highlight-item, featured-menu"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-neutral-200 px-6 py-4 dark:border-neutral-700">
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-lg px-4 py-2.5 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-[#1B198F] px-6 py-2.5 font-medium text-white hover:bg-[#1B198F]/90 disabled:opacity-50"
                >
                  {saving ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <Save className="h-5 w-5" />
                  )}
                  {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
