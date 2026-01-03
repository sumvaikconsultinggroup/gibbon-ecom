import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import connectDb from '@/lib/mongodb'
import BlogPost from '@/models/BlogPost'
import BlogPostClient from './BlogPostClient'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  await connectDb()
  const post = await BlogPost.findOne({ slug, status: 'published' }).lean()
  
  if (!post) {
    return { title: 'Post Not Found' }
  }
  
  const p = post as any
  return {
    title: p.seo?.metaTitle || `${p.title} | Gibbon Nutrition Blog`,
    description: p.seo?.metaDescription || p.excerpt,
    openGraph: {
      title: p.seo?.metaTitle || p.title,
      description: p.seo?.metaDescription || p.excerpt,
      images: p.featuredImage?.url ? [{ url: p.featuredImage.url }] : [],
    },
  }
}

async function getBlogPost(slug: string) {
  try {
    await connectDb()
    
    // Increment view count and get post
    const post = await BlogPost.findOneAndUpdate(
      { slug, status: 'published' },
      { $inc: { viewCount: 1 } },
      { new: true }
    ).lean()
    
    if (!post) return null
    
    // Get related posts
    const p = post as any
    const relatedPosts = await BlogPost.find({
      _id: { $ne: p._id },
      status: 'published',
      $or: [
        { category: p.category },
        { tags: { $in: p.tags || [] } }
      ]
    })
      .sort({ publishedAt: -1 })
      .limit(3)
      .select('title slug excerpt featuredImage readingTime publishedAt author')
      .lean()
    
    return {
      post: { ...p, _id: p._id.toString() },
      related: relatedPosts.map((r: any) => ({ ...r, _id: r._id.toString() }))
    }
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return null
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const data = await getBlogPost(slug)
  
  if (!data) {
    notFound()
  }
  
  return <BlogPostClient post={data.post} relatedPosts={data.related} />
}
