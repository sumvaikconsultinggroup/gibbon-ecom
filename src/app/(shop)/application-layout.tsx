import Footer from '@/components/Footer'
import MegaHeader from '@/components/Header/MegaHeader'
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
    </div>
  )
}

export { ApplicationLayout }