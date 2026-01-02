import { SignIn } from '@clerk/nextjs'
import Image from 'next/image'

export default function PageLogin() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-[#E3F2FD] via-white to-[#BBDEFB] font-family-roboto dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 -left-20 h-72 w-72 rounded-full bg-[#3086C8]/10 blur-3xl"></div>
        <div className="absolute bottom-20 -right-20 h-96 w-96 rounded-full bg-[#1B198F]/10 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3086C8]/5 blur-3xl"></div>
      </div>

      <div className="relative container mx-auto px-4 py-12 lg:py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left Side - Branding */}
          <div className="hidden lg:block">
            <div className="space-y-8">
              {/* Logo */}
              <div className="flex justify-center lg:justify-start">
                <Image
                  src="/GibbonLogoEccom.png"
                  alt="Gibbon Nutrition Logo"
                  width={280}
                  height={84}
                  className="h-auto w-auto"
                />
              </div>

              {/* Hero Text */}
              <div className="space-y-4">
                <h1 className="font-family-antonio text-5xl font-black uppercase tracking-tight text-[#1B198F] lg:text-6xl">
                  Welcome Back
                </h1>
                <p className="text-xl font-medium text-neutral-700 dark:text-neutral-300">
                  Sign in to continue your fitness journey with premium supplements and nutrition.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4 pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1B198F]">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-family-antonio text-lg font-bold text-[#1B198F]">
                      LAB TESTED PRODUCTS
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      All our products are third-party lab tested for quality and authenticity.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#3086C8]">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-family-antonio text-lg font-bold text-[#3086C8]">
                      FAST & SECURE DELIVERY
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      Quick shipping with real-time tracking on all orders.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1B198F]">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-family-antonio text-lg font-bold text-[#1B198F]">
                      INFORMED CHOICE CERTIFIED
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      Trusted by athletes worldwide for banned substance testing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Sign In Form */}
          <div className="w-full">
            {/* Mobile Logo & Heading */}
            <div className="mb-8 text-center lg:hidden">
              <div className="mb-6 flex justify-center">
                <Image
                  src="/GibbonLogoEccom.png"
                  alt="Gibbon Nutrition Logo"
                  width={200}
                  height={60}
                  className="h-auto w-auto"
                />
              </div>
              <h1 className="font-family-antonio text-4xl font-black uppercase text-[#1B198F]">
                Welcome Back
              </h1>
              <p className="mt-2 text-base text-neutral-600 dark:text-neutral-400">
                Sign in to continue shopping
              </p>
            </div>

            {/* Sign In Card */}
            <div className="mt-24 flex justify-center">
                <SignIn
                  forceRedirectUrl="/"
                  appearance={{
                    elements: {
                      // Main card
                      card: 'shadow-none bg-transparent',

                      // Header
                      headerTitle: 'text-2xl font-black text-[#1B198F] font-family-antonio uppercase tracking-tight',
                      headerSubtitle: 'text-neutral-600 dark:text-neutral-400 font-medium',

                      // Form fields
                      formFieldInput:
                        'border-2 border-neutral-300 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-[#3086C8] focus:border-[#3086C8] transition-all duration-200 dark:border-neutral-600 dark:bg-neutral-700/50 dark:text-white dark:focus:border-[#3086C8]',
                      formFieldLabel: 'text-neutral-700 font-semibold text-sm uppercase tracking-wide dark:text-neutral-300 font-family-antonio',

                      // Primary button (Sign in)
                      formButtonPrimary:
                        'bg-[#1B198F] hover:bg-[#3086C8] text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] font-family-antonio text-base uppercase tracking-wide',

                      // Social buttons
                      socialButtonsBlockButton:
                        'border-2 border-neutral-300 hover:border-[#3086C8] hover:bg-[#3086C8]/5 rounded-xl py-3 transition-all duration-200 dark:border-neutral-600 dark:hover:bg-neutral-700 font-medium',
                      socialButtonsBlockButtonText: 'font-semibold text-neutral-700 dark:text-neutral-300',

                      // Links
                      footerActionLink:
                        'text-[#1B198F] hover:text-[#3086C8] font-bold hover:underline transition-colors duration-200 dark:text-[#3086C8] dark:hover:text-[#1B198F]',

                      // Divider
                      dividerLine: 'bg-neutral-300 dark:bg-neutral-600',
                      dividerText: 'text-neutral-500 dark:text-neutral-400 uppercase tracking-wide text-xs font-semibold',

                      // Footer
                      footerActionText: 'text-neutral-600 dark:text-neutral-400',

                      // Other elements
                      formFieldInputShowPasswordButton: 'text-neutral-500 hover:text-[#1B198F]',
                      identityPreviewText: 'text-neutral-700 dark:text-neutral-300 font-medium',
                      identityPreviewEditButton: 'text-[#1B198F] hover:text-[#3086C8]',
                    },
                  }}
                />
            </div>

            {/* Additional Info */}
            <div className="mt-6 text-center">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                By signing in, you agree to our{' '}
                <a href="/terms" className="font-bold text-[#1B198F] hover:text-[#3086C8] hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="font-bold text-[#1B198F] hover:text-[#3086C8] hover:underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
