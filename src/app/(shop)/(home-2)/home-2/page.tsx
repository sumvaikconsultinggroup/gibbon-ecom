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
import DynamicHomepage from './DynamicHomepage'
import connectDb from '@/lib/mongodb'
import HomeBanner from '@/models/HomeBanner'
import HomeSection from '@/models/HomeSection'
import Product from '@/models/Product'

export const dynamic = 'force-dynamic'
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Gibbon Nutrition | Premium Sports Nutrition',
  description:
    'Gibbon Nutrition offers premium sports nutrition supplements including protein powders, pre-workout, vitamins, and fitness accessories. Shop now for quality supplements.',
  keywords: ['Sports Nutrition', 'Protein', 'Supplements', 'Gibbon Nutrition', 'Fitness', 'Pre-Workout', 'E-commerce'],
}

async function getHomepageContent() {
  try {
    await connectDb()
    const now = new Date()
    
    // Fetch active banners
    const banners = await HomeBanner.find({
      isActive: true,
      $or: [
        { startDate: { $exists: false } },
        { startDate: null },
        { startDate: { $lte: now } }
      ]
    })
      .sort({ order: 1 })
      .lean()
    
    // Filter out expired banners
    const activeBanners = banners.filter((b: any) => {
      if (!b.endDate) return true
      return new Date(b.endDate) >= now
    })
    
    // Fetch active sections
    const sections = await HomeSection.find({
      isActive: true,
      $or: [
        { startDate: { $exists: false } },
        { startDate: null },
        { startDate: { $lte: now } }
      ]
    })
      .sort({ order: 1 })
      .lean()
    
    // Filter out expired sections
    const activeSections = sections.filter((s: any) => {
      if (!s.endDate) return true
      return new Date(s.endDate) >= now
    })
    
    // Fetch products for each section based on productSource
    const sectionsWithProducts = await Promise.all(
      activeSections.map(async (section: any) => {
        let products: any[] = []
        const limit = section.productLimit || 8
        
        switch (section.productSource) {
          case 'bestseller':
            products = await Product.find({ tags: { $in: ['bestseller', 'best-seller', 'best seller'] } })
              .limit(limit)
              .lean()
            break
          case 'new':
            products = await Product.find({ tags: { $in: ['new', 'new-arrival', 'new arrival'] } })
              .sort({ createdAt: -1 })
              .limit(limit)
              .lean()
            // Fallback to newest products if no tagged products
            if (products.length === 0) {
              products = await Product.find()
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean()
            }
            break
          case 'sale':
            products = await Product.find({ tags: { $in: ['sale', 'on-sale', 'discount'] } })
              .limit(limit)
              .lean()
            break
          case 'tag':
            if (section.productTag) {
              products = await Product.find({ tags: section.productTag })
                .limit(limit)
                .lean()
            }
            break
          case 'manual':
            if (section.products && section.products.length > 0) {
              products = await Product.find({ _id: { $in: section.products } })
                .limit(limit)
                .lean()
            }
            break
          default:
            // Default: fetch newest products
            products = await Product.find()
              .sort({ createdAt: -1 })
              .limit(limit)
              .lean()
        }
        
        return {
          ...section,
          _id: section._id.toString(),
          products: products.map((p: any) => ({
            _id: p._id.toString(),
            title: p.title,
            handle: p.handle,
            images: p.images,
            variants: p.variants,
            tags: p.tags,
            price: p.variants?.[0]?.price,
            compareAtPrice: p.variants?.[0]?.compareAtPrice
          }))
        }
      })
    )
    
    return {
      banners: activeBanners.map((b: any) => ({ ...b, _id: b._id.toString() })),
      sections: sectionsWithProducts
    }
  } catch (error) {
    console.error('Error fetching homepage content:', error)
    return { banners: [], sections: [] }
  }
}

async function PageHome2() {
  // Fetch CMS homepage content
  const homepageContent = await getHomepageContent()
  const hasDynamicContent = homepageContent.banners.length > 0 || homepageContent.sections.length > 0
  
  // Fetch fallback data from database
  const [allCollections, products, groupCollections, blogPosts] = await Promise.all([
    getCollectionsFromDB({ includeProducts: true, limit: 20 }),
    getProductsFromDB({ limit: 20, sortBy: 'newest' }),
    getGroupCollectionsFromDB(),
    getBlogPosts(),
  ])
  
  const featuredCollections = allCollections.filter((c: any) => c.handle !== 'best-sellers').slice(0, 4)
  const carouselProducts2 = products.slice(0, 10)
  const carouselProducts3 = products.slice(0, 6)

  // If there's CMS-managed content, use the dynamic homepage
  if (hasDynamicContent) {
    return (
      <DynamicHomepage 
        banners={homepageContent.banners}
        sections={homepageContent.sections}
        fallbackData={{
          featuredCollections,
          products: carouselProducts2,
          groupCollections,
          blogPosts
        }}
      />
    )
  }

  // Fallback to static homepage when no CMS content
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
