import { Divider } from '@/components/Divider'
import Footer from '@/components/Footer'
import Header from '@/components/Header/Header'
import AsideProductQuickView from '@/components/aside-product-quickview'
import AsideSidebarCart from '@/components/aside-sidebar-cart'
import AsideSidebarNavigation from '@/components/aside-sidebar-navigation'
import React, { FC } from 'react'
import PageTab from './PageTab'

interface Props {
  children?: React.ReactNode
}

const Layout: FC<Props> = ({ children }) => {
  return (
    <>
      <Header />
      
      {/* Hero Banner with Image Background */}
      <div className="relative overflow-hidden bg-[#1B198F] py-12 sm:py-16">
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
              <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span className="font-family-roboto text-sm font-semibold uppercase tracking-wider text-white">
                My Account
              </span>
            </div>
            
            <h1 className="mt-4 font-family-antonio text-4xl font-black uppercase tracking-tight text-white sm:text-5xl md:text-6xl">
              Welcome Back
            </h1>
            <p className="mx-auto mt-4 max-w-2xl font-family-roboto text-base font-medium text-white/90 sm:text-lg">
              Manage your profile, track orders, and update your preferences
            </p>
          </div>
        </div>

        {/* Wave Bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" className="dark:fill-neutral-900"/>
          </svg>
        </div>
      </div>

      <div className="container -mt-8">
        <div className="mx-auto max-w-5xl">
          {/* Navigation Tabs Card */}
          <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
            <PageTab />
          </div>

          {/* Content Area */}
          <div className="mt-8 pb-24 lg:pb-32">{children}</div>
        </div>
      </div>
      
      <Footer />

      {/* ASIDES */}
      <AsideSidebarNavigation />
      <AsideSidebarCart />
      <AsideProductQuickView />
    </>
  )
}

export default Layout
