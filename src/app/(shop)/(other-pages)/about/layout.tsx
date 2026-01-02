import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us | Gibbon Nutrition',
  description: 'Learn about Gibbon Nutrition - India\'s premium fitness supplements brand. Our mission, values, and commitment to quality.',
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
