import FaqSocialSection from '@/components/FaqsSection/FaqsSection'
import SectionSliderLargeProduct from '@/components/SectionSliderLargeProduct'
import { SuperAdvantage } from '@/components/SuperAdvantage'
import TestimonialSwipper from '@/components/TestimonialSwipper'
import { VideoProductsSection } from '@/components/reelsSection/ReelsSection'
import { getProducts } from '@/data/data'
import { Metadata } from 'next'
import React from 'react'

// 🧩 Define local category data
const categories = [
  {
    name: 'All Items',
    handle: 'all-items',
    description: 'Explore our complete collection of fitness, nutrition, and wellness products',
  },
  {
    name: 'Health & Wellness',
    handle: 'health-and-wellness',
    description: 'Support your daily vitality with essential vitamins, minerals, and wellness formulas',
  },
  {
    name: 'Build Muscle',
    handle: 'build-muscle',
    description: 'Increase strength and muscle growth with protein, creatine, and performance supplements',
  },
  {
    name: 'Weight Management',
    handle: 'weight-management',
    description: 'Achieve your ideal physique with fat burners, lean proteins, and balanced nutrition',
  },
  {
    name: 'Pre Workout',
    handle: 'pre-workout',
    description: 'Boost your energy, focus, and endurance with pre-training power blends',
  },
  {
    name: 'Muscle Recovery',
    handle: 'muscle-recovery',
    description: 'Recover faster with amino acids, BCAAs, and post-workout recovery nutrients',
  },
]

// 🧠 Generate metadata dynamically
export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params
  const category = categories.find((cat) => cat.handle === handle)

  return {
    title: category?.name || 'All Items',
    description: category?.description || 'Explore our complete collection of fitness and nutrition products',
  }
}

const Layout = async ({ children, params }: { children: React.ReactNode; params: Promise<{ handle: string }> }) => {
  const { handle } = await params
  const category = categories.find((cat) => cat.handle === handle)

  // Default to "All Items" if handle not found
  const title = category?.name || 'All Items'
  const description = category?.description || 'Explore our complete collection of fitness and nutrition products'

  // Get products
  const products = await getProducts()

  return (
    <>
      <div className="flex flex-col gap-y-20 py-20 sm:gap-y-20 lg:gap-y-28 lg:pb-28">
        <div className="container">
          {/* HEADING */}
          <div className="max-w-3xl text-left">
            <h1 className="block font-family-antonio text-4xl font-bold tracking-wider text-[#1b198f] uppercase sm:text-[4rem]">
              {title}
            </h1>
            <p
              className="mt-6 block font-family-roboto text-base font-bold text-neutral-500 capitalize dark:text-neutral-400"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>

          {/* CONTENT */}
          <div className="mt-10">{children}</div>
        </div>
        <div className="container">
          <SectionSliderLargeProduct products={products.slice(0, 4)} />
        </div>
      </div>

      <div className="w-full">
        <div className="">
          <VideoProductsSection />
        </div>

        <SuperAdvantage lesspadding={true} restriction={true} />

        <div className="">
          <TestimonialSwipper />
        </div>

        <div className="">
          <FaqSocialSection />
        </div>
      </div>
    </>
  )
}

export default Layout
