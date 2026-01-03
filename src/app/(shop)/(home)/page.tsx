import MegaHeader from '@/components/Header/MegaHeader'
import Footer from '@/components/Footer'
import {
  HeroSection,
  MarqueeBanner,
  CategoryShowcase,
  WhyGibbon,
  Testimonials,
  Newsletter,
  FAQ,
  InstagramFeed,
} from '@/components/homepage'
import BestSellers from '@/components/homepage/BestSellers'
import NewArrivals from '@/components/homepage/NewArrivals'
import FlashDeals from '@/components/homepage/FlashDeals'
import TrendingProducts from '@/components/homepage/TrendingProducts'
import BrandPromise from '@/components/homepage/BrandPromise'
import connectDb from '@/lib/mongodb'
import Product from '@/models/product.model'

// Deep serialize MongoDB documents to avoid ObjectId issues
const deepSerialize = (obj: any) => JSON.parse(JSON.stringify(obj, (key, value) => {
  if (value && typeof value === 'object' && value._bsontype === 'ObjectId') {
    return value.toString()
  }
  if (key === '_id' && value) {
    return value.toString ? value.toString() : String(value)
  }
  return value
}))

async function getProducts() {
  try {
    await connectDb()
    const products = await Product.find({ isDeleted: false, published: true })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()
    return products.map((product: any) => deepSerialize(product))
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

async function getBestSellers() {
  try {
    await connectDb()
    const products = await Product.find({ 
      isDeleted: false, 
      published: true,
      tags: { $in: ['bestseller'] }
    })
      .sort({ 'reviews.length': -1 })
      .limit(8)
      .lean()
    return products.map((product: any) => deepSerialize(product))
  } catch (error) {
    return []
  }
}

async function getNewArrivals() {
  try {
    await connectDb()
    const products = await Product.find({ 
      isDeleted: false, 
      published: true,
      $or: [
        { tags: { $in: ['new arrival'] } },
        { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean()
    return products.map((product: any) => deepSerialize(product))
  } catch (error) {
    return []
  }
}

export default async function PageHome() {
  const [products, bestSellers, newArrivals] = await Promise.all([
    getProducts(),
    getBestSellers(),
    getNewArrivals()
  ])

  return (
    <div className="nc-PageHome relative">
      <MegaHeader />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Trust Marquee */}
      <MarqueeBanner />
      
      {/* Flash Deals - Limited Time Offers */}
      <FlashDeals products={products.slice(0, 4)} />
      
      {/* Best Sellers Section */}
      <BestSellers products={bestSellers.length > 0 ? bestSellers : products.slice(0, 8)} />
      
      {/* Brand Promise Strip */}
      <BrandPromise />
      
      {/* Shop By Category */}
      <CategoryShowcase />
      
      {/* New Arrivals */}
      <NewArrivals products={newArrivals.length > 0 ? newArrivals : products.slice(0, 6)} />
      
      {/* Trending Products */}
      <TrendingProducts products={products.slice(0, 8)} />
      
      {/* Why Choose Gibbon */}
      <WhyGibbon />
      
      {/* Customer Testimonials */}
      <Testimonials />
      
      {/* Newsletter */}
      <Newsletter />
      
      {/* FAQ */}
      <FAQ />
      
      {/* Instagram Feed */}
      <InstagramFeed />
      
      <Footer />
    </div>
  )
}
