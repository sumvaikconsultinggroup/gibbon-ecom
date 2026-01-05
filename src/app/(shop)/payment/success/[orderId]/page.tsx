'use client'

import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CheckCircle, Package, Truck, ArrowRight, Home, ShoppingBag } from 'lucide-react'

export default function PaymentSuccessPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const orderId = params.orderId as string
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // Try to fetch order details
        const response = await fetch(`/api/orders/${orderId}`)
        if (response.ok) {
          const data = await response.json()
          setOrderDetails(data.order)
        }
      } catch (error) {
        console.error('Failed to fetch order details:', error)
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrderDetails()
    } else {
      setLoading(false)
    }
  }, [orderId])

  return (
    <main className="container min-h-screen py-16 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        {/* Success Icon */}
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-12 w-12 text-green-600" strokeWidth={2} />
        </div>

        {/* Success Message */}
        <h1 className="mb-4 text-3xl font-bold text-neutral-900 dark:text-white lg:text-4xl">
          Payment Successful!
        </h1>
        <p className="mb-8 text-lg text-neutral-600 dark:text-neutral-400">
          Thank you for your order. Your payment has been processed successfully.
        </p>

        {/* Order Info Card */}
        <div className="mb-8 rounded-2xl border border-neutral-200 bg-white p-6 text-left shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-500">Order ID</span>
            <span className="font-mono text-sm font-semibold text-neutral-900 dark:text-white">
              {orderId || 'Processing...'}
            </span>
          </div>
          
          {orderDetails && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-500">Order Number</span>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {orderDetails.orderNumber}
                </span>
              </div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-500">Total Amount</span>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  ₹{orderDetails.totalAmount?.toLocaleString()}
                </span>
              </div>
            </>
          )}

          <div className="flex items-center justify-between border-t border-neutral-200 pt-4 dark:border-neutral-700">
            <span className="text-sm font-medium text-neutral-500">Status</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
              <CheckCircle className="h-4 w-4" />
              Confirmed
            </span>
          </div>
        </div>

        {/* Order Timeline */}
        <div className="mb-8 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-900">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            What happens next?
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-neutral-900 dark:text-white">Order Confirmed</p>
                <p className="text-sm text-neutral-500">Your order has been received</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700">
                <Package className="h-5 w-5 text-neutral-500" />
              </div>
              <div className="text-left">
                <p className="font-medium text-neutral-900 dark:text-white">Processing</p>
                <p className="text-sm text-neutral-500">We're preparing your order</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700">
                <Truck className="h-5 w-5 text-neutral-500" />
              </div>
              <div className="text-left">
                <p className="font-medium text-neutral-900 dark:text-white">Out for Delivery</p>
                <p className="text-sm text-neutral-500">Your order will be delivered soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Email Notification */}
        <p className="mb-8 text-sm text-neutral-500">
          A confirmation email has been sent to your email address with order details and tracking information.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/account/orders"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B198F] px-8 py-3 font-semibold text-white transition-all hover:bg-[#1B198F]/90"
          >
            View Order Details
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-8 py-3 font-semibold text-neutral-700 transition-all hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
