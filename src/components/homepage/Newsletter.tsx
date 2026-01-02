'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Send, Gift, Zap, Percent, CheckCircle } from 'lucide-react'
import Image from 'next/image'

const benefits = [
  { icon: Percent, text: 'Exclusive discounts up to 30% off' },
  { icon: Gift, text: 'Early access to new launches' },
  { icon: Zap, text: 'Flash sale notifications' },
]

export default function Newsletter({ className = '' }: { className?: string }) {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    setIsSubmitted(true)
  }

  return (
    <section className={`relative overflow-hidden bg-[#1B198F] py-20 lg:py-28 ${className}`}>
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute -left-20 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-white/5 blur-[100px]" />
        <div className="absolute -right-20 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-purple-500/20 blur-[100px]" />
        {/* Animated Circles */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute left-1/4 top-1/4 h-40 w-40 rounded-full border border-white/10"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute right-1/4 bottom-1/4 h-60 w-60 rounded-full border border-white/10"
        />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white">
              <Gift className="h-4 w-4" />
              Get 10% OFF Your First Order
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-4 font-[family-name:var(--font-family-antonio)] text-4xl font-black uppercase text-white sm:text-5xl lg:text-6xl"
          >
            Join the <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Gibbon Gang</span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8 text-lg text-white/70"
          >
            Subscribe for exclusive deals, fitness tips, and be the first to know about new products.
          </motion.p>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full rounded-full bg-white/10 px-6 py-4 text-white placeholder-white/50 outline-none ring-2 ring-transparent transition-all focus:bg-white/15 focus:ring-white/30"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-bold uppercase tracking-wider text-[#1B198F] transition-all hover:bg-yellow-400 hover:text-black disabled:opacity-70"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Subscribing...
                    </span>
                  ) : (
                    <>
                      Subscribe
                      <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mx-auto flex max-w-md items-center justify-center gap-3 rounded-2xl bg-green-500/20 p-6 text-green-300"
              >
                <CheckCircle className="h-6 w-6" />
                <span className="text-lg font-semibold">You're in! Check your email for your 10% discount code.</span>
              </motion.div>
            )}
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-6"
          >
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-white/70">
                <benefit.icon className="h-4 w-4 text-yellow-400" />
                <span>{benefit.text}</span>
              </div>
            ))}
          </motion.div>

          {/* Privacy Note */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-6 text-xs text-white/40"
          >
            By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
          </motion.p>
        </div>
      </div>
    </section>
  )
}
