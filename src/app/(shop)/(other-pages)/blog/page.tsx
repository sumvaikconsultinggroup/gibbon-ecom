import BgGlassmorphism from '@/components/BgGlassmorphism/BgGlassmorphism'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Explore our blog for the latest news, articles, and insights on various topics.',
}

async function getBlogsFromAPI() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/blogs?limit=20`, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    })

    console.log("blogs reaponse",response)

    if (!response.ok) {
      throw new Error('Failed to fetch blogs')
    }

    const result = await response.json()
    return result.success ? result.data : []
  } catch (error) {
    console.error('Error fetching blogs:', error)
    return []
  }
}

const BlogPage: React.FC = async () => {
  const blogPosts = await getBlogsFromAPI()

  return (
    <div className="nc-BlogPage relative overflow-hidden font-family-antonio">
      <div className="relative container py-10 lg:min-h-screen lg:py-16">
        {/* Heading */}
        <div className="mb-12 text-center lg:mb-16">
          <h1 className="text-5xl font-black tracking-tight uppercase md:text-7xl" style={{ color: '#1b198f' }}>
            Blog
          </h1>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post: any) => (
            <div
              key={post.id || post._id || post.slug}
              className="group flex flex-col overflow-hidden  bg-white shadow-lg transition-all duration-300 hover:shadow-2xl dark:bg-neutral-800"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
                <Image
                  src={post.featuredImage || post.coverImage || post.thumbnail || '/placeholder.jpg'}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="flex grow flex-col p-5">
                <h2 className="mb-3 text-xl leading-tight font-bold text-neutral-900 transition-colors duration-300 group-hover:text-[#1b198f] md:text-2xl dark:text-neutral-100">
                  {post.title}
                </h2>
                <p className="mb-4 line-clamp-3 grow text-sm leading-relaxed text-neutral-600 md:text-base dark:text-neutral-400">
                  {post.desc ||
                    post.excerpt ||
                    (typeof post.content === 'string' ? post.content.substring(0, 150) + '...' : '')}
                </p>
                <Link
                  href={post.href || `/blog/${post.slug}`}
                  className="mt-auto inline-flex items-center text-base font-bold hover:underline md:text-lg"
                  style={{ color: '#1b198f' }}
                >
                  Read More →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BlogPage
