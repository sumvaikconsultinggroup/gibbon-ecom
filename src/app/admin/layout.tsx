'use client'

import { useState, useEffect } from 'react'
import { useUser, SignIn, useClerk } from '@clerk/nextjs'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  TrendingUp,
  BarChart3,
  Tag,
  Percent,
  FileText,
  HelpCircle,
  Moon,
  Sun,
  Store,
} from 'lucide-react'

const sidebarItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Inventory', href: '/admin/inventory', icon: Tag },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Discounts', href: '/admin/discounts', icon: Percent },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded, isSignedIn } = useUser()
  const { signOut } = useClerk()
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(3)

  // Check if user is admin
  const isAdmin = user?.publicMetadata?.role === 'admin' || user?.emailAddresses?.[0]?.emailAddress?.includes('admin')

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#1B198F] border-t-transparent" />
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#1B198F] via-blue-600 to-purple-700">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Image src="/GibbonLogoEccom.png" alt="Gibbon" width={200} height={60} className="mx-auto mb-4 brightness-0 invert" />
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-white/70">Sign in to manage your store</p>
          </div>
          <SignIn
            appearance={{
              elements: {
                rootBox: 'mx-auto',
                card: 'bg-white/95 backdrop-blur shadow-2xl',
              },
            }}
            redirectUrl="/admin"
          />
        </div>
      </div>
    )
  }

  // For now, allow any signed-in user (you can enable admin check later)
  // if (!isAdmin) {
  //   return (
  //     <div className="flex min-h-screen items-center justify-center bg-neutral-100">
  //       <div className="text-center">
  //         <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
  //         <p className="mt-2 text-neutral-600">You don't have admin privileges.</p>
  //         <Link href="/" className="mt-4 inline-block text-[#1B198F] hover:underline">Go to Store</Link>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-neutral-900' : 'bg-neutral-50'}`}>
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 280 }}
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white shadow-xl transition-transform dark:bg-neutral-800 lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-4 dark:border-neutral-700">
          {!sidebarCollapsed && (
            <Link href="/admin" className="flex items-center gap-2">
              <Image src="/GibbonLogoEccom.png" alt="Gibbon" width={140} height={40} className="h-10 w-auto" />
            </Link>
          )}
          {sidebarCollapsed && (
            <div className="mx-auto">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B198F] font-bold text-white">G</div>
            </div>
          )}
          <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#1B198F] text-white shadow-lg shadow-[#1B198F]/30'
                        : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-neutral-400 group-hover:text-[#1B198F]'}`} />
                    {!sidebarCollapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* View Store Button */}
        <div className="border-t border-neutral-200 p-4 dark:border-neutral-700">
          <Link
            href="/"
            target="_blank"
            className={`flex items-center justify-center gap-2 rounded-xl bg-neutral-100 py-3 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600 ${
              sidebarCollapsed ? 'px-2' : 'px-4'
            }`}
          >
            <Store className="h-5 w-5" />
            {!sidebarCollapsed && <span>View Store</span>}
          </Link>
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-20 hidden h-6 w-6 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-md lg:flex dark:border-neutral-600 dark:bg-neutral-700"
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </motion.aside>

      {/* Main Content */}
      <div className={`transition-all ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-[280px]'}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-neutral-200 bg-white/80 px-4 backdrop-blur-lg dark:border-neutral-700 dark:bg-neutral-800/80 lg:px-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden">
              <Menu className="h-6 w-6" />
            </button>
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search products, orders..."
                className="w-64 rounded-xl border border-neutral-200 bg-neutral-50 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-[#1B198F] focus:ring-2 focus:ring-[#1B198F]/20 dark:border-neutral-600 dark:bg-neutral-700"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-neutral-500 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Notifications */}
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl text-neutral-500 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {notifications}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-3 border-l border-neutral-200 pl-3 dark:border-neutral-700">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  {user?.firstName || 'Admin'}
                </p>
                <p className="text-xs text-neutral-500">Administrator</p>
              </div>
              <button
                onClick={() => signOut({ redirectUrl: '/' })}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
                title="Sign Out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
