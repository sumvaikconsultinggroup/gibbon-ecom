// This is a Server Component (no 'use client')
import Footer from '@/components/Footer'
import {
  CategoryShowcase,
  FAQ,
  FeaturedProducts,
  HeroSection,
  InstagramFeed,
  MarqueeBanner,
  Newsletter,
  PromoBanners,
  Testimonials,
  VideoReels,
  WhyGibbon,
} from '@/components/homepage'
import connectDb from '@/lib/mongodb'
import Product from '@/models/product.model'

// Fetch products from database
async function getProducts() {
  try {
    await connectDb()
    const products = await Product.find({ isDeleted: false, published: true })
      .sort({ createdAt: -1 })
      .limit(12)
      .lean()
    
    // Convert _id to string for serialization
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
      {/* Hero Section - Full Screen with Parallax */}
      <HeroSection />

      {/* Animated Marquee Banner */}
      <MarqueeBanner />

      {/* Category Showcase - Shop by Goal */}
      <CategoryShowcase />

      {/* Featured Products - Bestsellers */}
      <FeaturedProducts
        products={products}
        title="Bestsellers"
        subtitle="Our most loved products by the Gibbon community"
      />

      {/* Promotional Banners */}
      <PromoBanners />

      {/* Why Choose Gibbon */}
      <WhyGibbon />

      {/* Video Reels Section */}
      <VideoReels />

      {/* New Arrivals - Second Product Section */}
      <FeaturedProducts
        products={products.slice(0, 8)}
        title="New Arrivals"
        subtitle="Fresh drops to elevate your fitness game"
        className="bg-neutral-50 dark:bg-neutral-950"
      />

      {/* Customer Testimonials */}
      <Testimonials />

      {/* Newsletter Signup */}
      <Newsletter />

      {/* FAQ Section */}
      <FAQ />

      {/* Instagram Feed */}
      <InstagramFeed />

      {/* Footer */}
      <Footer />
    </div>
  )
}
