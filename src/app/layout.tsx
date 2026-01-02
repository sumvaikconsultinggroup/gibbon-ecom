import Aside from '@/components/aside'
import { AppProvider } from '@/context/AppContext'
import '@/styles/tailwind.css'
import { Metadata } from 'next'
import { Antonio, Poppins, Roboto } from 'next/font/google'
import GlobalClient from './GlobalClient'
import PremiumCartDrawer from '@/components/PremiumCartDrawer'
import AsideSidebarNavigation from '@/components/aside-sidebar-navigation'
import AsideProductQuickView from '@/components/aside-product-quickview'

import { ClerkProvider } from '@clerk/nextjs'

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
export const metadata: Metadata = {
  title: {
    template: '%s | Gibbon Nutrition',
    default: 'Gibbon Nutrition - Premium Fitness Supplements',
  },
  description:
    'Fuel your fitness journey with Gibbon Nutrition. Lab-tested, FSSAI certified supplements including Whey Protein, Pre-Workout, Mass Gainers, BCAAs & more. Made in India.',
  keywords: ['Gibbon Nutrition', 'Whey Protein', 'Pre-Workout', 'BCAA', 'Mass Gainer', 'Fitness Supplements', 'Bodybuilding', 'Protein Powder India'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${poppins.className} ${antonio.variable} ${roboto.variable}`}>
        <body className="text-neutral-900 dark:bg-neutral-900 dark:text-neutral-200">
          <AppProvider>
            <Aside.Provider>
              {children}

              {/* Client component: Toaster, ... */}
              <GlobalClient />
            </Aside.Provider>
          </AppProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
