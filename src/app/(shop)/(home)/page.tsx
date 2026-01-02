import MegaHeader from '@/components/Header/MegaHeader'
import Footer from '@/components/Footer'
import {
  HeroSection,
  MarqueeBanner,
  CategoryShowcase,
  FeaturedProducts,
  WhyGibbon,
  VideoReels,
  Testimonials,
  Newsletter,
  FAQ,
  PromoBanners,
  InstagramFeed,
} from '@/components/homepage'
import connectDb from '@/lib/mongodb'
import Product from '@/models/product.model'

async function getProducts() {
  try {
    await connectDb()
    const products = await Product.find({ isDeleted: false, published: true })
      .sort({ createdAt: -1 })
      .limit(12)
      .lean()
    return products.map((product: any) => ({
      ...product,
      _id: product._id.toString(),
    }))
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export default async function PageHome() {
  const products = await getProducts()

  return (
    <div className="nc-PageHome relative">
      <MegaHeader />
      <HeroSection />
      <MarqueeBanner />
      <CategoryShowcase />
      <FeaturedProducts products={products} title="Bestsellers" subtitle="Our most loved products by the Gibbon community" />
      <PromoBanners />
      <WhyGibbon />
      <VideoReels />
      <FeaturedProducts products={products.slice(0, 8)} title="New Arrivals" subtitle="Fresh drops to elevate your fitness game" className="bg-neutral-50 dark:bg-neutral-950" />
      <Testimonials />
      <Newsletter />
      <FAQ />
      <InstagramFeed />
      <Footer />
    </div>
  )
}
