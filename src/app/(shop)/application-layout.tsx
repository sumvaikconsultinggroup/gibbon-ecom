import Footer from '@/components/Footer'
import MegaHeader from '@/components/Header/MegaHeader'
import AsideProductQuickView from '@/components/aside-product-quickview'
import AsideSidebarCart from '@/components/aside-sidebar-cart'
import AsideSidebarNavigation from '@/components/aside-sidebar-navigation'
import 'rc-slider/assets/index.css'
import React, { ReactNode } from 'react'

interface ComponentProps {
  children: ReactNode
  header?: ReactNode
  footer?: ReactNode
}

const ApplicationLayout: React.FC<ComponentProps> = ({ children, header, footer }) => {
  return (
    <div className="relative min-h-screen">
      {header ? header : <MegaHeader />}
      <main>{children}</main>
      {footer ? footer : <Footer />}

      {/* ASIDES */}
      <AsideSidebarNavigation />
      <AsideSidebarCart />
      <AsideProductQuickView />
    </div>
  )
}

export { ApplicationLayout }