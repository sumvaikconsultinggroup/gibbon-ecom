'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

const categories = [
  {
    id: 1,
    title: 'Whey Protein',
    subtitle: 'Build Muscle',
    description: 'Premium whey for maximum gains',
    image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800',
    href: '/collections/whey-protein',
    color: 'from-red-600 to-orange-500',
    products: '24 Products',
  },
  {
    id: 2,
    title: 'Pre-Workout',
    subtitle: 'Explosive Energy',
    description: 'Fuel your most intense sessions',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
    href: '/collections/pre-workout',
    color: 'from-purple-600 to-pink-500',
    products: '12 Products',
  },
  {
    id: 3,
    title: 'Mass Gainer',
    subtitle: 'Bulk Up',
    description: 'Calorie-dense formulas for size',
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800',
    href: '/collections/mass-gainer',
    color: 'from-blue-600 to-cyan-500',
    products: '8 Products',
  },
  {
    id: 4,
    title: 'BCAAs & EAAs',
    subtitle: 'Recovery',
    description: 'Essential amino acids for repair',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
    href: '/collections/bcaa',
    color: 'from-emerald-600 to-teal-500',
    products: '16 Products',
  },
  {
    id: 5,
    title: 'Vitamins',
    subtitle: 'Daily Health',
    description: 'Complete nutrition support',
    image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800',
    href: '/collections/vitamins',
    color: 'from-yellow-500 to-orange-500',
    products: '20 Products',
  },
  {
    id: 6,
    title: 'Creatine',
    subtitle: 'Power & Strength',
    description: 'Boost performance & muscle',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
    href: '/collections/creatine',
    color: 'from-indigo-600 to-violet-500',
    products: '6 Products',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
}

export default function CategoryShowcase({ className = '' }: { className?: string }) {
  return (
    <section className={`relative overflow-hidden bg-neutral-950 py-20 lg:py-32 ${className}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block rounded-full bg-[#1B198F]/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#1B198F]">
            Shop By Goal
          </span>
          <h2 className="mb-4 font-[family-name:var(--font-family-antonio)] text-4xl font-black uppercase text-white sm:text-5xl lg:text-6xl">
            Find Your <span className="bg-gradient-to-r from-[#1B198F] to-blue-400 bg-clip-text text-transparent">Perfect Fit</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-neutral-400">
            Whether you're bulking, cutting, or maintaining - we've got the perfect supplement for your fitness journey.
          </p>
        </motion.div>

        {/* Category Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {categories.map((category, index) => (
            <motion.div key={category.id} variants={itemVariants}>
              <Link href={category.href} className="group relative block">
                <div className="relative h-[300px] overflow-hidden rounded-2xl bg-neutral-900 sm:h-[350px]">
                  {/* Background Image */}
                  <Image
                    src={category.image}
                    alt={category.title}
                    fill
                    className="object-cover transition-all duration-700 group-hover:scale-110"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-0 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-70`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    {/* Product Count */}
                    <span className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/60">
                      {category.products}
                    </span>

                    {/* Title */}
                    <h3 className="mb-1 font-[family-name:var(--font-family-antonio)] text-2xl font-black uppercase text-white sm:text-3xl">
                      {category.title}
                    </h3>

                    {/* Subtitle */}
                    <p className="mb-3 text-sm font-semibold text-white/80">{category.subtitle}</p>

                    {/* Description - Shows on hover */}
                    <p className="mb-4 max-h-0 overflow-hidden text-sm text-white/70 transition-all duration-500 group-hover:max-h-20">
                      {category.description}
                    </p>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white">
                      <span>Shop Now</span>
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </div>
                  </div>

                  {/* Hover Border Effect */}
                  <div className={`absolute inset-0 rounded-2xl border-2 border-transparent transition-colors duration-500 group-hover:border-white/30`} />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Link
            href="/collections/all"
            className="group inline-flex items-center gap-2 rounded-full border-2 border-white/20 bg-white/5 px-8 py-4 text-sm font-bold uppercase tracking-wider text-white transition-all duration-300 hover:border-white/40 hover:bg-white/10"
          >
            View All Categories
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
