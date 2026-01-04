import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import connectDb from '@/lib/mongodb'
import BlogPost from '@/models/BlogPost'
import BlogPostClient from './BlogPostClient'
import { generateArticleSchema, generateBreadcrumbSchema, siteConfig } from '@/lib/seo'
import JsonLd from '@/components/SEO/JsonLd'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ handle: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params
  await connectDb()
  const post = await BlogPost.findOne({ slug: handle, status: 'published' }).lean() as any
  
  if (!post) {
    return { title: 'Post Not Found' }
  }
  
  const title = post.seo?.metaTitle || post.title
  const description = post.seo?.metaDescription || post.excerpt || post.content?.slice(0, 160)
  const image = post.featuredImage?.url || `${siteConfig.url}/og-image.jpg`
  
  return {
    title: title,
    description: description,
    keywords: post.tags || [],
    authors: [{ name: post.author || 'Gibbon Nutrition Team' }],
    alternates: {
      canonical: `/blog/${handle}`,
    },
    openGraph: {
      type: 'article',
      title: title,
      description: description,
      url: `${siteConfig.url}/blog/${handle}`,
      siteName: 'Gibbon Nutrition',
      images: [{ url: image, width: 1200, height: 630, alt: post.title }],
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt?.toISOString(),
      authors: [post.author || 'Gibbon Nutrition Team'],
      section: post.category || 'Fitness',
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [image],
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
    ).lean() as any
    
    if (!post) return null
    
    // Get related posts
    const relatedPosts = await BlogPost.find({
      _id: { $ne: post._id },
      status: 'published',
      $or: [
        { category: post.category },
        { tags: { $in: post.tags || [] } }
      ]
    })
      .sort({ publishedAt: -1 })
      .limit(3)
      .select('title slug excerpt featuredImage readingTime publishedAt author')
      .lean()
    
    return {
      post: { ...post, _id: post._id.toString() },
      related: relatedPosts.map((r: any) => ({ ...r, _id: r._id.toString() }))
    }
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return null
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { handle } = await params
  const data = await getBlogPost(handle)
  
  if (!data) {
    notFound()
  }
  
  const post = data.post

  // Generate Article Schema
  const articleSchema = generateArticleSchema({
    title: post.title,
    handle: post.slug,
    content: post.content,
    excerpt: post.excerpt,
    image: post.featuredImage?.url,
    author: post.author,
    publishedAt: post.publishedAt?.toISOString?.() || post.publishedAt,
    updatedAt: post.updatedAt?.toISOString?.() || post.updatedAt,
  })

  // Generate Breadcrumb Schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteConfig.url },
    { name: 'Blog', url: `${siteConfig.url}/blog` },
    { name: post.title, url: `${siteConfig.url}/blog/${handle}` },
  ])
  
  return (
    <>
      <JsonLd data={[articleSchema, breadcrumbSchema]} />
      <BlogPostClient post={post} relatedPosts={data.related} />
    </>
  )
}
