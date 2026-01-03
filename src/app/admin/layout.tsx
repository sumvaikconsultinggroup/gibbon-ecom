'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext'
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
  BarChart3,
  Tag,
  Percent,
  Moon,
  Sun,
  Store,
  UserPlus,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Building2,
  AlertCircle,
  Loader2,
  CreditCard,
  Truck,
} from 'lucide-react'

const sidebarItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, permission: null },
  { name: 'Products', href: '/admin/products', icon: Package, permission: 'products.view' },
  { name: 'Collections', href: '/admin/collections', icon: Tag, permission: 'products.view' },
  { name: 'Inventory', href: '/admin/inventory', icon: Package, permission: 'products.view' },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart, permission: 'orders.view' },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard, permission: 'orders.view' },
  { name: 'Shipping', href: '/admin/shipping', icon: Truck, permission: 'orders.view' },
  { name: 'Customers', href: '/admin/customers', icon: Users, permission: 'customers.view' },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, permission: 'analytics.view' },
  { name: 'Reports', href: '/admin/reports', icon: BarChart3, permission: 'analytics.view' },
  { name: 'Discounts', href: '/admin/discounts', icon: Percent, permission: 'discounts.view' },
  { name: 'Staff', href: '/admin/staff', icon: UserPlus, permission: 'staff.view' },
  { name: 'Settings', href: '/admin/settings', icon: Settings, permission: 'settings.view' },
]

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, needsSetup, login, logout, setup, hasPermission } = useAdminAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [notifications] = useState(3)

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Setup form state
  const [setupName, setSetupName] = useState('')
  const [setupEmail, setSetupEmail] = useState('')
  const [setupPassword, setSetupPassword] = useState('')
  const [setupStoreName, setSetupStoreName] = useState('Gibbon Nutrition')
  const [setupError, setSetupError] = useState('')
  const [setupLoading, setSetupLoading] = useState(false)

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)

    const result = await login(loginEmail, loginPassword)
    
    if (!result.success) {
      setLoginError(result.message)
    }
    setLoginLoading(false)
  }

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setSetupError('')
    setSetupLoading(true)

    const result = await setup({
      email: setupEmail,
      password: setupPassword,
      name: setupName,
      storeName: setupStoreName,
    })
    
    if (!result.success) {
      setSetupError(result.message)
    }
    setSetupLoading(false)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#1B198F]" />
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Setup screen (first time)
  if (needsSetup) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#1B198F] via-blue-600 to-purple-700 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        >
          <div className="bg-gradient-to-r from-[#1B198F] to-blue-600 p-6 text-center">
            <Image src="/GibbonLogoEccom.png" alt="Gibbon" width={180} height={50} className="mx-auto mb-4 brightness-0 invert" />
            <h1 className="text-2xl font-bold text-white">Welcome to Your Store</h1>
            <p className="text-white/80">Let's set up your admin account</p>
          </div>

          <form onSubmit={handleSetup} className="p-6 space-y-4">
            {setupError && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {setupError}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Your Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={setupName}
                  onChange={(e) => setSetupName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-neutral-200 py-3 pl-10 pr-4 outline-none transition-all focus:border-[#1B198F] focus:ring-2 focus:ring-[#1B198F]/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  value={setupEmail}
                  onChange={(e) => setSetupEmail(e.target.value)}
                  placeholder="admin@gibbonnutrition.com"
                  className="w-full rounded-xl border border-neutral-200 py-3 pl-10 pr-4 outline-none transition-all focus:border-[#1B198F] focus:ring-2 focus:ring-[#1B198F]/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={setupPassword}
                  onChange={(e) => setSetupPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full rounded-xl border border-neutral-200 py-3 pl-10 pr-12 outline-none transition-all focus:border-[#1B198F] focus:ring-2 focus:ring-[#1B198F]/20"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Store Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={setupStoreName}
                  onChange={(e) => setSetupStoreName(e.target.value)}
                  placeholder="My Store"
                  className="w-full rounded-xl border border-neutral-200 py-3 pl-10 pr-4 outline-none transition-all focus:border-[#1B198F] focus:ring-2 focus:ring-[#1B198F]/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={setupLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1B198F] py-3 font-semibold text-white transition-all hover:bg-[#1B198F]/90 disabled:opacity-50"
            >
              {setupLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              {setupLoading ? 'Setting up...' : 'Create Admin Account'}
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#1B198F] via-blue-600 to-purple-700 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        >
          <div className="bg-gradient-to-r from-[#1B198F] to-blue-600 p-6 text-center">
            <Image src="/GibbonLogoEccom.png" alt="Gibbon" width={180} height={50} className="mx-auto mb-4 brightness-0 invert" />
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-white/80">Sign in to manage your store</p>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-4">
            {loginError && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {loginError}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@gibbonnutrition.com"
                  className="w-full rounded-xl border border-neutral-200 py-3 pl-10 pr-4 outline-none transition-all focus:border-[#1B198F] focus:ring-2 focus:ring-[#1B198F]/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-neutral-200 py-3 pl-10 pr-12 outline-none transition-all focus:border-[#1B198F] focus:ring-2 focus:ring-[#1B198F]/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1B198F] py-3 font-semibold text-white transition-all hover:bg-[#1B198F]/90 disabled:opacity-50"
            >
              {loginLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              {loginLoading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="text-center">
              <Link href="/" className="text-sm text-[#1B198F] hover:underline">
                ← Back to Store
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    )
  }

  // Filter sidebar items based on permissions
  const visibleSidebarItems = sidebarItems.filter(item => 
    item.permission === null || hasPermission(item.permission)
  )

  // Main admin dashboard
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
            {visibleSidebarItems.map((item) => {
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
                  {user?.name || 'Admin'}
                </p>
                <p className="text-xs text-neutral-500 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={logout}
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminAuthProvider>
  )
}
