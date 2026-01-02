'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'
import { ChevronRight, Shield, Award, Truck, Star, Play } from 'lucide-react'

const heroSlides = [
  {
    id: 1,
    title: 'FUEL YOUR',
    titleHighlight: 'BEAST MODE',
    subtitle: 'Premium supplements crafted for champions',
    description: 'Lab-tested, FSSAI approved formulas designed to maximize your gains and accelerate recovery.',
    image: '/GibbonBanner-1.png',
    cta: 'Shop Bestsellers',
    ctaLink: '/collections/bestsellers',
    badge: 'NEW ARRIVAL',
    color: 'from-red-600 to-orange-500',
  },
  {
    id: 2,
    title: 'STRENGTH',
    titleHighlight: 'REDEFINED',
    subtitle: 'Made in India. Trusted Worldwide.',
    description: 'Join 50,000+ athletes who trust Gibbon for their daily nutrition needs.',
    image: '/GibbonBanner-2.png',
    cta: 'Explore Collection',
    ctaLink: '/collections/all',
    badge: 'BESTSELLER',
    color: 'from-blue-600 to-indigo-500',
  },
  {
    id: 3,
    title: 'RECOVER',
    titleHighlight: 'STRONGER',
    subtitle: 'Science-backed. Results-driven.',
    description: 'Advanced recovery formulas to help you bounce back faster and train harder.',
    image: '/GibbonBanner-3.png',
    cta: 'Shop Recovery',
    ctaLink: '/collections/muscle-recovery',
    badge: 'TOP RATED',
    color: 'from-emerald-600 to-teal-500',
  },
]

const trustBadges = [
  { icon: Shield, text: 'Lab Tested', subtext: '100% Pure' },
  { icon: Award, text: 'FSSAI Certified', subtext: 'Quality Assured' },
  { icon: Truck, text: 'Free Shipping', subtext: 'Orders ₹999+' },
  { icon: Star, text: '4.9 Rating', subtext: '10K+ Reviews' },
]

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const currentHero = heroSlides[currentSlide]

  return (
    <section ref={containerRef} className="relative min-h-screen overflow-hidden bg-black">
      {/* Background Image with Parallax */}
      <motion.div style={{ y }} className="absolute inset-0 z-0">
        {heroSlides.map((slide, index) => (
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: currentSlide === index ? 1 : 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <Image
              src={slide.image}
              alt="Hero Background"
              fill
              className="object-cover"
              priority={index === 0}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
          </motion.div>
        ))}
      </motion.div>

      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 z-[1] opacity-20">
        <div className="h-full w-full bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
      </div>

      {/* Main Content */}
      <motion.div style={{ opacity }} className="relative z-10 flex min-h-screen items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Left Content */}
            <div className="flex flex-col justify-center pt-20 lg:pt-0">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-6"
              >
                <span
                  className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${currentHero.color} px-4 py-2 text-xs font-bold tracking-wider text-white shadow-lg`}
                >
                  <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                  {currentHero.badge}
                </span>
              </motion.div>

              {/* Title */}
              <motion.div
                key={currentHero.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-6"
              >
                <h1 className="font-[family-name:var(--font-family-antonio)] text-5xl font-black uppercase leading-none tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
                  {currentHero.title}
                  <span
                    className={`block bg-gradient-to-r ${currentHero.color} bg-clip-text text-transparent`}
                  >
                    {currentHero.titleHighlight}
                  </span>
                </h1>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-4 text-xl font-semibold text-white/90 sm:text-2xl"
              >
                {currentHero.subtitle}
              </motion.p>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="mb-8 max-w-lg text-base text-white/70 sm:text-lg"
              >
                {currentHero.description}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-wrap gap-4"
              >
                <Link
                  href={currentHero.ctaLink}
                  className={`group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r ${currentHero.color} px-8 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]`}
                >
                  <span className="relative z-10">{currentHero.cta}</span>
                  <ChevronRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                </Link>

                <button
                  onClick={() => setIsVideoPlaying(true)}
                  className="group inline-flex items-center gap-3 rounded-full border-2 border-white/30 bg-white/5 px-6 py-4 text-sm font-bold uppercase tracking-wider text-white backdrop-blur-sm transition-all duration-300 hover:border-white/60 hover:bg-white/10"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition-transform group-hover:scale-110">
                    <Play className="h-4 w-4 fill-current" />
                  </span>
                  Watch Story
                </button>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mt-12 flex flex-wrap gap-8"
              >
                {[
                  { value: '50K+', label: 'Happy Customers' },
                  { value: '100%', label: 'Natural Ingredients' },
                  { value: '4.9★', label: 'Average Rating' },
                ].map((stat, index) => (
                  <div key={index} className="text-center sm:text-left">
                    <div className="text-2xl font-black text-white sm:text-3xl">{stat.value}</div>
                    <div className="text-xs uppercase tracking-wider text-white/60">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right Side - Product Highlight (Hidden on Mobile) */}
            <div className="hidden lg:flex lg:items-center lg:justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="relative"
              >
                {/* Floating Product Cards - Can be customized */}
                <div className="relative h-[500px] w-[400px]">
                  {/* Glow Effect */}
                  <div className={`absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r ${currentHero.color} opacity-30 blur-[100px]`} />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Slide Indicators */}
      <div className="absolute bottom-32 left-1/2 z-20 flex -translate-x-1/2 gap-3 lg:bottom-40">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              currentSlide === index
                ? 'w-12 bg-white'
                : 'w-2 bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>

      {/* Trust Badges Bar */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="absolute bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-black/50 backdrop-blur-xl"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 divide-x divide-white/10 sm:grid-cols-4">
            {trustBadges.map((badge, index) => (
              <div
                key={index}
                className="flex items-center justify-center gap-3 py-5 transition-colors hover:bg-white/5"
              >
                <badge.icon className="h-6 w-6 text-[#1B198F] sm:h-7 sm:w-7" />
                <div className="text-left">
                  <div className="text-xs font-bold uppercase tracking-wider text-white sm:text-sm">
                    {badge.text}
                  </div>
                  <div className="text-xs text-white/60">{badge.subtext}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Video Modal */}
      {isVideoPlaying && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setIsVideoPlaying(false)}
        >
          <div className="relative aspect-video w-full max-w-4xl mx-4">
            <button
              onClick={() => setIsVideoPlaying(false)}
              className="absolute -top-12 right-0 text-white hover:text-white/80"
            >
              Close ✕
            </button>
            <div className="flex h-full items-center justify-center rounded-2xl bg-neutral-900 text-white">
              <p>Video Player Placeholder</p>
            </div>
          </div>
        </motion.div>
      )}
    </section>
  )
}
