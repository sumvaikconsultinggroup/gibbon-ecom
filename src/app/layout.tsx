import Aside from '@/components/aside'
import { AppProvider } from '@/context/AppContext'
import '@/styles/tailwind.css'
import { Metadata } from 'next'
import { Antonio, Poppins, Roboto } from 'next/font/google'
import GlobalClient from './GlobalClient'

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
    template: '%s - Ciseco',
    default: 'Ciseco',
  },
  description:
    'Ciseco is a modern and elegant template for Next.js, Tailwind CSS, and TypeScript. It is designed to be simple and easy to use, with a focus on performance and accessibility.',
  keywords: ['Next.js', 'Tailwind CSS', 'TypeScript', 'Ciseco', 'Headless UI', 'Fashion', 'E-commerce'],
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
