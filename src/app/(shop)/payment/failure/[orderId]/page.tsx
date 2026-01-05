'use client'

import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { XCircle, RefreshCw, ArrowLeft, HelpCircle, Home } from 'lucide-react'

export default function PaymentFailurePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const orderId = params.orderId as string
  const errorMessage = searchParams.get('error') || 'Payment could not be completed'

  const getErrorDescription = (error: string) => {
    switch (error) {
      case 'config':
        return 'Payment configuration error. Please contact support.'
      case 'not_found':
        return 'Order not found. Please try again or contact support.'
      case 'invalid_method':
        return 'Invalid payment method. Please try again.'
      case 'server_error':
        return 'Server error occurred. Please try again later.'
      default:
        return decodeURIComponent(error)
    }
  }

  return (
    <main className="container min-h-screen py-16 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        {/* Failure Icon */}
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
          <XCircle className="h-12 w-12 text-red-600" strokeWidth={2} />
        </div>

        {/* Failure Message */}
        <h1 className="mb-4 text-3xl font-bold text-neutral-900 dark:text-white lg:text-4xl">
          Payment Failed
        </h1>
        <p className="mb-4 text-lg text-neutral-600 dark:text-neutral-400">
          Unfortunately, your payment could not be processed.
        </p>

        {/* Error Details Card */}
        <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-left dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-start gap-3">
            <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            <div>
              <p className="font-medium text-red-800 dark:text-red-200">
                Error Details
              </p>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {getErrorDescription(errorMessage)}
              </p>
              {orderId && orderId !== 'unknown' && (
                <p className="mt-2 font-mono text-xs text-red-600 dark:text-red-400">
                  Reference: {orderId}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* What to do next */}
        <div className="mb-8 rounded-2xl border border-neutral-200 bg-white p-6 text-left dark:border-neutral-700 dark:bg-neutral-800">
          <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
            What can you do?
          </h3>
          <ul className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
            <li className="flex items-start gap-3">
              <RefreshCw className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1B198F]" />
              <span>Try the payment again - sometimes temporary issues can be resolved by retrying</span>
            </li>
            <li className="flex items-start gap-3">
              <HelpCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1B198F]" />
              <span>Check if your card/bank has sufficient balance and is enabled for online transactions</span>
            </li>
            <li className="flex items-start gap-3">
              <HelpCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1B198F]" />
              <span>Try a different payment method (UPI, NetBanking, or a different card)</span>
            </li>
          </ul>
        </div>

        {/* Important Note */}
        <div className="mb-8 rounded-xl bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
          <strong>Note:</strong> If any amount was deducted from your account, it will be automatically refunded within 5-7 business days.
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/checkout"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B198F] px-8 py-3 font-semibold text-white transition-all hover:bg-[#1B198F]/90"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-8 py-3 font-semibold text-neutral-700 transition-all hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        {/* Contact Support */}
        <p className="mt-8 text-sm text-neutral-500">
          Need help? Contact our support team at{' '}
          <a href="mailto:support@gibbonnutrition.com" className="text-[#1B198F] hover:underline">
            support@gibbonnutrition.com
          </a>
        </p>
      </div>
    </main>
  )
}
