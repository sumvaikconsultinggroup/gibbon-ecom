'use client'

import { motion } from 'framer-motion'
import { Zap, Flame, Award, Star, Shield } from 'lucide-react'

const marqueeItems = [
  { text: 'FREE SHIPPING ON ₹999+', icon: Zap },
  { text: '100% AUTHENTIC PRODUCTS', icon: Shield },
  { text: 'LAB TESTED & CERTIFIED', icon: Award },
  { text: '50,000+ HAPPY CUSTOMERS', icon: Star },
  { text: 'MADE IN INDIA', icon: Flame },
  { text: 'EASY RETURNS', icon: Zap },
  { text: 'SECURE PAYMENTS', icon: Shield },
  { text: 'PREMIUM QUALITY', icon: Award },
]

export default function MarqueeBanner({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-[#1B198F] py-3 ${className}`}>
      {/* Gradient Edges */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-[#1B198F] to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-[#1B198F] to-transparent" />

      <div className="flex">
        <motion.div
          animate={{ x: [0, -2000] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: 30,
              ease: 'linear',
            },
          }}
          className="flex shrink-0 items-center gap-8"
        >
          {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, index) => (
            <div
              key={index}
              className="flex shrink-0 items-center gap-2 text-sm font-bold uppercase tracking-wider text-white"
            >
              <item.icon className="h-4 w-4 text-yellow-400" />
              <span>{item.text}</span>
              <span className="ml-6 text-yellow-400">★</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
