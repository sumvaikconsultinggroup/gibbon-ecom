import BackgroundSection from '@/components/BackgroundSection/BackgroundSection'
import { Divider } from '@/components/Divider'
import Heading from '@/components/Heading/Heading'
import SectionCollectionSlider from '@/components/SectionCollectionSlider'
import SectionGridFeatureItems from '@/components/SectionGridFeatureItems'
import SectionGridMoreExplore from '@/components/SectionGridMoreExplore/SectionGridMoreExplore'
import SectionHero3 from '@/components/SectionHero/SectionHero3'
import {StrengthAdvantage} from '@/components/SectionHowItWork/SectionHowItWork'
import SectionPromo1 from '@/components/SectionPromo1'
import SectionPromo3 from '@/components/SectionPromo3'
import SectionSliderLargeProduct from '@/components/SectionSliderLargeProduct'
import SectionSliderProductCard from '@/components/SectionSliderProductCard'
import SectionMagazine5 from '@/components/blog/SectionMagazine5'
import { getBlogPosts } from '@/data/data'
import { getProductsFromDB, getCollectionsFromDB, getGroupCollectionsFromDB } from '@/data/dbData'
import ButtonSecondary from '@/shared/Button/ButtonSecondary'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Gibbon Nutrition | Premium Sports Nutrition',
  description:
    'Gibbon Nutrition offers premium sports nutrition supplements including protein powders, pre-workout, vitamins, and fitness accessories. Shop now for quality supplements.',
  keywords: ['Sports Nutrition', 'Protein', 'Supplements', 'Gibbon Nutrition', 'Fitness', 'Pre-Workout', 'E-commerce'],
}

async function PageHome2() {
  // Fetch data from database
  const [allCollections, products, groupCollections, blogPosts] = await Promise.all([
    getCollectionsFromDB({ includeProducts: true, limit: 20 }),
    getProductsFromDB({ limit: 20, sortBy: 'newest' }),
    getGroupCollectionsFromDB(),
    getBlogPosts(),
  ])
  
  const featuredCollections = allCollections.filter((c: any) => c.handle !== 'best-sellers').slice(0, 4)
  const carouselProducts1 = products.slice(0, 5)
  const carouselProducts2 = products.slice(0, 10)
  const carouselProducts3 = products.slice(0, 6)

  return (
    <div className="nc-PageHome2 relative">
      <div className="container">
        <SectionHero3 />
      </div>

      <div className="relative container my-24 flex flex-col gap-y-24 lg:my-36 lg:gap-y-36">
        <StrengthAdvantage />
        <SectionSliderProductCard data={carouselProducts2} subHeading="New Sports equipment" />
        <SectionPromo3 />
        <SectionSliderLargeProduct products={carouselProducts3} />
        <div className="relative pt-24 pb-20 lg:pt-28">
          <BackgroundSection />
          <SectionGridMoreExplore groupCollections={groupCollections} />
        </div>
      </div>

      <SectionCollectionSlider collections={featuredCollections} />

      <div className="relative container my-24 flex flex-col gap-y-24 lg:my-36 lg:gap-y-36">
        <SectionGridFeatureItems  />
        <Divider />
        <div>
          <Heading headingDim="From the Gibbon Blog">The latest news</Heading>
          <SectionMagazine5 posts={blogPosts} />
          <div className="mt-20 flex justify-center">
            <ButtonSecondary href="/blog">Show all blog articles</ButtonSecondary>
          </div>
        </div>
        <Divider />
        <SectionPromo1 />
      </div>
    </div>
  )
}

export default PageHome2
