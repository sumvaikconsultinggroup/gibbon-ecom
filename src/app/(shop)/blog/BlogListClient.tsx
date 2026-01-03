'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Clock, User, Eye, Tag, Search, ChevronRight,
  Calendar, ArrowRight, BookOpen, Sparkles
} from 'lucide-react'

interface BlogPost {
  _id: string
  title: string
  slug: string
  excerpt?: string
  featuredImage?: { url: string; alt?: string }
  author: { name: string; avatar?: string }
  category?: string
  tags?: string[]
  publishedAt?: string
  readingTime?: number
  viewCount?: number
}

interface BlogCategory {
  _id: string
  name: string
  slug: string
  color?: string
  postCount: number
}

interface BlogListClientProps {
  initialPosts: BlogPost[]
  categories: BlogCategory[]
  featuredPosts: BlogPost[]
}

export default function BlogListClient({ initialPosts, categories, featuredPosts }: BlogListClientProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchPosts = async (category?: string, search?: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category) params.set('category', category)
      if (search) params.set('search', search)
      params.set('limit', '12')
      
      const res = await fetch(`/api/blog?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setPosts(data.data)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = (slug: string | null) => {
    setActiveCategory(slug)
    fetchPosts(slug || undefined, searchQuery || undefined)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchPosts(activeCategory || undefined, searchQuery || undefined)
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#1B198F] to-blue-700 py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur"
            >
              <BookOpen className="h-4 w-4" />
              <span className="text-sm font-medium">Fitness Knowledge Hub</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold md:text-5xl lg:text-6xl"
            >
              Gibbon Blog
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-lg text-white/80"
            >
              Expert tips on fitness, nutrition, and achieving your health goals
            </motion.p>
            
            {/* Search */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onSubmit={handleSearch}
              className="mx-auto mt-8 max-w-xl"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full rounded-full border-0 bg-white py-4 pl-12 pr-32 text-neutral-900 shadow-xl outline-none placeholder:text-neutral-400"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[#1B198F] px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-800"
                >
                  Search
                </button>
              </div>
            </motion.form>
          </div>
        </div>
      </div>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <div className="container mx-auto -mt-8 px-4">
          <div className="grid gap-6 md:grid-cols-3">
            {featuredPosts.map((post, index) => (
              <motion.article
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block overflow-hidden rounded-2xl bg-white shadow-xl transition-all hover:shadow-2xl dark:bg-neutral-800"
                >
                  <div className="relative aspect-[16/10]">
                    {post.featuredImage?.url ? (
                      <Image
                        src={post.featuredImage.url}
                        alt={post.featuredImage.alt || post.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                        <BookOpen className="h-12 w-12 text-blue-300" />
                      </div>
                    )}
                    <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white">
                      <Sparkles className="h-3 w-3" />
                      Featured
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-neutral-900 line-clamp-2 group-hover:text-[#1B198F] dark:text-white">
                      {post.title}
                    </h3>
                    <div className="mt-3 flex items-center gap-3 text-xs text-neutral-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {post.readingTime || 1} min
                      </span>
                      {post.publishedAt && (
                        <span>
                          {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleCategoryClick(null)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                !activeCategory
                  ? 'bg-[#1B198F] text-white'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300'
              }`}
            >
              All Posts
            </button>
            {categories.map(cat => (
              <button
                key={cat._id}
                onClick={() => handleCategoryClick(cat.slug)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === cat.slug
                    ? 'bg-[#1B198F] text-white'
                    : 'bg-white text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300'
                }`}
              >
                {cat.name}
                <span className="ml-1 opacity-60">({cat.postCount})</span>
              </button>
            ))}
          </div>
        )}

        {/* Posts Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video rounded-xl bg-neutral-200" />
                <div className="mt-4 h-6 w-3/4 rounded bg-neutral-200" />
                <div className="mt-2 h-4 w-full rounded bg-neutral-200" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 dark:bg-neutral-800">
            <BookOpen className="h-16 w-16 text-neutral-300" />
            <h3 className="mt-4 text-xl font-bold">No posts found</h3>
            <p className="mt-2 text-neutral-500">Check back later for new content</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <motion.article
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-xl dark:bg-neutral-800"
                >
                  <div className="relative aspect-video">
                    {post.featuredImage?.url ? (
                      <Image
                        src={post.featuredImage.url}
                        alt={post.featuredImage.alt || post.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
                        <BookOpen className="h-12 w-12 text-neutral-300" />
                      </div>
                    )}
                    {post.category && (
                      <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-neutral-700 backdrop-blur">
                        {categories.find(c => c.slug === post.category)?.name || post.category}
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-neutral-900 line-clamp-2 group-hover:text-[#1B198F] dark:text-white">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="mt-2 text-sm text-neutral-600 line-clamp-2 dark:text-neutral-400">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-neutral-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {post.author.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {post.readingTime || 1} min
                        </span>
                      </div>
                      {post.viewCount !== undefined && post.viewCount > 0 && (
                        <span className="flex items-center gap-1 text-xs text-neutral-400">
                          <Eye className="h-3.5 w-3.5" />
                          {post.viewCount}
                        </span>
                      )}
                    </div>
                    {post.tags && post.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {post.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
