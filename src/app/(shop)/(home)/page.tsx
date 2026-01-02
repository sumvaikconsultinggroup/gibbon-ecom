// This is a Server Component (no 'use client')
import { FitnessCategories } from '@/components/Fitness-Categories'
import ProductCarouselSection from '@/components/ProductSlider/ProductSlider'
import RunningBanner from '@/components/RuningBanner'
import SectionGridFeatureItems from '@/components/SectionGridFeatureItems'
import SectionHero2 from '@/components/SectionHero/SectionHero2'
import SectionSliderProductCard from '@/components/SectionSliderProductCard'
import TestimonialSwipper from '@/components/TestimonialSwipper'
import { VideoProductsSection } from '@/components/reelsSection/ReelsSection'
import { getBlogPosts, getCollections, getGroupCollections, getProducts } from '@/data/data'
import { currentUser } from '@clerk/nextjs/server'
// import {SuperAdvantage} from '@/components/SuperAdvantage'

import FaqSocialSection from '@/components/FaqsSection/FaqsSection'

// export const metadata: Metadata = {
//   title: 'Home',
//   description:
//     'Ciseco is a modern and elegant template for Next.js, Tailwind CSS, and TypeScript. It is designed to be simple and easy to use, with a focus on performance and accessibility.',
//   keywords: ['Next.js', 'Tailwind CSS', 'TypeScript', 'Ciseco', 'Headless UI', 'Fashion', 'E-commerce'],
// }

// Server-side fetch function
async function getCarouselProducts1() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    const res = await fetch(`${baseUrl}/api/products?limit=7`)

    if (!res.ok) {
      throw new Error('Failed to fetch products')
    }

    return await res.json()
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

async function getCarouselProducts2() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    const res = await fetch(`${baseUrl}/api/products?rangeStart=8&rangeEnd=12`, {
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      throw new Error('Failed to fetch products')
    }

    return await res.json()
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

async function getCarouselProducts3() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    const res = await fetch(`${baseUrl}/api/products?rangeStart=13&rangeEnd=17`, {
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      throw new Error('Failed to fetch products')
    }

    return await res.json()
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

async function PageHome() {
  // Fetch all data in parallel
  const [
    allCollections,
    groupCollections,
    products,
    blogPosts,
    carouselProducts1,
    carouselProducts2,
    carouselProducts3,
  ] = await Promise.all([
    getCollections(),
    getGroupCollections(),
    getProducts(),
    getBlogPosts(),
    getCarouselProducts1(),
    getCarouselProducts2(),
    getCarouselProducts3(),
  ])

  const user = await currentUser()
  // console.log('user', user)

  const departmentCollections = allCollections.slice(11, 15)
  const featuredCollections = allCollections.slice(7, 11)

  return (
    <div className="nc-PageHome relative overflow-hidden">
      <SectionHero2 />

      <div className="relative flex flex-col">
        <ProductCarouselSection className="bg-[#f5f5f5] py-24" />
        {/* <RunningBanner /> */}
        <FitnessCategories className="mx-auto max-w-7xl px-4 pt-12" />

        <div className="relative flex flex-col">
          <SectionSliderProductCard className="pt-12 md:mx-auto md:max-w-7xl md:px-4" data={carouselProducts1.data} />
          <VideoProductsSection className="pt-12" />
          {/* <SectionPromo1 /> */}
          {/* <SuperAdvantage /> */}

          {/* <SectionPromo2 /> */}
          {/* <SectionSliderLargeProduct className='max-w-7xl mx-auto py-12 px-4' products={carouselProducts3.data} /> */}
          <SectionGridFeatureItems className="mx-auto w-full max-w-7xl px-4 md:pt-12" />
          {/* <SectionCollectionSlider2 collections={departmentCollections} /> */}

          <RunningBanner className={''} />
          <TestimonialSwipper />
          {/* <SectionClientSay /> */}
          <FaqSocialSection />
        </div>
      </div>
    </div>
  )
}

export default PageHome
