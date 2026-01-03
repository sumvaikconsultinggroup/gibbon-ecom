'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  UserPlus,
  Shield,
  Mail,
  MoreVertical,
  Edit,
  Trash2,
  Check,
  X,
  Loader2,
  Eye,
  Crown,
  Settings,
  Package,
  ShoppingCart,
  BarChart3,
  Percent,
  AlertCircle,
} from 'lucide-react'

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'manager' | 'staff' | 'analyst'
  avatar?: string
  status: 'active' | 'invited' | 'inactive'
  lastActive?: string
  permissions: string[]
}

interface Role {
  id: string
  name: string
  description: string
  color: string
  permissions: string[]
  memberCount: number
}

const permissionGroups = [
  {
    name: 'Products',
    icon: Package,
    permissions: ['products.view', 'products.create', 'products.edit', 'products.delete'],
  },
  {
    name: 'Orders',
    icon: ShoppingCart,
    permissions: ['orders.view', 'orders.edit', 'orders.fulfill', 'orders.refund'],
  },
  {
    name: 'Customers',
    icon: Users,
    permissions: ['customers.view', 'customers.edit', 'customers.export'],
  },
  {
    name: 'Analytics',
    icon: BarChart3,
    permissions: ['analytics.view', 'analytics.export'],
  },
  {
    name: 'Discounts',
    icon: Percent,
    permissions: ['discounts.view', 'discounts.create', 'discounts.edit', 'discounts.delete'],
  },
  {
    name: 'Settings',
    icon: Settings,
    permissions: ['settings.view', 'settings.edit', 'integrations.manage'],
  },
]

export default function TeamPage() {
  const [activeTab, setActiveTab] = useState<'members' | 'roles'>('members')
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)

  // Mock data
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Store Owner',
      email: 'admin@gibbonnutrition.com',
      role: 'owner',
      status: 'active',
      lastActive: '2 min ago',
      permissions: ['*'],
    },
    {
      id: '2',
      name: 'Priya Sharma',
      email: 'priya@gibbonnutrition.com',
      role: 'admin',
      status: 'active',
      lastActive: '1 hour ago',
      permissions: ['*'],
    },
    {
      id: '3',
      name: 'Rahul Kumar',
      email: 'rahul@gibbonnutrition.com',
      role: 'manager',
      status: 'active',
      lastActive: '3 hours ago',
      permissions: ['products.*', 'orders.*', 'customers.view'],
    },
  ])

  const [roles] = useState<Role[]>([
    {
      id: 'owner',
      name: 'Owner',
      description: 'Full access to everything',
      color: 'purple',
      permissions: ['*'],
      memberCount: 1,
    },
    {
      id: 'admin',
      name: 'Admin',
      description: 'Full access except billing and ownership transfer',
      color: 'blue',
      permissions: ['*', '!billing', '!ownership'],
      memberCount: 1,
    },
    {
      id: 'manager',
      name: 'Operations Manager',
      description: 'Manage products, orders, and customers',
      color: 'green',
      permissions: ['products.*', 'orders.*', 'customers.*', 'analytics.view'],
      memberCount: 1,
    },
    {
      id: 'staff',
      name: 'Staff',
      description: 'Process orders and handle customer support',
      color: 'orange',
      permissions: ['orders.view', 'orders.fulfill', 'customers.view'],
      memberCount: 0,
    },
    {
      id: 'analyst',
      name: 'Analyst',
      description: 'View-only access to reports and analytics',
      color: 'neutral',
      permissions: ['analytics.*', 'orders.view', 'products.view'],
      memberCount: 0,
    },
  ])

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('staff')
  const [inviting, setInviting] = useState(false)

  useEffect(() => {
    setTimeout(() => setLoading(false), 500)
  }, [])

  const handleInvite = async () => {
    setInviting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setMembers((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: inviteRole as TeamMember['role'],
        status: 'invited',
        permissions: [],
      },
    ])
    setInviting(false)
    setShowInviteModal(false)
    setInviteEmail('')
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'admin':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'manager':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'staff':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      default:
        return 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-400'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 text-xs text-green-600">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Active
          </span>
        )
      case 'invited':
        return (
          <span className="inline-flex items-center gap-1 text-xs text-yellow-600">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
            Invited
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
            Inactive
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B198F]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-[#1B198F]" />
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Team & Roles</h2>
          </div>
          <p className="mt-1 text-neutral-500">Manage team members and their permissions</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 rounded-xl bg-[#1B198F] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#1B198F]/90"
        >
          <UserPlus className="h-4 w-4" />
          Invite Member
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
        <button
          onClick={() => setActiveTab('members')}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            activeTab === 'members'
              ? 'bg-white text-neutral-900 shadow dark:bg-neutral-700 dark:text-white'
              : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400'
          }`}
        >
          <Users className="mr-2 inline h-4 w-4" />
          Team Members ({members.length})
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            activeTab === 'roles'
              ? 'bg-white text-neutral-900 shadow dark:bg-neutral-700 dark:text-white'
              : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400'
          }`}
        >
          <Shield className="mr-2 inline h-4 w-4" />
          Roles & Permissions
        </button>
      </div>

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-neutral-500">Member</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-neutral-500">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-neutral-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-neutral-500">Last Active</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-neutral-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1B198F] font-semibold text-white">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-white">
                            {member.name}
                            {member.role === 'owner' && <Crown className="ml-1 inline h-4 w-4 text-yellow-500" />}
                          </p>
                          <p className="text-sm text-neutral-500">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium capitalize ${getRoleColor(member.role)}`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(member.status)}</td>
                    <td className="px-4 py-3 text-sm text-neutral-500">{member.lastActive || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      {member.role !== 'owner' && (
                        <div className="flex items-center justify-end gap-2">
                          <button className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-700">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="rounded-lg p-2 text-neutral-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          {roles.map((role) => (
            <div
              key={role.id}
              className="rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-800"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${getRoleColor(role.id)}`}>
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-neutral-900 dark:text-white">{role.name}</h3>
                      <span className="text-xs text-neutral-500">({role.memberCount} members)</span>
                    </div>
                    <p className="mt-1 text-sm text-neutral-500">{role.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {role.permissions.slice(0, 5).map((perm) => (
                        <span
                          key={perm}
                          className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400"
                        >
                          {perm === '*' ? 'All Permissions' : perm}
                        </span>
                      ))}
                      {role.permissions.length > 5 && (
                        <span className="text-xs text-neutral-500">+{role.permissions.length - 5} more</span>
                      )}
                    </div>
                  </div>
                </div>
                <button className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-700">
                  <Edit className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={() => setShowRoleModal(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-200 p-6 text-neutral-500 transition-colors hover:border-[#1B198F] hover:text-[#1B198F] dark:border-neutral-700"
          >
            <Shield className="h-5 w-5" />
            Create Custom Role
          </button>
        </div>
      )}

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowInviteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-800"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Invite Team Member</h3>
                <button onClick={() => setShowInviteModal(false)}>
                  <X className="h-5 w-5 text-neutral-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    className="w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-900"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none focus:border-[#1B198F] dark:border-neutral-700 dark:bg-neutral-900"
                  >
                    {roles.filter((r) => r.id !== 'owner').map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleInvite}
                  disabled={!inviteEmail || inviting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1B198F] py-3 font-medium text-white transition-all hover:bg-[#1B198F]/90 disabled:opacity-50"
                >
                  {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  {inviting ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
