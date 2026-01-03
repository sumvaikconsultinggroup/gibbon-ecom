'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Percent,
  Settings,
  BarChart3,
  Plus,
  ArrowRight,
  Command,
  LayoutDashboard,
  Boxes,
  Truck,
  CreditCard,
  UserPlus,
  FileText,
  Bell,
  Plug,
  Zap,
  FolderOpen,
} from 'lucide-react'

interface CommandItem {
  id: string
  title: string
  description?: string
  icon: React.ElementType
  action: () => void
  category: 'navigation' | 'actions' | 'search'
  shortcut?: string
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const navigate = useCallback((path: string) => {
    router.push(path)
    setIsOpen(false)
    setQuery('')
  }, [router])

  const commands: CommandItem[] = [
    // Navigation
    { id: 'dashboard', title: 'Go to Dashboard', icon: LayoutDashboard, action: () => navigate('/admin'), category: 'navigation', shortcut: 'G D' },
    { id: 'orders', title: 'Go to Orders', icon: ShoppingCart, action: () => navigate('/admin/orders'), category: 'navigation', shortcut: 'G O' },
    { id: 'products', title: 'Go to Products', icon: Package, action: () => navigate('/admin/products'), category: 'navigation', shortcut: 'G P' },
    { id: 'collections', title: 'Go to Collections', icon: FolderOpen, action: () => navigate('/admin/collections'), category: 'navigation' },
    { id: 'inventory', title: 'Go to Inventory', icon: Boxes, action: () => navigate('/admin/inventory'), category: 'navigation' },
    { id: 'customers', title: 'Go to Customers', icon: Users, action: () => navigate('/admin/customers'), category: 'navigation', shortcut: 'G C' },
    { id: 'analytics', title: 'Go to Analytics', icon: BarChart3, action: () => navigate('/admin/analytics'), category: 'navigation', shortcut: 'G A' },
    { id: 'discounts', title: 'Go to Discounts', icon: Percent, action: () => navigate('/admin/discounts'), category: 'navigation' },
    { id: 'settings', title: 'Go to Settings', icon: Settings, action: () => navigate('/admin/settings'), category: 'navigation', shortcut: 'G S' },
    { id: 'integrations', title: 'Go to Integrations', icon: Plug, action: () => navigate('/admin/settings/integrations'), category: 'navigation' },
    { id: 'payments', title: 'Payment Settings', icon: CreditCard, action: () => navigate('/admin/settings/integrations/payments'), category: 'navigation' },
    { id: 'shipping', title: 'Shipping Settings', icon: Truck, action: () => navigate('/admin/settings/integrations/shipping'), category: 'navigation' },
    { id: 'team', title: 'Team & Roles', icon: UserPlus, action: () => navigate('/admin/settings/team'), category: 'navigation' },
    { id: 'automation', title: 'Automation Rules', icon: Zap, action: () => navigate('/admin/automation'), category: 'navigation' },
    
    // Actions
    { id: 'new-product', title: 'Create New Product', description: 'Add a new product to your catalog', icon: Plus, action: () => navigate('/admin/products/new'), category: 'actions' },
    { id: 'new-collection', title: 'Create New Collection', description: 'Create a new product collection', icon: Plus, action: () => navigate('/admin/collections/new'), category: 'actions' },
    { id: 'new-discount', title: 'Create New Discount', description: 'Set up a new discount code', icon: Plus, action: () => navigate('/admin/discounts/new'), category: 'actions' },
    { id: 'export-orders', title: 'Export Orders', description: 'Download orders as CSV', icon: FileText, action: () => console.log('Export orders'), category: 'actions' },
    { id: 'export-products', title: 'Export Products', description: 'Download products as CSV', icon: FileText, action: () => console.log('Export products'), category: 'actions' },
  ]

  const filteredCommands = query
    ? commands.filter(cmd =>
        cmd.title.toLowerCase().includes(query.toLowerCase()) ||
        cmd.description?.toLowerCase().includes(query.toLowerCase())
      )
    : commands

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = []
    acc[cmd.category].push(cmd)
    return acc
  }, {} as Record<string, CommandItem[]>)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open with Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
      
      // Close with Escape
      if (e.key === 'Escape') {
        setIsOpen(false)
        setQuery('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Handle keyboard navigation within palette
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const totalItems = filteredCommands.length
      
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % totalItems)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        filteredCommands[selectedIndex]?.action()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredCommands, selectedIndex])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const categoryLabels: Record<string, string> = {
    navigation: 'Navigation',
    actions: 'Quick Actions',
    search: 'Search Results',
  }

  let itemIndex = -1

  return (
    <>
      {/* Trigger Button in Header */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-500 transition-all hover:border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-neutral-600"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="ml-4 flex items-center gap-0.5 rounded bg-neutral-200 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400">
          <Command className="h-3 w-3" />K
        </kbd>
      </button>

      {/* Command Palette Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                setIsOpen(false)
                setQuery('')
              }}
            />

            {/* Palette */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.15 }}
              className="fixed left-1/2 top-[20%] z-50 w-full max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-neutral-900"
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 border-b border-neutral-200 px-4 dark:border-neutral-700">
                <Search className="h-5 w-5 text-neutral-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search commands, pages, actions..."
                  className="flex-1 bg-transparent py-4 text-sm outline-none placeholder:text-neutral-400 dark:text-white"
                />
                <kbd className="rounded bg-neutral-100 px-2 py-1 text-[10px] font-medium text-neutral-500 dark:bg-neutral-800">ESC</kbd>
              </div>

              {/* Commands List */}
              <div className="max-h-80 overflow-y-auto p-2">
                {filteredCommands.length === 0 ? (
                  <div className="py-8 text-center text-sm text-neutral-500">
                    No results found for "{query}"
                  </div>
                ) : (
                  Object.entries(groupedCommands).map(([category, items]) => (
                    <div key={category} className="mb-2">
                      <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                        {categoryLabels[category]}
                      </div>
                      {items.map((cmd) => {
                        itemIndex++
                        const currentIndex = itemIndex
                        return (
                          <button
                            key={cmd.id}
                            onClick={cmd.action}
                            onMouseEnter={() => setSelectedIndex(currentIndex)}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                              selectedIndex === currentIndex
                                ? 'bg-[#1B198F] text-white'
                                : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                            }`}
                          >
                            <cmd.icon className={`h-5 w-5 ${selectedIndex === currentIndex ? 'text-white' : 'text-neutral-400'}`} />
                            <div className="flex-1">
                              <div className="text-sm font-medium">{cmd.title}</div>
                              {cmd.description && (
                                <div className={`text-xs ${selectedIndex === currentIndex ? 'text-white/70' : 'text-neutral-500'}`}>
                                  {cmd.description}
                                </div>
                              )}
                            </div>
                            {cmd.shortcut && (
                              <kbd className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                                selectedIndex === currentIndex
                                  ? 'bg-white/20 text-white'
                                  : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'
                              }`}>
                                {cmd.shortcut}
                              </kbd>
                            )}
                            <ArrowRight className={`h-4 w-4 ${selectedIndex === currentIndex ? 'text-white' : 'text-neutral-300'}`} />
                          </button>
                        )
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-2 text-xs text-neutral-500 dark:border-neutral-700">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded bg-neutral-100 px-1.5 py-0.5 dark:bg-neutral-800">↑↓</kbd> navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded bg-neutral-100 px-1.5 py-0.5 dark:bg-neutral-800">↵</kbd> select
                  </span>
                </div>
                <span>Powered by Gibbon Admin</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
