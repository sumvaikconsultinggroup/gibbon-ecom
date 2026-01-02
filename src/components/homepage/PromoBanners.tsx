'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ShoppingBag } from 'lucide-react'

interface PromoBanner {
  id: number
  title: string
  subtitle: string
  description: string
  image: string
  cta: string
  href: string
  color: string
  badge?: string
}

const banners: PromoBanner[] = [
  {
    id: 1,
    title: 'STACK & SAVE',
    subtitle: 'Build Your Perfect Stack',
    description: 'Get 25% off when you buy 3 or more products. Mix & match your favorites.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
    cta: 'Build Stack',
    href: '/collections/all',
    color: 'from-orange-600 to-red-600',
    badge: '25% OFF',
  },
  {
    id: 2,
    title: 'NEW LAUNCH',
    subtitle: 'Introducing JOLT 2.0',
    description: 'Next-gen pre-workout with enhanced focus and zero crash formula.',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
    cta: 'Shop Now',
    href: '/products/jolt',
    color: 'from-purple-600 to-pink-600',
    badge: 'NEW',
  },
]

export default function PromoBanners({ className = '' }: { className?: string }) {
  return (
    <section className={`relative overflow-hidden bg-neutral-100 py-12 lg:py-20 dark:bg-neutral-800 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {banners.map((banner, index) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link href={banner.href} className="group relative block">
                <div className="relative h-[300px] overflow-hidden rounded-2xl sm:h-[350px]">
                  {/* Background Image */}
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${banner.color} opacity-80`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8">
                    {/* Badge */}
                    {banner.badge && (
                      <div>
                        <span className="inline-block rounded-full bg-white px-4 py-1.5 text-xs font-black uppercase tracking-wider text-neutral-900">
                          {banner.badge}
                        </span>
                      </div>
                    )}

                    {/* Text Content */}
                    <div>
                      <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-white/80">
                        {banner.subtitle}
                      </p>
                      <h3 className="mb-3 font-[family-name:var(--font-family-antonio)] text-3xl font-black uppercase text-white sm:text-4xl">
                        {banner.title}
                      </h3>
                      <p className="mb-6 max-w-xs text-sm text-white/80">
                        {banner.description}
                      </p>
                      <span className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold uppercase tracking-wider text-neutral-900 transition-all group-hover:gap-4">
                        {banner.cta}
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
