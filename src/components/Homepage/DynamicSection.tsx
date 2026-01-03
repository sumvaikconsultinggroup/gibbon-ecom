'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import useEmblaCarousel from 'embla-carousel-react'
import { useCarouselArrowButtons } from '@/hooks/use-carousel-arrow-buttons'
import Image from 'next/image'

interface Product {
  _id: string
  title: string
  handle: string
  images?: { src: string }[]
  variants?: { price: number; compareAtPrice?: number }[]
  price?: number
  compareAtPrice?: number
}

interface Section {
  _id: string
  name: string
  type: string
  title?: string
  subtitle?: string
  products: Product[]
  productLimit: number
  layout: {
    columns: number
    columnsTablet?: number
    columnsMobile?: number
    gap?: number
    showViewAll?: boolean
    viewAllLink?: string
  }
  style: {
    backgroundColor?: string
    textColor?: string
    paddingTop?: number
    paddingBottom?: number
    fullWidth?: boolean
    darkMode?: boolean
  }
  banner?: {
    image: string
    mobileImage?: string
    alt?: string
    link?: string
    height?: number
  }
  showOnDesktop: boolean
  showOnMobile: boolean
}

interface DynamicSectionProps {
  section: Section
}

export default function DynamicSection({ section }: DynamicSectionProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ slidesToScroll: 'auto' })
  const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } = useCarouselArrowButtons(emblaApi)

  // Visibility classes
  const visibilityClass = 
    !section.showOnDesktop && section.showOnMobile ? 'lg:hidden' :
    section.showOnDesktop && !section.showOnMobile ? 'hidden lg:block' : ''

  // Grid columns based on layout settings
  const getGridCols = () => {
    const cols = section.layout.columns || 4
    const tabletCols = section.layout.columnsTablet || 3
    const mobileCols = section.layout.columnsMobile || 2
    
    return `grid-cols-${mobileCols} md:grid-cols-${tabletCols} lg:grid-cols-${cols}`
  }

  const renderSectionHeader = () => (
    <div className="mb-8 flex items-end justify-between">
      <div>
        {section.title && (
          <h2
            className="text-2xl font-bold sm:text-3xl lg:text-4xl"
            style={{ color: section.style.textColor }}
          >
            {section.title}
          </h2>
        )}
        {section.subtitle && (
          <p
            className="mt-2 text-sm opacity-70 sm:text-base"
            style={{ color: section.style.textColor }}
          >
            {section.subtitle}
          </p>
        )}
      </div>
      {section.layout.showViewAll && section.layout.viewAllLink && (
        <Link
          href={section.layout.viewAllLink}
          className="flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80 sm:text-base"
          style={{ color: section.style.textColor }}
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  )

  // Product Grid Section
  if (section.type === 'product-grid') {
    return (
      <section
        className={`${visibilityClass}`}
        style={{
          backgroundColor: section.style.backgroundColor,
          paddingTop: section.style.paddingTop,
          paddingBottom: section.style.paddingBottom
        }}
      >
        <div className={section.style.fullWidth ? 'w-full px-4' : 'container mx-auto px-4'}>
          {renderSectionHeader()}
          <div
            className="grid gap-4 sm:gap-6"
            style={{
              gridTemplateColumns: `repeat(${section.layout.columnsMobile || 2}, minmax(0, 1fr))`,
              gap: section.layout.gap
            }}
          >
            {section.products?.slice(0, section.productLimit).map((product) => (
              <ProductCard key={product._id} data={product} />
            ))}
          </div>
          {/* Responsive grid override */}
          <style jsx>{`
            @media (min-width: 768px) {
              .grid {
                grid-template-columns: repeat(${section.layout.columnsTablet || 3}, minmax(0, 1fr));
              }
            }
            @media (min-width: 1024px) {
              .grid {
                grid-template-columns: repeat(${section.layout.columns || 4}, minmax(0, 1fr));
              }
            }
          `}</style>
        </div>
      </section>
    )
  }

  // Product Carousel Section
  if (section.type === 'product-carousel') {
    return (
      <section
        className={`${visibilityClass}`}
        style={{
          backgroundColor: section.style.backgroundColor,
          paddingTop: section.style.paddingTop,
          paddingBottom: section.style.paddingBottom
        }}
      >
        <div className={section.style.fullWidth ? 'w-full px-4' : 'container mx-auto px-4'}>
          {renderSectionHeader()}
          <div className="overflow-hidden">
            <div className="embla" ref={emblaRef}>
              <div className="embla__container -ms-4">
                {section.products?.slice(0, section.productLimit).map((product) => (
                  <div
                    key={product._id}
                    className="embla__slide ps-4 basis-[80%] sm:basis-[45%] md:basis-[33.333%] lg:basis-[25%]"
                  >
                    <ProductCard data={product} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Carousel Navigation */}
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={onPrevButtonClick}
              disabled={prevBtnDisabled}
              className="rounded-full border border-neutral-300 p-2 transition-colors hover:bg-neutral-100 disabled:opacity-30"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={onNextButtonClick}
              disabled={nextBtnDisabled}
              className="rounded-full border border-neutral-300 p-2 transition-colors hover:bg-neutral-100 disabled:opacity-30"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>
    )
  }

  // Banner Strip Section
  if (section.type === 'banner-strip' && section.banner?.image) {
    const bannerContent = (
      <div
        className={`relative overflow-hidden rounded-2xl ${visibilityClass}`}
        style={{
          height: section.banner.height || 400,
          marginTop: section.style.paddingTop,
          marginBottom: section.style.paddingBottom
        }}
      >
        <Image
          src={section.banner.image}
          alt={section.banner.alt || section.name}
          fill
          className="object-cover hidden sm:block"
        />
        {section.banner.mobileImage && (
          <Image
            src={section.banner.mobileImage}
            alt={section.banner.alt || section.name}
            fill
            className="object-cover sm:hidden"
          />
        )}
        {!section.banner.mobileImage && (
          <Image
            src={section.banner.image}
            alt={section.banner.alt || section.name}
            fill
            className="object-cover sm:hidden"
          />
        )}
        {/* Text Overlay */}
        {section.title && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="text-center text-white">
              <h2 className="text-2xl font-bold sm:text-4xl lg:text-5xl">{section.title}</h2>
              {section.subtitle && (
                <p className="mt-2 text-sm opacity-90 sm:text-base lg:text-lg">{section.subtitle}</p>
              )}
            </div>
          </div>
        )}
      </div>
    )

    return (
      <div className={section.style.fullWidth ? 'w-full' : 'container mx-auto px-4'}>
        {section.banner.link ? (
          <Link href={section.banner.link}>{bannerContent}</Link>
        ) : (
          bannerContent
        )}
      </div>
    )
  }

  // Featured Collection Section (similar to product grid with special styling)
  if (section.type === 'featured-collection') {
    return (
      <section
        className={`${visibilityClass}`}
        style={{
          backgroundColor: section.style.backgroundColor,
          paddingTop: section.style.paddingTop,
          paddingBottom: section.style.paddingBottom
        }}
      >
        <div className={section.style.fullWidth ? 'w-full px-4' : 'container mx-auto px-4'}>
          <div className="mb-10 text-center">
            {section.title && (
              <h2
                className="text-2xl font-bold sm:text-3xl lg:text-4xl"
                style={{ color: section.style.textColor }}
              >
                {section.title}
              </h2>
            )}
            {section.subtitle && (
              <p
                className="mx-auto mt-3 max-w-2xl text-sm opacity-70 sm:text-base"
                style={{ color: section.style.textColor }}
              >
                {section.subtitle}
              </p>
            )}
          </div>
          <div
            className="grid gap-4 sm:gap-6"
            style={{
              gridTemplateColumns: `repeat(${section.layout.columnsMobile || 2}, minmax(0, 1fr))`,
              gap: section.layout.gap
            }}
          >
            {section.products?.slice(0, section.productLimit).map((product) => (
              <ProductCard key={product._id} data={product} />
            ))}
          </div>
          {section.layout.showViewAll && section.layout.viewAllLink && (
            <div className="mt-10 flex justify-center">
              <Link
                href={section.layout.viewAllLink}
                className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-8 py-4 font-semibold text-white transition-colors hover:bg-neutral-800"
              >
                View Full Collection
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          )}
        </div>
      </section>
    )
  }

  // Text Block Section
  if (section.type === 'text-block') {
    return (
      <section
        className={`${visibilityClass}`}
        style={{
          backgroundColor: section.style.backgroundColor,
          paddingTop: section.style.paddingTop,
          paddingBottom: section.style.paddingBottom
        }}
      >
        <div className={section.style.fullWidth ? 'w-full px-4' : 'container mx-auto px-4'}>
          <div className="mx-auto max-w-3xl text-center">
            {section.title && (
              <h2
                className="text-2xl font-bold sm:text-3xl lg:text-4xl"
                style={{ color: section.style.textColor }}
              >
                {section.title}
              </h2>
            )}
            {section.subtitle && (
              <p
                className="mt-4 text-base leading-relaxed opacity-80 sm:text-lg"
                style={{ color: section.style.textColor }}
              >
                {section.subtitle}
              </p>
            )}
          </div>
        </div>
      </section>
    )
  }

  // Default fallback - render nothing for unsupported types
  return null
}
