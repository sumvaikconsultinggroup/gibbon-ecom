import Header from '@/components/Header/Header'
import TopBanner from '@/components/Header/TopBanner'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gibbon Nutrition - Premium Fitness Supplements | Whey Protein, Pre-Workout, BCAAs',
  description:
    'Fuel your fitness journey with Gibbon Nutrition. Lab-tested, FSSAI certified supplements including Whey Protein, Pre-Workout, Mass Gainers, BCAAs & more. Free shipping on orders above ₹999.',
  keywords: [
    'Gibbon Nutrition',
    'Whey Protein',
    'Pre-Workout',
    'Mass Gainer',
    'BCAA',
    'Fitness Supplements',
    'Bodybuilding',
    'Gym Supplements',
    'Protein Powder India',
    'Best Whey Protein',
  ],
  openGraph: {
    title: 'Gibbon Nutrition - Premium Fitness Supplements',
    description: 'Lab-tested, FSSAI certified fitness supplements. Whey Protein, Pre-Workout, Mass Gainers & more.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Gibbon Nutrition',
  },
}

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {/* Top Banner - Announcement */}
      <TopBanner />
      
      {/* Header */}
      <Header hasBorderBottom={false} />
      
      {/* Main Content */}
      <main>{children}</main>
    </div>
  )
}
