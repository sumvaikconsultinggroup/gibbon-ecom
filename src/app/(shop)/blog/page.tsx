import { Metadata } from 'next'
import connectDb from '@/lib/mongodb'
import BlogPost from '@/models/BlogPost'
import BlogCategory from '@/models/BlogCategory'
import BlogListClient from './BlogListClient'
import { siteConfig, generateBreadcrumbSchema } from '@/lib/seo'
import JsonLd from '@/components/SEO/JsonLd'

export const dynamic = 'force-dynamic'
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Fitness & Nutrition Blog - Expert Tips & Guides',
  description: 'Expert articles on fitness, nutrition, supplements, workout tips, and healthy lifestyle. Learn from certified trainers and nutritionists at Gibbon Nutrition.',
  keywords: [
    'fitness blog',
    'nutrition articles',
    'supplement guides',
    'workout tips',
    'healthy lifestyle',
    'muscle building tips',
    'weight loss guide',
    'protein guide',
    'gym tips',
    'bodybuilding articles',
  ],
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    type: 'website',
    title: 'Fitness & Nutrition Blog | Gibbon Nutrition',
    description: 'Expert articles on fitness, nutrition, supplements, and healthy lifestyle tips.',
    url: `${siteConfig.url}/blog`,
    siteName: 'Gibbon Nutrition',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fitness & Nutrition Blog | Gibbon Nutrition',
    description: 'Expert articles on fitness, nutrition, supplements, and healthy lifestyle tips.',
  },
}

async function getBlogData() {
  try {
    await connectDb()
    
    const now = new Date()
    
    const [posts, categories, featuredPosts] = await Promise.all([
      BlogPost.find({
        status: 'published',
        $or: [{ publishedAt: { $lte: now } }, { publishedAt: { $exists: false } }]
      })
        .sort({ publishedAt: -1 })
        .limit(12)
        .select('title slug excerpt featuredImage author category tags publishedAt readingTime viewCount')
        .lean(),
      BlogCategory.find({ isActive: true }).sort({ order: 1 }).lean(),
      BlogPost.find({
        status: 'published',
        isFeatured: true,
        $or: [{ publishedAt: { $lte: now } }, { publishedAt: { $exists: false } }]
      })
        .sort({ publishedAt: -1 })
        .limit(3)
        .select('title slug excerpt featuredImage author category publishedAt readingTime')
        .lean()
    ])
    
    return {
      posts: posts.map((p: any) => ({ ...p, _id: p._id.toString() })),
      categories: categories.map((c: any) => ({ ...c, _id: c._id.toString() })),
      featuredPosts: featuredPosts.map((p: any) => ({ ...p, _id: p._id.toString() }))
    }
  } catch (error) {
    console.error('Error fetching blog data:', error)
    return { posts: [], categories: [], featuredPosts: [] }
  }
}

export default async function BlogPage() {
  const { posts, categories, featuredPosts } = await getBlogData()
  
  // Generate breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteConfig.url },
    { name: 'Blog', url: `${siteConfig.url}/blog` },
  ])

  // Generate blog listing schema
  const blogListSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Gibbon Nutrition Blog',
    description: 'Expert articles on fitness, nutrition, supplements, and healthy lifestyle.',
    url: `${siteConfig.url}/blog`,
    publisher: {
      '@type': 'Organization',
      name: 'Gibbon Nutrition',
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/GibbonLogoEccom.png`,
      },
    },
    blogPost: posts.slice(0, 10).map((post: any) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      url: `${siteConfig.url}/blog/${post.slug}`,
      datePublished: post.publishedAt,
      author: {
        '@type': 'Person',
        name: post.author || 'Gibbon Nutrition Team',
      },
    })),
  }
  
  return (
    <>
      <JsonLd data={[breadcrumbSchema, blogListSchema]} />
      <BlogListClient 
        initialPosts={posts}
        categories={categories}
        featuredPosts={featuredPosts}
      />
    </>
  )
}
