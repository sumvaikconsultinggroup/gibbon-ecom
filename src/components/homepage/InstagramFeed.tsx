'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Instagram } from 'lucide-react'

const instagramPosts = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
    likes: '2.4K',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400',
    likes: '1.8K',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
    likes: '3.2K',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400',
    likes: '2.1K',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400',
    likes: '1.5K',
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400',
    likes: '2.8K',
  },
]

export default function InstagramFeed({ className = '' }: { className?: string }) {
  return (
    <section className={`relative overflow-hidden bg-white py-16 lg:py-24 dark:bg-neutral-900 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <Link
            href="https://www.instagram.com/gibbonnutrition/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 text-2xl font-bold text-neutral-900 transition-colors hover:text-[#1B198F] sm:text-3xl dark:text-white"
          >
            <Instagram className="h-8 w-8" />
            @gibbonnutrition
          </Link>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Tag us in your transformation journey for a chance to be featured!
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {instagramPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <Link
                href="https://www.instagram.com/gibbonnutrition/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-square overflow-hidden rounded-xl"
              >
                <Image
                  src={post.image}
                  alt="Instagram post"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/50">
                  <span className="flex items-center gap-2 text-sm font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                    ❤️ {post.likes}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
