import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Wishlist | Gibbon Nutrition',
}

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
