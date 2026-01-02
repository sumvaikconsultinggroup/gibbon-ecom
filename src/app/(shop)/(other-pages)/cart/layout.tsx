import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shopping Cart | Gibbon Nutrition',
}

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
