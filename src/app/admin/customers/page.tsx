'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Calendar,
  TrendingUp,
  Users,
  UserPlus,
  Download,
} from 'lucide-react'

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  totalOrders: number
  totalSpent: number
  lastOrder?: string
  createdAt: string
  status: 'active' | 'inactive'
}

// Mock customers data
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    phone: '+91 98765 43210',
    totalOrders: 12,
    totalSpent: 45000,
    lastOrder: '2024-01-02',
    createdAt: '2023-06-15',
    status: 'active',
  },
  {
    id: '2',
    name: 'Priya Patel',
    email: 'priya@example.com',
    phone: '+91 87654 32109',
    totalOrders: 8,
    totalSpent: 32000,
    lastOrder: '2024-01-01',
    createdAt: '2023-07-20',
    status: 'active',
  },
  {
    id: '3',
    name: 'Amit Kumar',
    email: 'amit@example.com',
    totalOrders: 3,
    totalSpent: 8500,
    lastOrder: '2023-12-28',
    createdAt: '2023-09-10',
    status: 'active',
  },
  {
    id: '4',
    name: 'Sneha Gupta',
    email: 'sneha@example.com',
    phone: '+91 76543 21098',
    totalOrders: 1,
    totalSpent: 2499,
    createdAt: '2023-12-01',
    status: 'inactive',
  },
]

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => {
    setTimeout(() => {
      setCustomers(mockCustomers)
      setLoading(false)
    }, 500)
  }, [])

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalCustomers = customers.length
  const activeCustomers = customers.filter(c => c.status === 'active').length
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0)
  const avgOrderValue = totalRevenue / customers.reduce((sum, c) => sum + c.totalOrders, 0) || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Customers</h1>
          <p className="text-neutral-500">{totalCustomers} customers registered</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">Total Customers</p>
              <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">{totalCustomers}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">Active</p>
              <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">{activeCustomers}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <UserPlus className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">Total Revenue</p>
              <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
                ₹{totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">Avg Order Value</p>
              <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
                ₹{avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
              <ShoppingBag className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customers..."
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-[#1B198F] focus:ring-2 focus:ring-[#1B198F]/20 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Customers Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-800">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-neutral-200 dark:bg-neutral-700" />
                  <div className="h-3 w-24 rounded bg-neutral-200 dark:bg-neutral-700" />
                </div>
              </div>
            </div>
          ))
        ) : filteredCustomers.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-neutral-300" />
            <p className="mt-4 text-lg font-medium text-neutral-900 dark:text-white">No customers found</p>
            <p className="mt-1 text-neutral-500">Customers will appear here when they sign up</p>
          </div>
        ) : (
          filteredCustomers.map((customer, index) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:bg-neutral-800"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#1B198F] to-blue-600 text-lg font-bold text-white">
                    {customer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-white">{customer.name}</h3>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      customer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'
                    }`}>
                      {customer.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-neutral-500">
                  <Mail className="h-4 w-4" />
                  {customer.email}
                </div>
                {customer.phone && (
                  <div className="flex items-center gap-2 text-neutral-500">
                    <Phone className="h-4 w-4" />
                    {customer.phone}
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 border-t border-neutral-200 pt-4 dark:border-neutral-700">
                <div>
                  <p className="text-xs text-neutral-500">Orders</p>
                  <p className="font-bold text-neutral-900 dark:text-white">{customer.totalOrders}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Total Spent</p>
                  <p className="font-bold text-green-600">₹{customer.totalSpent.toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Joined {new Date(customer.createdAt).toLocaleDateString('en-IN')}
                </span>
                {customer.lastOrder && (
                  <span>Last order: {new Date(customer.lastOrder).toLocaleDateString('en-IN')}</span>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
