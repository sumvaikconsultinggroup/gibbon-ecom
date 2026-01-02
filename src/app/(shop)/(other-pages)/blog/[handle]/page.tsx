import { Divider } from '@/components/Divider'
import SocialsList from '@/shared/SocialsList/SocialsList'
import Tag from '@/shared/Tag'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

async function getBlogBySlug(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/blogs?limit=100`, {
      next: { revalidate: 60 },
    })
    
    if (!response.ok) throw new Error('Failed to fetch blog')
    
    const result = await response.json()
    if (!result.success) return null
    
    return result.data.find((blog: any) => blog.slug === slug) || null
  } catch (error) {
    console.error('Error fetching blog:', error)
    return null
  }
}


export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params
  const post = await getBlogBySlug(handle)
  if (!post) {
    return {
      title: 'Blog',
      description: 'Stay up-to-date with the latest industry news.',
    }
  }
  return { title: post.title, description: post.excerpt || post.title }
}

export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const post = await getBlogBySlug(handle)


  console.log("Single blog post",post)

  if (!post) {
    return notFound()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200
    const text = content.replace(/<[^>]*>/g, '')
    const wordCount = text.split(/\s+/).length
    const minutes = Math.ceil(wordCount / wordsPerMinute)
    return `${minutes} min read`
  }

  const calculateTimeSince = (dateString: string) => {
    const date = new Date(dateString)
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

    let interval = seconds / 31536000
    if (interval > 1) return Math.floor(interval) + ' years ago'
    interval = seconds / 2592000
    if (interval > 1) return Math.floor(interval) + ' months ago'
    interval = seconds / 86400
    if (interval > 1) return Math.floor(interval) + ' days ago'
    interval = seconds / 3600
    if (interval > 1) return Math.floor(interval) + ' hours ago'
    interval = seconds / 60
    if (interval > 1) return Math.floor(interval) + ' minutes ago'
    return Math.floor(seconds) + ' seconds ago'
  }

  return (
    <div className="container min-h-screen py-10 lg:py-16 font-family-antonio">
      <Link href="/blog" className="mb-8 inline-flex items-center text-sm font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mr-2 h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to Blog
      </Link>

      {/* Date */}
      <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mb-4">
        {formatDate(post.createdAt)}
      </p>

      {/* Title */}
      <h1 className="text-center text-3xl md:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-neutral-100 mb-8 px-4">
        {post.title}
      </h1>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        {/* Featured Image */}
        {post.coverImage && (
          <div className="relative w-full h-[500px] aspect-video mb-6 overflow-hidden ">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Author, Share, Reading Time */}
        <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#1b198f] flex items-center justify-center text-white font-bold shrink-0">
              {post.author.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 leading-none">{post.author}</span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {calculateTimeSince(post.createdAt)}
              </span>
            </div>
          </div>
          <span className="text-neutral-500 dark:text-neutral-400">•</span>
          <div className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{calculateReadingTime(post.content)}</span>
          </div>
          <div className="ml-auto">
            <SocialsList />
          </div>
        </div>

        {/* Content */}
        <div 
          className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-neutral-900 dark:prose-headings:text-neutral-100 prose-p:text-neutral-700 dark:prose-p:text-neutral-300"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8">
            {post.tags.map((tag: string) => (
              <Tag key={tag} hideCount>{tag}</Tag>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}