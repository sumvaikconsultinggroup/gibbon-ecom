'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  ChevronLeft, 
  ChevronRight,
  Heart,
  Share2,
  ShoppingBag,
  Eye,
  X,
  ExternalLink
} from 'lucide-react'

interface ProductTag {
  productId: string
  productHandle: string
  productName: string
  productPrice: number
  productImage: string
  position?: { x: number; y: number }
}

interface VideoReel {
  id: string
  title: string
  description?: string
  videoUrl: string
  thumbnailUrl?: string
  duration?: number
  aspectRatio?: '9:16' | '16:9' | '1:1' | '4:5'
  products: ProductTag[]
  influencer?: {
    name: string
    handle?: string
    avatarUrl?: string
    profileUrl?: string
  }
  stats: {
    views: number
    likes: number
    shares: number
  }
  isFeatured: boolean
  autoPlay: boolean
}

interface VideoReelsSectionProps {
  initialVideos?: VideoReel[]
}

export default function VideoReelsSection({ initialVideos = [] }: VideoReelsSectionProps) {
  const [videos, setVideos] = useState<VideoReel[]>(initialVideos)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [showProducts, setShowProducts] = useState(false)
  const [isLoading, setIsLoading] = useState(initialVideos.length === 0)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch videos on mount
  useEffect(() => {
    if (initialVideos.length === 0) {
      fetchVideos()
    }
  }, [initialVideos.length])

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/videos?limit=10')
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.videos) {
          setVideos(data.videos)
          // Auto-select first featured or first video
          const featuredIndex = data.videos.findIndex((v: VideoReel) => v.isFeatured || v.autoPlay)
          if (featuredIndex >= 0) setSelectedIndex(featuredIndex)
        }
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Track video view
  const trackView = useCallback(async (videoId: string) => {
    try {
      await fetch(`/api/videos/${videoId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'view' }),
      })
    } catch {}
  }, [])

  // Handle video selection
  const selectVideo = useCallback((index: number) => {
    // Pause all videos
    videoRefs.current.forEach((video, i) => {
      if (video && i !== index) {
        video.pause()
        video.currentTime = 0
      }
    })
    
    setSelectedIndex(index)
    setShowProducts(false)
    
    // Auto play selected video
    const selectedVideo = videoRefs.current[index]
    if (selectedVideo) {
      selectedVideo.play().catch(() => {})
      setIsPlaying(true)
      trackView(videos[index].id)
    }
  }, [videos, trackView])

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    const video = videoRefs.current[selectedIndex]
    if (video) {
      if (isPlaying) {
        video.pause()
      } else {
        video.play().catch(() => {})
      }
      setIsPlaying(!isPlaying)
    }
  }, [selectedIndex, isPlaying])

  // Toggle mute
  const toggleMute = useCallback(() => {
    videoRefs.current.forEach(video => {
      if (video) video.muted = !isMuted
    })
    setIsMuted(!isMuted)
  }, [isMuted])

  // Navigate videos
  const navigate = useCallback((direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? (selectedIndex - 1 + videos.length) % videos.length
      : (selectedIndex + 1) % videos.length
    selectVideo(newIndex)
  }, [selectedIndex, videos.length, selectVideo])

  // Auto-play on intersection
  useEffect(() => {
    const video = videoRefs.current[selectedIndex]
    if (video && videos[selectedIndex]?.autoPlay) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {})
            setIsPlaying(true)
          } else {
            video.pause()
            setIsPlaying(false)
          }
        },
        { threshold: 0.5 }
      )
      observer.observe(video)
      return () => observer.disconnect()
    }
  }, [selectedIndex, videos])

  // Format numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  if (isLoading) {
    return (
      <section className="py-12 md:py-16 bg-neutral-950">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-[500px]">
            <div className="h-10 w-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        </div>
      </section>
    )
  }

  if (videos.length === 0) {
    return null
  }

  const selectedVideo = videos[selectedIndex]

  return (
    <section className="py-12 md:py-16 bg-neutral-950 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="font-[family-name:var(--font-family-antonio)] text-2xl md:text-3xl lg:text-4xl font-bold text-white uppercase tracking-wider">
            Discover Your Expression
          </h2>
          <p className="mt-2 text-neutral-400 text-sm md:text-base">
            Shop the looks from our community
          </p>
        </div>

        {/* Main Video Container */}
        <div className="relative" ref={containerRef}>
          {/* Video Carousel */}
          <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {videos.map((video, index) => (
              <motion.div
                key={video.id}
                className={`relative flex-shrink-0 snap-center cursor-pointer transition-all duration-300 ${
                  index === selectedIndex 
                    ? 'w-[280px] md:w-[320px] lg:w-[360px]' 
                    : 'w-[180px] md:w-[200px] lg:w-[220px] opacity-60 hover:opacity-80'
                }`}
                onClick={() => selectVideo(index)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Video Container */}
                <div 
                  className={`relative rounded-2xl overflow-hidden bg-neutral-800 ${
                    index === selectedIndex ? 'aspect-[9/16]' : 'aspect-[9/16]'
                  }`}
                >
                  {/* Video Element */}
                  <video
                    ref={el => { videoRefs.current[index] = el }}
                    src={video.videoUrl}
                    poster={video.thumbnailUrl}
                    className="absolute inset-0 w-full h-full object-cover"
                    loop
                    muted={isMuted}
                    playsInline
                    preload="metadata"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                  {/* Play Indicator for non-selected */}
                  {index !== selectedIndex && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Selected Video Controls */}
                  {index === selectedIndex && (
                    <>
                      {/* Top Controls */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                        {/* Mute Button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleMute() }}
                          className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
                        >
                          {isMuted ? (
                            <VolumeX className="w-4 h-4 text-white" />
                          ) : (
                            <Volume2 className="w-4 h-4 text-white" />
                          )}
                        </button>

                        {/* Featured Badge */}
                        {video.isFeatured && (
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full">
                            Featured
                          </span>
                        )}
                      </div>

                      {/* Center Play/Pause */}
                      <button
                        onClick={(e) => { e.stopPropagation(); togglePlay() }}
                        className="absolute inset-0 flex items-center justify-center z-10"
                      >
                        <AnimatePresence>
                          {!isPlaying && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.5 }}
                              className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                            >
                              <Play className="w-8 h-8 text-white fill-white ml-1" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </button>

                      {/* Influencer Info */}
                      {video.influencer && (
                        <div className="absolute top-14 left-3 right-3 z-10">
                          <div className="flex items-center gap-2">
                            {video.influencer.avatarUrl && (
                              <Image
                                src={video.influencer.avatarUrl}
                                alt={video.influencer.name}
                                width={32}
                                height={32}
                                className="rounded-full border-2 border-white/30"
                              />
                            )}
                            <div>
                              <p className="text-white text-sm font-semibold">{video.influencer.name}</p>
                              {video.influencer.handle && (
                                <p className="text-white/60 text-xs">@{video.influencer.handle}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Stats */}
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-10">
                        <button className="flex flex-col items-center gap-1 text-white hover:text-red-400 transition-colors">
                          <Heart className="w-6 h-6" />
                          <span className="text-xs">{formatNumber(video.stats.likes)}</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 text-white hover:text-blue-400 transition-colors">
                          <Share2 className="w-6 h-6" />
                          <span className="text-xs">{formatNumber(video.stats.shares)}</span>
                        </button>
                        <div className="flex flex-col items-center gap-1 text-white/60">
                          <Eye className="w-5 h-5" />
                          <span className="text-xs">{formatNumber(video.stats.views)}</span>
                        </div>
                      </div>

                      {/* Product Tags Button */}
                      {video.products.length > 0 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowProducts(!showProducts) }}
                          className="absolute bottom-20 left-3 px-3 py-1.5 rounded-full bg-white text-black text-xs font-semibold flex items-center gap-1.5 hover:bg-neutral-100 transition-colors z-10"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          Shop {video.products.length} Products
                        </button>
                      )}
                    </>
                  )}

                  {/* Bottom Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                    {index === selectedIndex && video.title && (
                      <p className="text-white text-sm font-medium line-clamp-2 mb-2">
                        {video.title}
                      </p>
                    )}
                  </div>
                </div>

                {/* Product Cards for Selected Video */}
                <AnimatePresence>
                  {index === selectedIndex && showProducts && video.products.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="absolute bottom-0 left-0 right-0 translate-y-full pt-3 z-20"
                    >
                      <div className="bg-white rounded-xl shadow-2xl max-h-[300px] overflow-y-auto">
                        <div className="p-3 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white">
                          <span className="text-sm font-semibold text-neutral-900">Tagged Products</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setShowProducts(false) }}
                            className="p-1 hover:bg-neutral-100 rounded-full"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="p-2 space-y-2">
                          {video.products.map((product, pIndex) => (
                            <Link
                              key={pIndex}
                              href={`/products/${product.productHandle}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 transition-colors group"
                            >
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                                {product.productImage ? (
                                  <Image
                                    src={product.productImage}
                                    alt={product.productName}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ShoppingBag className="w-6 h-6 text-neutral-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-neutral-900 line-clamp-1 uppercase">
                                  {product.productName}
                                </p>
                                <p className="text-sm text-neutral-600 mt-0.5">
                                  INR. {product.productPrice.toLocaleString()}
                                </p>
                              </div>
                              <ExternalLink className="w-4 h-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={() => navigate('prev')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors z-20 hidden md:flex"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => navigate('next')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors z-20 hidden md:flex"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>

          {/* Mobile Navigation Dots */}
          <div className="flex justify-center gap-1.5 mt-4 md:hidden">
            {videos.map((_, index) => (
              <button
                key={index}
                onClick={() => selectVideo(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === selectedIndex 
                    ? 'w-6 bg-white' 
                    : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  )
}
