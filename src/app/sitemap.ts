import { MetadataRoute } from 'next'
import connectDb from '@/lib/mongodb'
import Product from '@/models/product.model'
import Collection from '@/models/collection.model'
import BlogPost from '@/models/BlogPost'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gibbonnutrition.com'
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/collections/all-items`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ]

  try {
    await connectDb()

    // Get all published products
    const products = await Product.find({ published: true, isDeleted: false })
      .select('handle updatedAt')
      .lean()

    const productPages: MetadataRoute.Sitemap = products.map((product: any) => ({
      url: `${baseUrl}/products/${product.handle}`,
      lastModified: product.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    // Get all collections
    const collections = await Collection.find({ published: true })
      .select('handle updatedAt')
      .lean()

    const collectionPages: MetadataRoute.Sitemap = collections.map((collection: any) => ({
      url: `${baseUrl}/collections/${collection.handle}`,
      lastModified: collection.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    // Get all blog posts
    const blogPosts = await BlogPost.find({ status: 'published' })
      .select('handle updatedAt')
      .lean()

    const blogPages: MetadataRoute.Sitemap = blogPosts.map((post: any) => ({
      url: `${baseUrl}/blog/${post.handle}`,
      lastModified: post.updatedAt || new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))

    return [...staticPages, ...productPages, ...collectionPages, ...blogPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticPages
  }
}
