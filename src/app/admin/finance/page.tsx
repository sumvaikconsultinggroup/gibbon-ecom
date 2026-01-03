'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  PieChart,
  BarChart3,
  DollarSign,
  Receipt,
  Banknote,
  ArrowRight,
  CheckCircle,
  Clock,
  XCircle,
  Building,
  Percent,
  FileText,
  Loader2,
} from 'lucide-react'

interface FinanceMetric {
  label: string
  value: number
  change: number
  changeType: 'increase' | 'decrease'
  prefix?: string
}

interface Transaction {
  id: string
  type: 'sale' | 'refund' | 'payout' | 'fee'
  description: string
  amount: number
  status: 'completed' | 'pending' | 'failed'
  date: string
  orderId?: string
  gateway?: string
}

export default function FinancePage() {
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30d')
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'payouts' | 'taxes'>('overview')

  const [metrics, setMetrics] = useState<FinanceMetric[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [revenueByGateway, setRevenueByGateway] = useState<{ gateway: string; amount: number; percentage: number }[]>([])
  const [revenueByDay, setRevenueByDay] = useState<{ date: string; revenue: number; orders: number }[]>([])

  useEffect(() => {
    setTimeout(() => {
      setMetrics([
        { label: 'Gross Revenue', value: 847500, change: 12.5, changeType: 'increase', prefix: '₹' },
        { label: 'Net Revenue', value: 789200, change: 10.2, changeType: 'increase', prefix: '₹' },
        { label: 'Total Refunds', value: 32500, change: 5.3, changeType: 'decrease', prefix: '₹' },
        { label: 'Processing Fees', value: 25800, change: 8.1, changeType: 'increase', prefix: '₹' },
        { label: 'Avg Order Value', value: 4297, change: 3.2, changeType: 'increase', prefix: '₹' },
        { label: 'Refund Rate', value: 3.8, change: 0.5, changeType: 'decrease', prefix: '' },
      ])

      setRevenueByGateway([
        { gateway: 'Razorpay', amount: 523400, percentage: 62 },
        { gateway: 'PayU', amount: 168500, percentage: 20 },
        { gateway: 'COD', amount: 126800, percentage: 15 },
        { gateway: 'Bank Transfer', amount: 28800, percentage: 3 },
      ])

      setRevenueByDay([
        { date: 'Mon', revenue: 125000, orders: 29 },
        { date: 'Tue', revenue: 98000, orders: 23 },
        { date: 'Wed', revenue: 142000, orders: 33 },
        { date: 'Thu', revenue: 115000, orders: 27 },
        { date: 'Fri', revenue: 167000, orders: 39 },
        { date: 'Sat', revenue: 112000, orders: 26 },
        { date: 'Sun', revenue: 88500, orders: 20 },
      ])

      setTransactions([
        { id: 'TXN001', type: 'sale', description: 'Order #ORD-2024-001', amount: 4297, status: 'completed', date: '2024-01-03T10:30:00Z', orderId: 'ORD-2024-001', gateway: 'Razorpay' },
        { id: 'TXN002', type: 'sale', description: 'Order #ORD-2024-002', amount: 2999, status: 'completed', date: '2024-01-03T09:15:00Z', orderId: 'ORD-2024-002', gateway: 'PayU' },
        { id: 'TXN003', type: 'refund', description: 'Refund for #ORD-2024-003', amount: -1500, status: 'completed', date: '2024-01-03T08:00:00Z', orderId: 'ORD-2024-003', gateway: 'Razorpay' },
        { id: 'TXN004', type: 'fee', description: 'Razorpay Processing Fee', amount: -86, status: 'completed', date: '2024-01-03T10:30:00Z', gateway: 'Razorpay' },
        { id: 'TXN005', type: 'payout', description: 'Bank Settlement', amount: -150000, status: 'pending', date: '2024-01-04T00:00:00Z' },
        { id: 'TXN006', type: 'sale', description: 'Order #ORD-2024-004', amount: 8499, status: 'completed', date: '2024-01-02T16:45:00Z', orderId: 'ORD-2024-004', gateway: 'COD' },
      ])

      setLoading(false)
    }, 300)
  }, [dateRange])

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'sale': return <ArrowUpRight className="h-4 w-4 text-green-500" />
      case 'refund': return <ArrowDownRight className="h-4 w-4 text-red-500" />
      case 'payout': return <Building className="h-4 w-4 text-blue-500" />
      case 'fee': return <Percent className="h-4 w-4 text-orange-500" />
      default: return <DollarSign className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle className="h-3 w-3" /> Completed</span>
      case 'pending': return <span className="flex items-center gap-1 text-xs text-yellow-600"><Clock className="h-3 w-3" /> Pending</span>
      case 'failed': return <span className="flex items-center gap-1 text-xs text-red-600"><XCircle className="h-3 w-3" /> Failed</span>
      default: return null
    }
  }

  const maxRevenue = Math.max(...revenueByDay.map(d => d.revenue))

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Finance & Reports</h1>
          <p className="text-neutral-500">Track revenue, payouts, and financial health</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-xl border border-neutral-200 px-4 py-2 text-sm outline-none dark:border-neutral-700 dark:bg-neutral-800"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="flex items-center gap-2 rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-700">
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
        {(['overview', 'transactions', 'payouts', 'taxes'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all ${
              activeTab === tab
                ? 'bg-white text-neutral-900 shadow dark:bg-neutral-700 dark:text-white'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-2xl bg-white p-4 shadow-sm dark:bg-neutral-800"
              >
                <p className="text-sm text-neutral-500">{metric.label}</p>
                <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
                  {metric.prefix}{metric.label.includes('Rate') ? `${metric.value}%` : metric.value.toLocaleString()}
                </p>
                <div className={`mt-1 flex items-center gap-1 text-xs ${
                  metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.changeType === 'increase' ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {metric.change}% vs last period
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Revenue Chart */}
            <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-800 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-neutral-900 dark:text-white">Revenue Trend</h3>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#1B198F]" /> Revenue</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" /> Orders</span>
                </div>
              </div>
              <div className="flex h-64 items-end gap-2">
                {revenueByDay.map((day) => (
                  <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                    <div className="relative w-full">
                      <div
                        className="w-full rounded-t-lg bg-[#1B198F] transition-all hover:bg-[#1B198F]/80"
                        style={{ height: `${(day.revenue / maxRevenue) * 200}px` }}
                      />
                    </div>
                    <span className="text-xs text-neutral-500">{day.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue by Gateway */}
            <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-800">
              <h3 className="mb-4 font-semibold text-neutral-900 dark:text-white">Revenue by Gateway</h3>
              <div className="space-y-4">
                {revenueByGateway.map((item) => (
                  <div key={item.gateway}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium">{item.gateway}</span>
                      <span className="text-neutral-500">₹{item.amount.toLocaleString()}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-700">
                      <div
                        className="h-full rounded-full bg-[#1B198F]"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-neutral-500">{item.percentage}% of total</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Today's Revenue</p>
                  <p className="mt-1 text-3xl font-bold">₹24,500</p>
                </div>
                <IndianRupee className="h-10 w-10 opacity-50" />
              </div>
              <p className="mt-2 text-sm text-green-100">+18% from yesterday</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Pending Payouts</p>
                  <p className="mt-1 text-3xl font-bold">₹1,50,000</p>
                </div>
                <Building className="h-10 w-10 opacity-50" />
              </div>
              <p className="mt-2 text-sm text-blue-100">Next payout in 2 days</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">COD Pending</p>
                  <p className="mt-1 text-3xl font-bold">₹45,800</p>
                </div>
                <Banknote className="h-10 w-10 opacity-50" />
              </div>
              <p className="mt-2 text-sm text-purple-100">12 orders awaiting delivery</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Processing Fees</p>
                  <p className="mt-1 text-3xl font-bold">2.1%</p>
                </div>
                <Percent className="h-10 w-10 opacity-50" />
              </div>
              <p className="mt-2 text-sm text-orange-100">Avg fee rate this month</p>
            </div>
          </div>
        </>
      )}

      {activeTab === 'transactions' && (
        <div className="rounded-2xl bg-white shadow-sm dark:bg-neutral-800">
          <div className="border-b border-neutral-200 p-4 dark:border-neutral-700">
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Search transactions..."
                className="flex-1 rounded-xl border border-neutral-200 px-4 py-2 text-sm outline-none dark:border-neutral-700 dark:bg-neutral-900"
              />
              <select className="rounded-xl border border-neutral-200 px-4 py-2 text-sm outline-none dark:border-neutral-700 dark:bg-neutral-900">
                <option value="all">All Types</option>
                <option value="sale">Sales</option>
                <option value="refund">Refunds</option>
                <option value="payout">Payouts</option>
                <option value="fee">Fees</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-neutral-500">Transaction</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-neutral-500">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-neutral-500">Gateway</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-neutral-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-neutral-500">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-neutral-500">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-700">
                          {getTransactionIcon(txn.type)}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-white">{txn.description}</p>
                          <p className="text-xs text-neutral-500">{txn.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium capitalize dark:bg-neutral-700">
                        {txn.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-500">{txn.gateway || '-'}</td>
                    <td className="px-4 py-3">{getStatusBadge(txn.status)}</td>
                    <td className="px-4 py-3 text-sm text-neutral-500">
                      {new Date(txn.date).toLocaleDateString()}
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold ${
                      txn.amount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {txn.amount >= 0 ? '+' : ''}₹{Math.abs(txn.amount).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'payouts' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-800">
              <p className="text-sm text-neutral-500">Available for Payout</p>
              <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">₹2,45,800</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-800">
              <p className="text-sm text-neutral-500">Pending Settlement</p>
              <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">₹1,50,000</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-800">
              <p className="text-sm text-neutral-500">Last Payout</p>
              <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">₹3,20,000</p>
              <p className="text-xs text-neutral-500">Jan 1, 2024</p>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-800">
            <h3 className="mb-4 font-semibold">Payout Schedule</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Next Scheduled Payout</p>
                    <p className="text-sm text-neutral-500">January 5, 2024</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-blue-600">₹1,50,000</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'taxes' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-800">
              <p className="text-sm text-neutral-500">GST Collected (This Month)</p>
              <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">₹1,52,550</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-800">
              <p className="text-sm text-neutral-500">Input Tax Credit</p>
              <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">₹45,200</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-800">
              <p className="text-sm text-neutral-500">Net GST Payable</p>
              <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">₹1,07,350</p>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Tax Reports</h3>
              <button className="flex items-center gap-2 rounded-xl bg-[#1B198F] px-4 py-2 text-sm font-medium text-white">
                <FileText className="h-4 w-4" /> Generate GSTR-1
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-xl border border-neutral-200 p-3 dark:border-neutral-700">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-neutral-400" />
                  <div>
                    <p className="font-medium">GSTR-1 December 2023</p>
                    <p className="text-xs text-neutral-500">Generated on Jan 2, 2024</p>
                  </div>
                </div>
                <button className="text-[#1B198F] hover:underline">Download</button>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-neutral-200 p-3 dark:border-neutral-700">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-neutral-400" />
                  <div>
                    <p className="font-medium">GSTR-1 November 2023</p>
                    <p className="text-xs text-neutral-500">Generated on Dec 2, 2023</p>
                  </div>
                </div>
                <button className="text-[#1B198F] hover:underline">Download</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
