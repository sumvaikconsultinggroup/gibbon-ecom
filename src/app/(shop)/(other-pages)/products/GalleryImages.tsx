'use client'

import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import Image from 'next/image'
import { useState } from 'react'
import GallerySlider from './GallerySlider'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Navigation } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import clsx from 'clsx'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

const BACKGROUND_COLORS = [
  '#E3F2FD', // Light Blue 50
  '#BBDEFB', // Light Blue 100
  '#90CAF9', // Light Blue 300
  '#64B5F6', // Light Blue 400
  '#42A5F5', // Light Blue 500
  '#2196F3', // Light Blue 600
]

const OnPageProductSlider = ({
  images,
  handleOpenDialog,
}: {
  images: string[]
  handleOpenDialog: (index: number) => void
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null)

  // Generate random background colors for each image
  const [backgroundColors] = useState(() => 
    images.map(() => BACKGROUND_COLORS[Math.floor(Math.random() * BACKGROUND_COLORS.length)])
  )

  return (
    <div className="relative overflow-hidden">
      <Swiper
        modules={[Pagination, Navigation]}
        slidesPerView={1.2}
        spaceBetween={16}
        loop={true}
        onSwiper={setSwiperInstance}
        onSlideChange={(swiper) => setSelectedIndex(swiper.realIndex)}
        className="rounded-none"
      >
        {images.map((src, index) => (
          <SwiperSlide key={index}>
            <div
              className="relative aspect-3/4 cursor-pointer sm:aspect-[3/4.5] md:h-[500px] lg:h-[700px] lg:aspect-auto"
              onClick={() => handleOpenDialog(index)}
            >
              <div 
                className="relative w-full h-full rounded-none overflow-hidden shadow-lg"
                style={{ backgroundColor: backgroundColors[index] }}
              >
                <Image
                  src={src}
                  fill
                  alt="product image"
                  className="cursor-pointer object-contain p-2"
                />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      
      {/* Dot indicators */}
      <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => swiperInstance?.slideToLoop(index)}
            className={clsx(
              'rounded-full transition-all duration-300',
              {
                'w-8 h-2 bg-primary-600': index === selectedIndex,
                'w-2 h-2 bg-gray-400': index !== selectedIndex,
              }
            )}
          />
        ))}
      </div>
    </div>
  )
}

interface Props {
  images: string[]
  className?: string
  // The gridType prop is no longer used, but we keep it to avoid breaking page.jsx for now
  gridType?: 'grid1' | 'grid2' | 'grid3' | 'grid4' | 'grid5'
}

const GalleryImages = ({ images, className }: Props) => {
  let [isOpen, setIsOpen] = useState(false)
  let [startIndex, setStartIndex] = useState(0)

  const handleOpenDialog = (index = 0) => {
    setStartIndex(index)
    setIsOpen(true)
  }

  return (
    <>
      <div className={className}>
        <OnPageProductSlider images={images} handleOpenDialog={handleOpenDialog} />
      </div>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black/70" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel
            className="relative mx-auto h-full w-full max-w-7xl"
          >
            <GallerySlider images={images} option={{ startIndex, slidesToScroll: 1 }} />
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}

export default GalleryImages