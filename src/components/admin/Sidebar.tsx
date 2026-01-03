'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FolderOpen,
  Boxes,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Store,
  Percent,
  Zap,
  Tag,
  Megaphone,
  UserPlus,
  Plug,
  CreditCard,
  Truck,
  Bell,
  Code,
  Receipt,
  FileText,
  Heart,
  X,
  Menu,
  Home,
  PanelTop,
} from 'lucide-react'

interface NavItem {
  name: string
  href?: string
  icon: React.ElementType
  permission?: string | null
  children?: NavItem[]
  badge?: string | number
}

const sidebarItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    permission: null,
  },
  {
    name: 'Live View',
    href: '/admin/live',
    icon: Store,
    permission: null,
    badge: 'Live',
  },
  {
    name: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
    permission: 'orders.view',
  },
  {
    name: 'Catalog',
    icon: Package,
    permission: 'products.view',
    children: [
      { name: 'Products', href: '/admin/products', icon: Package, permission: 'products.view' },
      { name: 'Collections', href: '/admin/collections', icon: FolderOpen, permission: 'products.view' },
      { name: 'Navigation', href: '/admin/navigation', icon: Menu, permission: 'settings.view', badge: 'New' },
    ],
  },
  {
    name: 'Inventory',
    href: '/admin/inventory',
    icon: Boxes,
    permission: 'products.view',
  },
  {
    name: 'Customers',
    href: '/admin/customers',
    icon: Users,
    permission: 'customers.view',
  },
  {
    name: 'Marketing',
    icon: Megaphone,
    permission: 'discounts.view',
    children: [
      { name: 'Discounts', href: '/admin/discounts', icon: Percent, permission: 'discounts.view' },
      { name: 'Abandoned Carts', href: '/admin/marketing/abandoned', icon: ShoppingCart, permission: 'analytics.view' },
    ],
  },
  {
    name: 'Analytics',
    icon: BarChart3,
    permission: 'analytics.view',
    children: [
      { name: 'Overview', href: '/admin/analytics', icon: BarChart3, permission: 'analytics.view' },
      { name: 'Reports', href: '/admin/reports', icon: FileText, permission: 'analytics.view' },
      { name: 'Finance', href: '/admin/finance', icon: CreditCard, permission: 'analytics.view' },
    ],
  },
  {
    name: 'Automation',
    href: '/admin/automation',
    icon: Zap,
    permission: 'settings.view',
    badge: 'New',
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    permission: 'settings.view',
  },
]

interface SidebarProps {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
  hasPermission: (permission: string) => boolean
}

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  hasPermission,
}: SidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  // Auto-expand parent items based on current path
  useEffect(() => {
    sidebarItems.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some(
          (child) => child.href && pathname.startsWith(child.href)
        )
        if (isChildActive && !expandedItems.includes(item.name)) {
          setExpandedItems((prev) => [...prev, item.name])
        }
      }
    })
  }, [pathname])

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    )
  }

  const isActive = (href?: string) => {
    if (!href) return false
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const isParentActive = (item: NavItem) => {
    if (item.href) return isActive(item.href)
    return item.children?.some((child) => isActive(child.href))
  }

  const visibleItems = sidebarItems.filter(
    (item) => item.permission === null || hasPermission(item.permission)
  )

  const renderNavItem = (item: NavItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.name)
    const active = isParentActive(item)

    if (hasChildren) {
      return (
        <li key={item.name}>
          <button
            onClick={() => toggleExpand(item.name)}
            className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              active
                ? 'bg-[#1B198F]/10 text-[#1B198F] dark:bg-[#1B198F]/20 dark:text-white'
                : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700'
            }`}
          >
            <item.icon
              className={`h-5 w-5 flex-shrink-0 ${
                active ? 'text-[#1B198F] dark:text-white' : 'text-neutral-400 group-hover:text-[#1B198F]'
              }`}
            />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">{item.name}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
              </>
            )}
          </button>
          
          <AnimatePresence>
            {isExpanded && !collapsed && (
              <motion.ul
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="ml-4 mt-1 space-y-1 overflow-hidden border-l border-neutral-200 pl-4 dark:border-neutral-700"
              >
                {item.children!.map((child) => (
                  <li key={child.name}>
                    <Link
                      href={child.href!}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                        isActive(child.href)
                          ? 'bg-[#1B198F] text-white shadow-lg shadow-[#1B198F]/20'
                          : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700'
                      }`}
                    >
                      <child.icon className="h-4 w-4" />
                      <span>{child.name}</span>
                    </Link>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </li>
      )
    }

    return (
      <li key={item.name}>
        <Link
          href={item.href!}
          onClick={() => setMobileOpen(false)}
          className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
            active
              ? 'bg-[#1B198F] text-white shadow-lg shadow-[#1B198F]/30'
              : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700'
          }`}
        >
          <item.icon
            className={`h-5 w-5 flex-shrink-0 ${
              active ? 'text-white' : 'text-neutral-400 group-hover:text-[#1B198F]'
            }`}
          />
          {!collapsed && (
            <>
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-green-700 dark:bg-green-900 dark:text-green-300">
                  {item.badge}
                </span>
              )}
            </>
          )}
        </Link>
      </li>
    )
  }

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 280 }}
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white shadow-xl transition-transform dark:bg-neutral-800 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-4 dark:border-neutral-700">
          {!collapsed && (
            <Link href="/admin" className="flex items-center gap-2">
              <Image
                src="/GibbonLogoEccom.png"
                alt="Gibbon"
                width={140}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
          )}
          {collapsed && (
            <div className="mx-auto">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B198F] font-bold text-white">
                G
              </div>
            </div>
          )}
          <button onClick={() => setMobileOpen(false)} className="lg:hidden">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">{visibleItems.map((item) => renderNavItem(item))}</ul>
        </nav>

        {/* View Store Button */}
        <div className="border-t border-neutral-200 p-4 dark:border-neutral-700">
          <Link
            href="/"
            target="_blank"
            className={`flex items-center justify-center gap-2 rounded-xl bg-neutral-100 py-3 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600 ${
              collapsed ? 'px-2' : 'px-4'
            }`}
          >
            <Store className="h-5 w-5" />
            {!collapsed && <span>View Store</span>}
          </Link>
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 hidden h-6 w-6 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-md lg:flex dark:border-neutral-600 dark:bg-neutral-700"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </motion.aside>
    </>
  )
}
