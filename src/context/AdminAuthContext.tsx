'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface AdminUser {
  id: string
  email: string
  name: string
  role: 'owner' | 'admin' | 'staff'
  permissions: string[]
  avatar?: string
  lastLogin?: string
}

interface AdminAuthContextType {
  user: AdminUser | null
  isLoading: boolean
  isAuthenticated: boolean
  needsSetup: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
  setup: (data: { email: string; password: string; name: string; storeName?: string }) => Promise<{ success: boolean; message: string }>
  refreshUser: () => Promise<void>
  hasPermission: (permission: string) => boolean
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [needsSetup, setNeedsSetup] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const checkAuth = async () => {
    try {
      // First check if setup is needed
      const setupRes = await fetch('/api/admin/auth/setup', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      })
      
      if (!setupRes.ok) {
        throw new Error('Failed to check setup status')
      }
      
      const setupData = await setupRes.json()
      
      if (setupData.needsSetup) {
        setNeedsSetup(true)
        setIsLoading(false)
        return
      }
      
      setNeedsSetup(false)
      
      // Check if user is logged in
      const res = await fetch('/api/admin/auth/me', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        cache: 'no-store',
      })
      
      const data = await res.json()
      
      if (data.success && data.user) {
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      
      const data = await res.json()
      
      if (data.success) {
        setUser(data.user)
        return { success: true, message: 'Login successful' }
      }
      
      return { success: false, message: data.message || 'Login failed' }
    } catch (error) {
      return { success: false, message: 'Network error. Please try again.' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      router.push('/admin')
    }
  }

  const setup = async (data: { email: string; password: string; name: string; storeName?: string }) => {
    try {
      const res = await fetch('/api/admin/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      const result = await res.json()
      
      if (result.success) {
        setUser(result.user)
        setNeedsSetup(false)
        return { success: true, message: 'Setup complete!' }
      }
      
      return { success: false, message: result.message || 'Setup failed' }
    } catch (error) {
      return { success: false, message: 'Network error. Please try again.' }
    }
  }

  const refreshUser = async () => {
    await checkAuth()
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    if (user.role === 'owner') return true
    return user.permissions.includes(permission)
  }

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        needsSetup,
        login,
        logout,
        setup,
        refreshUser,
        hasPermission,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}
