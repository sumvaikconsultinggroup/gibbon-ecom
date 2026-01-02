'use client'

import { motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { Play, Pause, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react'

const reels = [
  {
    id: 1,
    video: '/videos/reel-1.mp4',
    title: 'Morning Pre-Workout Routine',
    views: '125K',
    likes: '8.2K',
  },
  {
    id: 2,
    video: '/videos/reel-2.mp4',
    title: 'Post-Workout Protein Shake',
    views: '98K',
    likes: '6.1K',
  },
  {
    id: 3,
    video: '/videos/reel-3.mp4',
    title: 'Supplement Stack Guide',
    views: '156K',
    likes: '12K',
  },
  {
    id: 4,
    video: '/videos/reel-1.mp4',
    title: 'BCAA During Workout',
    views: '87K',
    likes: '5.4K',
  },
  {
    id: 5,
    video: '/videos/reel-2.mp4',
    title: 'Creatine Loading Phase',
    views: '112K',
    likes: '7.8K',
  },
]

export default function VideoReels({ className = '' }: { className?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [playingVideo, setPlayingVideo] = useState<number | null>(null)
  const [mutedVideos, setMutedVideos] = useState<Set<number>>(new Set([1, 2, 3, 4, 5]))
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({})

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  const togglePlay = (id: number) => {
    const video = videoRefs.current[id]
    if (!video) return

    if (playingVideo === id) {
      video.pause()
      setPlayingVideo(null)
    } else {
      // Pause all other videos
      Object.values(videoRefs.current).forEach((v) => v?.pause())
      video.play()
      setPlayingVideo(id)
    }
  }

  const toggleMute = (id: number) => {
    const newMuted = new Set(mutedVideos)
    if (newMuted.has(id)) {
      newMuted.delete(id)
    } else {
      newMuted.add(id)
    }
    setMutedVideos(newMuted)
  }

  return (
    <section className={`relative overflow-hidden bg-white py-20 lg:py-32 dark:bg-neutral-900 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-2 inline-block text-sm font-bold uppercase tracking-wider text-[#1B198F]">
              📱 Gibbon Community
            </span>
            <h2 className="font-[family-name:var(--font-family-antonio)] text-4xl font-black uppercase text-neutral-900 sm:text-5xl dark:text-white">
              Watch & Learn
            </h2>
            <p className="mt-2 max-w-md text-neutral-600 dark:text-neutral-400">
              Tips, tutorials, and transformation stories from our community
            </p>
          </motion.div>

          {/* Navigation */}
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-neutral-200 bg-white text-neutral-700 transition-all hover:border-[#1B198F] hover:bg-[#1B198F] hover:text-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-neutral-200 bg-white text-neutral-700 transition-all hover:border-[#1B198F] hover:bg-[#1B198F] hover:text-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Reels Carousel */}
        <div
          ref={scrollRef}
          className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {reels.map((reel, index) => (
            <motion.div
              key={reel.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative w-[220px] flex-shrink-0 sm:w-[260px]"
              style={{ scrollSnapAlign: 'start' }}
            >
              <div className="group relative aspect-[9/16] overflow-hidden rounded-2xl bg-neutral-900">
                {/* Video */}
                <video
                  ref={(el) => { videoRefs.current[reel.id] = el }}
                  src={reel.video}
                  loop
                  muted={mutedVideos.has(reel.id)}
                  playsInline
                  className="h-full w-full object-cover"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                {/* Play/Pause Button */}
                <button
                  onClick={() => togglePlay(reel.id)}
                  className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-white/30"
                >
                  {playingVideo === reel.id ? (
                    <Pause className="h-6 w-6 fill-current" />
                  ) : (
                    <Play className="h-6 w-6 fill-current" />
                  )}
                </button>

                {/* Mute Button */}
                <button
                  onClick={() => toggleMute(reel.id)}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white transition-all hover:bg-black/60"
                >
                  {mutedVideos.has(reel.id) ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>

                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="mb-2 text-sm font-bold text-white">{reel.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-white/70">
                    <span>👁 {reel.views}</span>
                    <span>❤️ {reel.likes}</span>
                  </div>
                </div>

                {/* Instagram-style Progress Bar (when playing) */}
                {playingVideo === reel.id && (
                  <div className="absolute left-0 right-0 top-0 h-1 bg-white/20">
                    <motion.div
                      className="h-full bg-white"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 15, ease: 'linear', repeat: Infinity }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Follow CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <a
            href="https://www.instagram.com/gibbonnutrition/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition-all hover:scale-105"
          >
            Follow @gibbonnutrition
          </a>
        </motion.div>
      </div>
    </section>
  )
}
