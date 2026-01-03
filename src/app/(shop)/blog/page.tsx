import { Metadata } from 'next'
import connectDb from '@/lib/mongodb'
import BlogPost from '@/models/BlogPost'
import BlogCategory from '@/models/BlogCategory'
import BlogListClient from './BlogListClient'

export const dynamic = 'force-dynamic'
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Blog | Gibbon Nutrition',
  description: 'Read the latest articles on fitness, nutrition, supplements, and healthy lifestyle tips from Gibbon Nutrition.',
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
  
  return (
    <BlogListClient 
      initialPosts={posts}
      categories={categories}
      featuredPosts={featuredPosts}
    />
  )
}
