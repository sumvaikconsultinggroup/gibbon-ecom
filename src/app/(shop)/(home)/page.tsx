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
} from '@/components/Homepage'
import ShoppableVideos from '@/components/homepage/ShoppableVideos'
import BestSellers from '@/components/Homepage/BestSellers'
import NewArrivals from '@/components/Homepage/NewArrivals'
import FlashDeals from '@/components/Homepage/FlashDeals'
import TrendingProducts from '@/components/Homepage/TrendingProducts'
import BrandPromise from '@/components/Homepage/BrandPromise'
import connectDb from '@/lib/mongodb'
import Product from '@/models/product.model'
import { Metadata } from 'next'
import { generateFAQSchema, siteConfig } from '@/lib/seo'
import JsonLd from '@/components/SEO/JsonLd'

// Homepage specific metadata
export const metadata: Metadata = {
  title: 'Gibbon Nutrition - Premium Fitness Supplements | Whey Protein, Pre-Workout, BCAA India',
  description: 'India\'s trusted fitness supplement brand. Shop Lab-tested Whey Protein, Pre-Workout, BCAA, Mass Gainers & more. FSSAI certified. Free shipping above ₹999. COD available.',
  keywords: [
    'Gibbon Nutrition',
    'whey protein India',
    'best protein powder',
    'pre workout supplement',
    'BCAA supplement',
    'mass gainer India',
    'gym supplements online',
    'fitness supplements',
    'bodybuilding supplements',
    'sports nutrition India',
    'FSSAI certified supplements',
    'lab tested protein',
    'buy supplements online',
    'protein powder price',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    title: 'Gibbon Nutrition - Premium Fitness Supplements India',
    description: 'India\'s trusted fitness supplement brand. Lab-tested Whey Protein, Pre-Workout, BCAA & more. Free shipping above ₹999.',
    url: siteConfig.url,
    siteName: 'Gibbon Nutrition',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Gibbon Nutrition - Premium Fitness Supplements',
      },
    ],
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gibbon Nutrition - Premium Fitness Supplements India',
    description: 'India\'s trusted fitness supplement brand. Lab-tested Whey Protein, Pre-Workout, BCAA & more.',
    images: ['/og-image.jpg'],
  },
}

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

// Homepage FAQ data for structured data
const homeFAQs = [
  {
    question: 'Is Gibbon Nutrition FSSAI certified?',
    answer: 'Yes, all Gibbon Nutrition products are FSSAI certified and undergo rigorous lab testing to ensure quality and safety standards.',
  },
  {
    question: 'What is the delivery time for supplements?',
    answer: 'We deliver across India within 3-7 business days. Metro cities typically receive orders within 2-4 days. Free shipping is available on orders above ₹999.',
  },
  {
    question: 'Are Gibbon Nutrition products lab tested?',
    answer: 'Absolutely! Every batch of our supplements undergoes third-party lab testing for purity, potency, and safety. We provide lab reports for transparency.',
  },
  {
    question: 'Do you offer Cash on Delivery (COD)?',
    answer: 'Yes, we offer Cash on Delivery across India. COD is available for orders up to ₹10,000. A small COD fee may apply.',
  },
  {
    question: 'What is your return policy?',
    answer: 'We offer a 7-day return policy for unopened products. If you receive a damaged or wrong product, we provide free replacement or full refund.',
  },
  {
    question: 'Which protein is best for beginners?',
    answer: 'For beginners, we recommend starting with Whey Protein Concentrate or Isolate. They are easy to digest, provide high-quality protein, and support muscle recovery.',
  },
]

export default async function PageHome() {
  const [products, bestSellers, newArrivals] = await Promise.all([
    getProducts(),
    getBestSellers(),
    getNewArrivals()
  ])

  // Generate FAQ Schema for homepage
  const faqSchema = generateFAQSchema(homeFAQs)

  return (
    <div className="nc-PageHome relative">
      {/* FAQ Schema for Homepage */}
      <JsonLd data={faqSchema} />
      
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
      
      {/* Shoppable Video Reels - Replaces Instagram Feed */}
      <ShoppableVideos />
      
      <Footer />
    </div>
  )
}
