'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, Star, Quote, CheckCircle } from 'lucide-react'

const testimonials = [
  {
    id: 1,
    name: 'Rahul Sharma',
    location: 'Mumbai, Maharashtra',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    rating: 5,
    title: 'Best Whey Protein I\'ve Ever Used!',
    review: 'I\'ve tried multiple brands but Gibbon\'s My Whey is on another level. The taste is amazing, mixes perfectly, and I\'ve seen significant gains in just 2 months. The authenticity QR code gives me confidence I\'m getting the real deal.',
    product: 'My Whey 2kg - Chocolate',
    date: '2 weeks ago',
    verified: true,
    beforeAfter: true,
  },
  {
    id: 2,
    name: 'Priya Patel',
    location: 'Bangalore, Karnataka',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    rating: 5,
    title: 'JOLT Pre-Workout is Insane!',
    review: 'The energy and focus from JOLT is incredible. No jitters, no crash, just clean energy throughout my workout. I\'ve PR\'d multiple times since switching to Gibbon. Highly recommend!',
    product: 'JOLT Pre-Workout - Blue Raspberry',
    date: '1 month ago',
    verified: true,
  },
  {
    id: 3,
    name: 'Arjun Reddy',
    location: 'Hyderabad, Telangana',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    rating: 5,
    title: 'Mass Gainer That Actually Works',
    review: 'As a hardgainer, I struggled to put on weight for years. Gibbon\'s Mass Gainer helped me gain 8kg in 3 months without the bloating I got from other brands. Clean ingredients make all the difference.',
    product: 'Mass Gainer 5kg - Vanilla',
    date: '3 weeks ago',
    verified: true,
    beforeAfter: true,
  },
  {
    id: 4,
    name: 'Sneha Gupta',
    location: 'Delhi, NCR',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    rating: 5,
    title: 'Finally a Brand I Can Trust',
    review: 'The transparency from Gibbon is refreshing. Lab reports available, QR verification, and responsive customer service. My Omega has improved my joint health significantly. Will be a customer for life!',
    product: 'My Omega - Fish Oil',
    date: '1 week ago',
    verified: true,
  },
  {
    id: 5,
    name: 'Vikram Singh',
    location: 'Pune, Maharashtra',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    rating: 5,
    title: 'Recovery Game Changed',
    review: 'Daily BCAA has become essential for my recovery. I train 6 days a week and the difference in muscle soreness is night and day. Plus the mango flavor is actually delicious!',
    product: 'Daily BCAA - Mango',
    date: '2 months ago',
    verified: true,
  },
]

export default function Testimonials({ className = '' }: { className?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 420
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  return (
    <section className={`relative overflow-hidden bg-neutral-100 py-20 lg:py-32 dark:bg-neutral-800 ${className}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-50">
        <div className="h-full w-full bg-[radial-gradient(circle_at_center,_rgba(27,25,143,0.05)_1px,_transparent_1px)] bg-[size:30px_30px]" />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-2 inline-block text-sm font-bold uppercase tracking-wider text-[#1B198F]">
              ⭐ Customer Love
            </span>
            <h2 className="font-[family-name:var(--font-family-antonio)] text-4xl font-black uppercase text-neutral-900 sm:text-5xl dark:text-white">
              Real Results, Real People
            </h2>
            <p className="mt-2 max-w-md text-neutral-600 dark:text-neutral-400">
              Join 50,000+ athletes who trust Gibbon for their fitness journey
            </p>
          </motion.div>

          {/* Rating Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-lg dark:bg-neutral-700"
          >
            <div className="text-center">
              <div className="text-3xl font-black text-neutral-900 dark:text-white">4.9</div>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
            <div className="border-l border-neutral-200 pl-4 dark:border-neutral-600">
              <div className="text-sm font-semibold text-neutral-900 dark:text-white">10,000+ Reviews</div>
              <div className="text-xs text-neutral-500">Verified Purchases</div>
            </div>
          </motion.div>
        </div>

        {/* Navigation */}
        <div className="mb-6 flex justify-end gap-2">
          <button
            onClick={() => scroll('left')}
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-neutral-300 bg-white text-neutral-700 transition-all hover:border-[#1B198F] hover:bg-[#1B198F] hover:text-white dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-neutral-300 bg-white text-neutral-700 transition-all hover:border-[#1B198F] hover:bg-[#1B198F] hover:text-white dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Testimonials Carousel */}
        <div
          ref={scrollRef}
          className="-mx-4 flex gap-6 overflow-x-auto px-4 pb-4 scrollbar-hide"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="w-[350px] flex-shrink-0 sm:w-[400px]"
              style={{ scrollSnapAlign: 'start' }}
            >
              <div className="group relative h-full overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all hover:shadow-xl dark:bg-neutral-700">
                {/* Quote Icon */}
                <Quote className="absolute -right-2 -top-2 h-20 w-20 rotate-180 text-neutral-100 dark:text-neutral-600" />

                {/* Header */}
                <div className="relative mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-full">
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-neutral-900 dark:text-white">{testimonial.name}</h4>
                        {testimonial.verified && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-xs text-neutral-500">{testimonial.location}</p>
                    </div>
                  </div>
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>

                {/* Review Title */}
                <h3 className="relative mb-2 text-lg font-bold text-neutral-900 dark:text-white">
                  "{testimonial.title}"
                </h3>

                {/* Review Text */}
                <p className="relative mb-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                  {testimonial.review}
                </p>

                {/* Product Tag */}
                <div className="flex items-center justify-between">
                  <span className="inline-block rounded-full bg-[#1B198F]/10 px-3 py-1 text-xs font-semibold text-[#1B198F]">
                    {testimonial.product}
                  </span>
                  <span className="text-xs text-neutral-400">{testimonial.date}</span>
                </div>

                {/* Before/After Badge */}
                {testimonial.beforeAfter && (
                  <div className="mt-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-3">
                    <p className="text-xs font-semibold text-green-600">
                      📸 Before/After photos available
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-center text-sm text-neutral-500"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Verified Reviews</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Real Customers</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Authentic Results</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
