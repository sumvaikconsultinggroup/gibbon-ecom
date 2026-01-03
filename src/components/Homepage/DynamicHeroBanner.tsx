'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Banner {
  _id: string
  title: string
  subtitle?: string
  description?: string
  buttonText?: string
  buttonLink?: string
  image: { desktop: string; mobile?: string; alt: string }
  overlay?: { enabled: boolean; color: string; opacity: number }
  textPosition: 'left' | 'center' | 'right'
  textColor: string
}

interface DynamicHeroBannerProps {
  banners: Banner[]
  autoplayInterval?: number
}

export default function DynamicHeroBanner({ banners, autoplayInterval = 5000 }: DynamicHeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }, [banners.length])

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }, [banners.length])

  useEffect(() => {
    if (banners.length <= 1 || isPaused) return
    
    const interval = setInterval(goToNext, autoplayInterval)
    return () => clearInterval(interval)
  }, [banners.length, isPaused, autoplayInterval, goToNext])

  if (!banners || banners.length === 0) {
    return null
  }

  const currentBanner = banners[currentIndex]

  const getTextPositionClasses = (position: string) => {
    switch (position) {
      case 'center':
        return 'items-center text-center'
      case 'right':
        return 'items-end text-right'
      default:
        return 'items-start text-left'
    }
  }

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Banner */}
      <div className="relative aspect-[16/9] sm:aspect-[16/7] lg:aspect-[16/6]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner._id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            {/* Desktop Image */}
            <Image
              src={currentBanner.image.desktop}
              alt={currentBanner.image.alt || currentBanner.title}
              fill
              className="object-cover hidden sm:block"
              priority={currentIndex === 0}
              sizes="100vw"
            />
            {/* Mobile Image */}
            <Image
              src={currentBanner.image.mobile || currentBanner.image.desktop}
              alt={currentBanner.image.alt || currentBanner.title}
              fill
              className="object-cover sm:hidden"
              priority={currentIndex === 0}
              sizes="100vw"
            />

            {/* Overlay */}
            {currentBanner.overlay?.enabled && (
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: currentBanner.overlay.color,
                  opacity: currentBanner.overlay.opacity
                }}
              />
            )}

            {/* Content */}
            <div className={`absolute inset-0 flex flex-col justify-center p-6 sm:p-10 lg:p-16 ${getTextPositionClasses(currentBanner.textPosition)}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="max-w-2xl"
              >
                {currentBanner.subtitle && (
                  <span
                    className="mb-2 block text-sm font-medium uppercase tracking-wider opacity-90 sm:text-base"
                    style={{ color: currentBanner.textColor }}
                  >
                    {currentBanner.subtitle}
                  </span>
                )}
                <h2
                  className="text-2xl font-bold leading-tight sm:text-4xl lg:text-5xl xl:text-6xl"
                  style={{ color: currentBanner.textColor }}
                >
                  {currentBanner.title}
                </h2>
                {currentBanner.description && (
                  <p
                    className="mt-3 text-sm opacity-90 sm:mt-4 sm:text-base lg:text-lg"
                    style={{ color: currentBanner.textColor }}
                  >
                    {currentBanner.description}
                  </p>
                )}
                {currentBanner.buttonText && currentBanner.buttonLink && (
                  <Link
                    href={currentBanner.buttonLink}
                    className="mt-4 inline-block rounded-lg bg-white px-6 py-3 text-sm font-semibold text-neutral-900 shadow-lg transition-all hover:bg-neutral-100 hover:shadow-xl sm:mt-6 sm:px-8 sm:py-4 sm:text-base"
                  >
                    {currentBanner.buttonText}
                  </Link>
                )}
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
            aria-label="Previous banner"
          >
            <ChevronLeft className="h-5 w-5 text-neutral-900" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
            aria-label="Next banner"
          >
            <ChevronRight className="h-5 w-5 text-neutral-900" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
