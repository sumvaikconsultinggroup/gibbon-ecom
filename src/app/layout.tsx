import Aside from '@/components/aside'
import { AppProvider } from '@/context/AppContext'
import { UserAuthProvider } from '@/context/UserAuthContext'
import '@/styles/tailwind.css'
import { Metadata, Viewport } from 'next'
import { Antonio, Poppins, Roboto } from 'next/font/google'
import GlobalClient from './GlobalClient'
import PremiumCartDrawer from '@/components/PremiumCartDrawer'
import AsideSidebarNavigation from '@/components/aside-sidebar-navigation'
import AsideProductQuickView from '@/components/aside-product-quickview'
import LiveTracker from '@/components/LiveTracker'
import { TrackerProvider } from '@/components/TrackerProvider'
import { Suspense } from 'react'
import { siteConfig, generateOrganizationSchema, generateWebsiteSchema, generateLocalBusinessSchema } from '@/lib/seo'

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

const antonio = Antonio({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-family-antonio',
})

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
})

// Comprehensive SEO Metadata
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    template: '%s | Gibbon Nutrition',
    default: 'Gibbon Nutrition - Premium Fitness Supplements | Whey Protein, Pre-Workout, BCAA',
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: 'Gibbon Nutrition', url: siteConfig.url }],
  creator: siteConfig.creator,
  publisher: 'Gibbon Nutrition',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: 'Gibbon Nutrition - Premium Fitness Supplements',
    description: siteConfig.description,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Gibbon Nutrition - Premium Fitness Supplements',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gibbon Nutrition - Premium Fitness Supplements',
    description: siteConfig.description,
    images: ['/og-image.jpg'],
    creator: '@gibbonnutrition',
    site: '@gibbonnutrition',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  category: 'ecommerce',
  classification: 'Health & Fitness Supplements',
  verification: {
    google: 'your-google-verification-code',
  },
  other: {
    'fb:app_id': '',
    'p:domain_verify': '',
  },
}

// Viewport Configuration
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1B198F' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Generate JSON-LD schemas
  const organizationSchema = generateOrganizationSchema()
  const websiteSchema = generateWebsiteSchema()
  const localBusinessSchema = generateLocalBusinessSchema()

  return (
    <html lang="en" className={`${poppins.className} ${antonio.variable} ${roboto.variable}`}>
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://cdn.shopify.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://cdn.shopify.com" />
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body className="text-neutral-900 dark:bg-neutral-900 dark:text-neutral-200">
        <UserAuthProvider>
          <AppProvider>
            <TrackerProvider>
              <Aside.Provider>
                {children}

                {/* Global Aside Components */}
                <PremiumCartDrawer />
                <AsideSidebarNavigation />
                <AsideProductQuickView />

                {/* Live Analytics Tracker */}
                <Suspense fallback={null}>
                  <LiveTracker />
                </Suspense>

                {/* Client component: Toaster, ... */}
                <GlobalClient />
              </Aside.Provider>
            </TrackerProvider>
          </AppProvider>
        </UserAuthProvider>
      </body>
    </html>
  )
}
