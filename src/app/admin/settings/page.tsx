'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import {
  Store,
  Globe,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Truck,
  Bell,
  Shield,
  Palette,
  Save,
  Upload,
} from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [saving, setSaving] = useState(false)

  const [settings, setSettings] = useState({
    storeName: 'Gibbon Nutrition',
    storeEmail: 'support@gibbonnutrition.com',
    storePhone: '+91 98765 43210',
    storeAddress: 'Mumbai, Maharashtra, India',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    freeShippingThreshold: 999,
    taxRate: 18,
  })

  const tabs = [
    { id: 'general', label: 'General', icon: Store },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  const handleSave = async () => {
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Settings</h1>
          <p className="text-neutral-500">Manage your store settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-[#1B198F] px-6 py-2 text-sm font-medium text-white transition-all hover:bg-[#1B198F]/90 disabled:opacity-50"
        >
          <Save className={`h-4 w-4 ${saving ? 'animate-spin' : ''}`} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Tabs */}
        <div className="lg:col-span-1">
          <nav className="space-y-1 rounded-2xl bg-white p-2 shadow-sm dark:bg-neutral-800">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#1B198F] text-white'
                    : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'general' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Store Logo */}
              <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-800">
                <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">Store Logo</h2>
                <div className="flex items-center gap-6">
                  <div className="relative h-20 w-40 overflow-hidden rounded-xl bg-neutral-100">
                    <Image src="/GibbonLogoEccom.png" alt="Store Logo" fill className="object-contain p-2" />
                  </div>
                  <div>
                    <button className="flex items-center gap-2 rounded-xl bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300">
                      <Upload className="h-4 w-4" />
                      Change Logo
                    </button>
                    <p className="mt-2 text-xs text-neutral-500">Recommended: 400x100px PNG or SVG</p>
                  </div>
                </div>
              </div>

              {/* Store Details */}
              <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-800">
                <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">Store Details</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Store Name
                    </label>
                    <input
                      type="text"
                      value={settings.storeName}
                      onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                      className="w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={settings.storeEmail}
                      onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                      className="w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={settings.storePhone}
                      onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                      className="w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Address
                    </label>
                    <input
                      type="text"
                      value={settings.storeAddress}
                      onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
                      className="w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-900"
                    />
                  </div>
                </div>
              </div>

              {/* Regional Settings */}
              <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-800">
                <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">Regional Settings</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Currency
                    </label>
                    <select
                      value={settings.currency}
                      onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                      className="w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-900"
                    >
                      <option value="INR">Indian Rupee (₹)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Timezone
                    </label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                      className="w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-900"
                    >
                      <option value="Asia/Kolkata">India (GMT+5:30)</option>
                      <option value="America/New_York">New York (GMT-5)</option>
                      <option value="Europe/London">London (GMT)</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'payments' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-800"
            >
              <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">Payment Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-purple-100 p-2">
                      <Image src="/paytm.png" alt="PayU" width={32} height={32} className="h-full w-full object-contain" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-white">PayU</p>
                      <p className="text-sm text-neutral-500">Accept payments via PayU</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">Connected</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-100 p-2 text-2xl">
                      💵
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-white">Cash on Delivery</p>
                      <p className="text-sm text-neutral-500">Accept COD payments</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">Enabled</span>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'shipping' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-800">
                <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">Free Shipping</h2>
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Free shipping threshold (₹)
                  </label>
                  <input
                    type="number"
                    value={settings.freeShippingThreshold}
                    onChange={(e) => setSettings({ ...settings, freeShippingThreshold: parseInt(e.target.value) || 0 })}
                    className="w-full max-w-xs rounded-xl border border-neutral-200 px-4 py-3 outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-900"
                  />
                  <p className="mt-2 text-sm text-neutral-500">
                    Orders above this amount get free shipping
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-800">
                <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">Tax Settings</h2>
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    GST Rate (%)
                  </label>
                  <input
                    type="number"
                    value={settings.taxRate}
                    onChange={(e) => setSettings({ ...settings, taxRate: parseInt(e.target.value) || 0 })}
                    className="w-full max-w-xs rounded-xl border border-neutral-200 px-4 py-3 outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-900"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-800"
            >
              <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">Email Notifications</h2>
              <div className="space-y-4">
                {[
                  { label: 'New order notifications', description: 'Get notified when a new order is placed' },
                  { label: 'Low stock alerts', description: 'Get notified when products are running low' },
                  { label: 'Customer reviews', description: 'Get notified when customers leave reviews' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-white">{item.label}</p>
                      <p className="text-sm text-neutral-500">{item.description}</p>
                    </div>
                    <button className="relative h-6 w-11 rounded-full bg-green-500 transition-colors">
                      <span className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
