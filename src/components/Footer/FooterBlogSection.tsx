'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock, ArrowRight, BookOpen } from 'lucide-react'

interface BlogPost {
  _id: string
  title: string
  slug: string
  excerpt?: string
  featuredImage?: { url: string; alt?: string }
  author: { name: string }
  category?: string
  readingTime?: number
  publishedAt?: string
}

export default function FooterBlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/api/blog?footer=true&limit=3')
        const data = await res.json()
        if (data.success) {
          setPosts(data.data)
        }
      } catch (error) {
        console.error('Error fetching blog posts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-32 rounded bg-neutral-300" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded bg-neutral-300" />
          ))}
        </div>
      </div>
    )
  }

  if (posts.length === 0) {
    return null
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold text-white">
          <BookOpen className="h-5 w-5" />
          Latest Articles
        </h3>
        <Link 
          href="/blog"
          className="flex items-center gap-1 text-sm text-neutral-400 transition-colors hover:text-white"
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-4">
        {posts.map((post, index) => (
          <motion.article
            key={post._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link 
              href={`/blog/${post.slug}`}
              className="group flex gap-4 rounded-xl p-2 transition-colors hover:bg-white/5"
            >
              {/* Thumbnail */}
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-700">
                {post.featuredImage?.url ? (
                  <Image
                    src={post.featuredImage.url}
                    alt={post.featuredImage.alt || post.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BookOpen className="h-6 w-6 text-neutral-500" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white line-clamp-2 group-hover:text-blue-400 transition-colors">
                  {post.title}
                </h4>
                <div className="mt-1 flex items-center gap-3 text-xs text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readingTime || 1} min
                  </span>
                  {post.publishedAt && (
                    <span>
                      {new Date(post.publishedAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </motion.article>
        ))}
      </div>
    </div>
  )
}
