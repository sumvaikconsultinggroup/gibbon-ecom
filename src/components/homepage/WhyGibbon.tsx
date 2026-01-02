'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { Shield, Leaf, FlaskConical, Award, Truck, HeartHandshake } from 'lucide-react'
import Image from 'next/image'

const features = [
  {
    icon: FlaskConical,
    title: 'Lab Tested',
    description: 'Every batch is third-party tested for purity, potency, and banned substances.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Leaf,
    title: '100% Natural',
    description: 'No artificial colors, fillers, or harmful additives. Just pure nutrition.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Award,
    title: 'FSSAI Certified',
    description: 'Manufactured in GMP-certified facilities following strict quality standards.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Shield,
    title: 'Authenticity Guaranteed',
    description: 'QR code verification on every product. Know exactly what you\'re getting.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Free shipping on orders over ₹999. Delivered to your doorstep in 3-5 days.',
    color: 'from-red-500 to-rose-500',
  },
  {
    icon: HeartHandshake,
    title: 'Customer First',
    description: '24/7 support, easy returns, and personalized nutrition guidance.',
    color: 'from-indigo-500 to-violet-500',
  },
]

const stats = [
  { value: 50000, suffix: '+', label: 'Happy Customers' },
  { value: 100, suffix: '%', label: 'Natural Ingredients' },
  { value: 150, suffix: '+', label: 'Products' },
  { value: 4.9, suffix: '★', label: 'Average Rating', decimals: 1 },
]

function AnimatedCounter({ value, suffix = '', decimals = 0 }: { value: number; suffix?: string; decimals?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      const duration = 2000
      const steps = 60
      const increment = value / steps
      let current = 0
      const timer = setInterval(() => {
        current += increment
        if (current >= value) {
          setCount(value)
          clearInterval(timer)
        } else {
          setCount(current)
        }
      }, duration / steps)
      return () => clearInterval(timer)
    }
  }, [isInView, value])

  return (
    <span ref={ref}>
      {decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString()}
      {suffix}
    </span>
  )
}

export default function WhyGibbon({ className = '' }: { className?: string }) {
  return (
    <section className={`relative overflow-hidden bg-neutral-950 py-20 lg:py-32 ${className}`}>
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute left-0 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1B198F]/20 blur-[150px]" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] translate-x-1/2 translate-y-1/2 rounded-full bg-purple-500/20 blur-[150px]" />
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
            Why Choose Us
          </span>
          <h2 className="mb-4 font-[family-name:var(--font-family-antonio)] text-4xl font-black uppercase text-white sm:text-5xl lg:text-6xl">
            The Gibbon <span className="bg-gradient-to-r from-[#1B198F] to-blue-400 bg-clip-text text-transparent">Difference</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-neutral-400">
            We don't just sell supplements. We deliver results backed by science, quality, and an unwavering commitment to your fitness goals.
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-20 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm"
        >
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="mb-2 font-[family-name:var(--font-family-antonio)] text-4xl font-black text-white sm:text-5xl">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
                </div>
                <div className="text-sm uppercase tracking-wider text-neutral-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all duration-500 hover:border-white/20 hover:bg-white/10">
                {/* Icon */}
                <div
                  className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-r ${feature.color}`}
                >
                  <feature.icon className="h-7 w-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="mb-3 text-xl font-bold text-white">{feature.title}</h3>
                <p className="text-neutral-400">{feature.description}</p>

                {/* Hover Glow */}
                <div
                  className={`absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-r ${feature.color} opacity-0 blur-[80px] transition-opacity duration-500 group-hover:opacity-30`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="mb-6 text-lg text-neutral-400">
            Ready to transform your fitness journey?
          </p>
          <a
            href="/collections/all"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#1B198F] to-blue-500 px-8 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(27,25,143,0.5)]"
          >
            Start Your Journey
          </a>
        </motion.div>
      </div>
    </section>
  )
}
