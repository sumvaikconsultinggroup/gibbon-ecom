import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us | Gibbon Nutrition',
  description: 'Get in touch with Gibbon Nutrition. Contact us for product inquiries, order support, or partnership opportunities.',
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
