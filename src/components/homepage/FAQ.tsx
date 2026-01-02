'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ChevronDown, MessageCircle, Phone, Mail } from 'lucide-react'
import Image from 'next/image'

const faqs = [
  {
    question: 'Are Gibbon products lab-tested and certified?',
    answer: 'Yes, all our products undergo rigorous third-party testing for purity, potency, and banned substances. We are FSSAI certified and manufacture in GMP-compliant facilities. Every product comes with a QR code for authenticity verification.',
    category: 'Quality',
  },
  {
    question: 'How do I verify if my product is authentic?',
    answer: 'Each Gibbon product has a unique QR code on the packaging. Simply scan it with your phone camera to verify authenticity instantly. You\'ll see the product details, batch number, and manufacturing date.',
    category: 'Quality',
  },
  {
    question: 'What is your return and refund policy?',
    answer: 'We offer a 7-day return policy for unopened products. If you\'re not satisfied with your purchase, contact our support team within 7 days of delivery. Opened products can be returned only if there\'s a quality issue.',
    category: 'Orders',
  },
  {
    question: 'How long does shipping take?',
    answer: 'We offer free shipping on orders above ₹999. Standard delivery takes 3-5 business days across India. Metro cities typically receive orders within 2-3 days. Express shipping is available at checkout for faster delivery.',
    category: 'Shipping',
  },
  {
    question: 'Can I take multiple supplements together?',
    answer: 'Yes, most of our supplements can be stacked together. For best results, we recommend: Whey Protein post-workout, Pre-workout before training, BCAAs during workout, and vitamins with meals. Always consult a healthcare professional if you have any concerns.',
    category: 'Usage',
  },
  {
    question: 'Are your products vegetarian/vegan friendly?',
    answer: 'Many of our products are vegetarian-friendly. Each product page clearly indicates whether it\'s vegetarian, vegan, or contains animal-derived ingredients. Our Plant Protein line is 100% vegan.',
    category: 'Products',
  },
  {
    question: 'How should I store my supplements?',
    answer: 'Store all supplements in a cool, dry place away from direct sunlight. Keep the container tightly sealed after each use. Avoid storing in humid areas like bathrooms. Most products have a shelf life of 2 years from manufacturing.',
    category: 'Usage',
  },
  {
    question: 'Do you offer international shipping?',
    answer: 'Currently, we ship only within India. We\'re working on expanding to international markets soon. Sign up for our newsletter to be notified when we launch international shipping.',
    category: 'Shipping',
  },
]

const categories = ['All', 'Quality', 'Orders', 'Shipping', 'Usage', 'Products']

export default function FAQ({ className = '' }: { className?: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const [activeCategory, setActiveCategory] = useState('All')

  const filteredFaqs = activeCategory === 'All' 
    ? faqs 
    : faqs.filter(faq => faq.category === activeCategory)

  return (
    <section className={`relative overflow-hidden bg-white py-20 lg:py-32 dark:bg-neutral-900 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left Column - Header & Contact */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="mb-4 inline-block text-sm font-bold uppercase tracking-wider text-[#1B198F]">
                Support
              </span>
              <h2 className="mb-4 font-[family-name:var(--font-family-antonio)] text-4xl font-black uppercase text-neutral-900 sm:text-5xl dark:text-white">
                Got Questions?
              </h2>
              <p className="mb-8 text-lg text-neutral-600 dark:text-neutral-400">
                Find answers to commonly asked questions or reach out to our support team.
              </p>
            </motion.div>

            {/* Category Filter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8 flex flex-wrap gap-2"
            >
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    activeCategory === category
                      ? 'bg-[#1B198F] text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </motion.div>

            {/* Contact Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-800">
                <h3 className="mb-4 font-bold text-neutral-900 dark:text-white">Still need help?</h3>
                <div className="space-y-3">
                  <a
                    href="tel:+917717495954"
                    className="flex items-center gap-3 text-neutral-600 transition-colors hover:text-[#1B198F] dark:text-neutral-400"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1B198F]/10">
                      <Phone className="h-5 w-5 text-[#1B198F]" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-white">Call Us</p>
                      <p className="text-sm">+91 77174 95954</p>
                    </div>
                  </a>
                  <a
                    href="mailto:info@gibbonnutrition.com"
                    className="flex items-center gap-3 text-neutral-600 transition-colors hover:text-[#1B198F] dark:text-neutral-400"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1B198F]/10">
                      <Mail className="h-5 w-5 text-[#1B198F]" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-white">Email Support</p>
                      <p className="text-sm">info@gibbonnutrition.com</p>
                    </div>
                  </a>
                  <a
                    href="https://wa.me/917717495954"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-neutral-600 transition-colors hover:text-[#1B198F] dark:text-neutral-400"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                      <MessageCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-white">WhatsApp</p>
                      <p className="text-sm">Quick responses</p>
                    </div>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - FAQ Accordion */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              {filteredFaqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all dark:border-neutral-700 dark:bg-neutral-800"
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="flex w-full items-center justify-between p-5 text-left"
                  >
                    <span className="pr-4 font-semibold text-neutral-900 dark:text-white">
                      {faq.question}
                    </span>
                    <motion.div
                      animate={{ rotate: openIndex === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-700"
                    >
                      <ChevronDown className="h-5 w-5 text-neutral-500" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="border-t border-neutral-200 px-5 pb-5 pt-4 dark:border-neutral-700">
                          <p className="text-neutral-600 dark:text-neutral-400">{faq.answer}</p>
                          <span className="mt-3 inline-block rounded-full bg-[#1B198F]/10 px-3 py-1 text-xs font-semibold text-[#1B198F]">
                            {faq.category}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
