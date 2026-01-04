import { Suspense } from 'react'
import { Metadata } from 'next'
import SearchPageClient from './SearchPageClient'
import { siteConfig } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Search Products - Find Supplements',
  description: 'Search for your favorite supplements at Gibbon Nutrition. Find Whey Protein, Pre-Workout, BCAA, Mass Gainers and more.',
  keywords: ['search supplements', 'find protein', 'search products', 'Gibbon Nutrition search'],
  alternates: {
    canonical: '/search',
  },
  openGraph: {
    type: 'website',
    title: 'Search Products | Gibbon Nutrition',
    description: 'Search for your favorite supplements at Gibbon Nutrition.',
    url: `${siteConfig.url}/search`,
    siteName: 'Gibbon Nutrition',
  },
  robots: {
    index: false, // Search pages typically shouldn't be indexed
    follow: true,
  },
}

function SearchPageFallback() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary-500"></div>
    </div>
  )
}

export default function PageSearch() {
  return (
    <Suspense fallback={<SearchPageFallback />}>
      <SearchPageClient />
    </Suspense>
  )
}
