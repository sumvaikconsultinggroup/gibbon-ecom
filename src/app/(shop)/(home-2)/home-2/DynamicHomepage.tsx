'use client'

import { DynamicHeroBanner, DynamicSection } from '@/components/Homepage'
import BackgroundSection from '@/components/BackgroundSection/BackgroundSection'
import { Divider } from '@/components/Divider'
import Heading from '@/components/Heading/Heading'
import SectionCollectionSlider from '@/components/SectionCollectionSlider'
import SectionGridFeatureItems from '@/components/SectionGridFeatureItems'
import SectionGridMoreExplore from '@/components/SectionGridMoreExplore/SectionGridMoreExplore'
import { StrengthAdvantage } from '@/components/SectionHowItWork/SectionHowItWork'
import SectionPromo1 from '@/components/SectionPromo1'
import SectionMagazine5 from '@/components/blog/SectionMagazine5'
import ButtonSecondary from '@/shared/Button/ButtonSecondary'

interface Banner {
  _id: string
  title: string
  subtitle?: string
  description?: string
  buttonText?: string
  buttonLink?: string
  image: { desktop: string; mobile?: string; alt: string }
  overlay?: { enabled: boolean; color: string; opacity: number }
  textPosition: 'left' | 'center' | 'right'
  textColor: string
}

interface Section {
  _id: string
  name: string
  type: string
  title?: string
  subtitle?: string
  products: any[]
  productLimit: number
  layout: {
    columns: number
    columnsTablet?: number
    columnsMobile?: number
    gap?: number
    showViewAll?: boolean
    viewAllLink?: string
  }
  style: {
    backgroundColor?: string
    textColor?: string
    paddingTop?: number
    paddingBottom?: number
    fullWidth?: boolean
    darkMode?: boolean
  }
  banner?: {
    image: string
    mobileImage?: string
    alt?: string
    link?: string
    height?: number
  }
  showOnDesktop: boolean
  showOnMobile: boolean
}

interface DynamicHomepageProps {
  banners: Banner[]
  sections: Section[]
  fallbackData: {
    featuredCollections: any[]
    products: any[]
    groupCollections: any[]
    blogPosts: any[]
  }
}

export default function DynamicHomepage({ banners, sections, fallbackData }: DynamicHomepageProps) {
  const { featuredCollections, groupCollections, blogPosts } = fallbackData

  return (
    <div className="nc-PageHome2 relative">
      {/* Dynamic Hero Banner Section */}
      {banners.length > 0 && (
        <div className="container pt-2">
          <DynamicHeroBanner banners={banners} />
        </div>
      )}

      {/* Dynamic Sections */}
      {sections.length > 0 && (
        <div className="mt-12 space-y-0">
          {sections.map((section) => (
            <DynamicSection key={section._id} section={section} />
          ))}
        </div>
      )}

      {/* Static Sections (Always shown for brand consistency) */}
      <div className="relative container my-24 flex flex-col gap-y-24 lg:my-36 lg:gap-y-36">
        <StrengthAdvantage />
        
        {/* Explore Collections */}
        <div className="relative pt-24 pb-20 lg:pt-28">
          <BackgroundSection />
          <SectionGridMoreExplore groupCollections={groupCollections} />
        </div>
      </div>

      {/* Collection Slider */}
      {featuredCollections.length > 0 && (
        <SectionCollectionSlider collections={featuredCollections} />
      )}

      {/* Bottom Content Sections */}
      <div className="relative container my-24 flex flex-col gap-y-24 lg:my-36 lg:gap-y-36">
        <SectionGridFeatureItems />
        <Divider />
        
        {/* Blog Section */}
        {blogPosts.length > 0 && (
          <div>
            <Heading headingDim="From the Gibbon Blog">The latest news</Heading>
            <SectionMagazine5 posts={blogPosts} />
            <div className="mt-20 flex justify-center">
              <ButtonSecondary href="/blog">Show all blog articles</ButtonSecondary>
            </div>
          </div>
        )}
        
        <Divider />
        <SectionPromo1 />
      </div>
    </div>
  )
}
