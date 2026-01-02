'use client'

import { X, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const announcements = [
  {
    text: '🔥 FLASH SALE: Get 20% OFF on all Whey Protein!',
    link: '/collections/whey-protein',
    cta: 'Shop Now',
  },
  {
    text: '🚚 Free Shipping on orders above ₹999',
    link: '/collections/all',
    cta: 'Shop All',
  },
  {
    text: '⭐ New Launch: JOLT 2.0 Pre-Workout is here!',
    link: '/products/jolt',
    cta: 'Try Now',
  },
]

export default function TopBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  if (!isVisible) return null

  const current = announcements[currentIndex]

  return (
    <div className="relative bg-[#1B198F] py-2.5">
      <div className="container mx-auto flex items-center justify-center px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 text-center"
          >
            <span className="text-sm font-medium text-white">{current.text}</span>
            <Link
              href={current.link}
              className="group inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-white hover:text-[#1B198F]"
            >
              {current.cta}
              <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* Indicators */}
        <div className="absolute left-1/2 bottom-0.5 flex -translate-x-1/2 gap-1">
          {announcements.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1 rounded-full transition-all ${
                currentIndex === index ? 'w-4 bg-white' : 'w-1 bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Close Button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 transition-colors hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
