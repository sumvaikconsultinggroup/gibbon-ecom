'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  Instagram,
  Youtube,
  CheckCircle,
} from 'lucide-react'
import MegaHeader from '@/components/Header/MegaHeader'
import Footer from '@/components/Footer'

const contactInfo = [
  {
    icon: Phone,
    title: 'Phone',
    details: ['+91 77174 95954', '+91 90560 13132'],
    action: 'tel:+917717495954',
  },
  {
    icon: Mail,
    title: 'Email',
    details: ['info@gibbonnutrition.com', 'support@gibbonnutrition.com'],
    action: 'mailto:info@gibbonnutrition.com',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    details: ['Quick responses', 'Mon-Sat 9AM-7PM'],
    action: 'https://wa.me/917717495954',
  },
  {
    icon: Clock,
    title: 'Hours',
    details: ['Monday - Saturday', '9:00 AM - 7:00 PM IST'],
  },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setIsSubmitted(true)
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
      } else {
        setError('Failed to send message. Please try again.')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <MegaHeader />
      <div className="min-h-screen">
        {/* Hero */}
        <section className="bg-[#1B198F] py-16 text-white lg:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-2xl text-center"
            >
              <h1 className="mb-4 font-[family-name:var(--font-family-antonio)] text-4xl font-black uppercase sm:text-5xl">
                Get In Touch
              </h1>
              <p className="text-white/80">
                Have questions about our products or need help with an order? 
                We're here to help!
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Cards */}
        <section className="relative -mt-8">
          <div className="container mx-auto px-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {contactInfo.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {item.action ? (
                    <a
                      href={item.action}
                      target={item.action.startsWith('http') ? '_blank' : undefined}
                      rel={item.action.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="block h-full rounded-2xl bg-white p-6 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl dark:bg-neutral-900"
                    >
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1B198F]/10">
                        <item.icon className="h-6 w-6 text-[#1B198F]" />
                      </div>
                      <h3 className="mb-2 font-bold text-neutral-900 dark:text-white">{item.title}</h3>
                      {item.details.map((detail, i) => (
                        <p key={i} className="text-sm text-neutral-600 dark:text-neutral-400">
                          {detail}
                        </p>
                      ))}
                    </a>
                  ) : (
                    <div className="h-full rounded-2xl bg-white p-6 shadow-lg dark:bg-neutral-900">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1B198F]/10">
                        <item.icon className="h-6 w-6 text-[#1B198F]" />
                      </div>
                      <h3 className="mb-2 font-bold text-neutral-900 dark:text-white">{item.title}</h3>
                      {item.details.map((detail, i) => (
                        <p key={i} className="text-sm text-neutral-600 dark:text-neutral-400">
                          {detail}
                        </p>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-20 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="grid gap-12 lg:grid-cols-2">
              {/* Form */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="mb-2 font-[family-name:var(--font-family-antonio)] text-3xl font-black uppercase">
                  Send Us a Message
                </h2>
                <p className="mb-8 text-neutral-600 dark:text-neutral-400">
                  Fill out the form and we'll get back to you within 24 hours.
                </p>

                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-2xl bg-green-50 p-8 text-center dark:bg-green-900/20"
                  >
                    <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
                    <h3 className="mb-2 text-xl font-bold text-green-800 dark:text-green-400">
                      Message Sent!
                    </h3>
                    <p className="text-green-700 dark:text-green-500">
                      Thank you for reaching out. We'll respond within 24 hours.
                    </p>
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="mt-4 text-sm font-semibold text-green-600 hover:underline"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold">Name *</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          className="w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none focus:border-[#1B198F] focus:ring-2 focus:ring-[#1B198F]/20 dark:border-neutral-700 dark:bg-neutral-800"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold">Email *</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none focus:border-[#1B198F] focus:ring-2 focus:ring-[#1B198F]/20 dark:border-neutral-700 dark:bg-neutral-800"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold">Phone</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none focus:border-[#1B198F] focus:ring-2 focus:ring-[#1B198F]/20 dark:border-neutral-700 dark:bg-neutral-800"
                          placeholder="+91 XXXXX XXXXX"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold">Subject *</label>
                        <select
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          required
                          className="w-full rounded-xl border border-neutral-200 px-4 py-3 outline-none focus:border-[#1B198F] focus:ring-2 focus:ring-[#1B198F]/20 dark:border-neutral-700 dark:bg-neutral-800"
                        >
                          <option value="">Select a subject</option>
                          <option value="Product Inquiry">Product Inquiry</option>
                          <option value="Order Status">Order Status</option>
                          <option value="Return/Refund">Return/Refund</option>
                          <option value="Bulk Orders">Bulk Orders</option>
                          <option value="Partnership">Partnership</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold">Message *</label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        rows={5}
                        className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 outline-none focus:border-[#1B198F] focus:ring-2 focus:ring-[#1B198F]/20 dark:border-neutral-700 dark:bg-neutral-800"
                        placeholder="How can we help you?"
                      />
                    </div>

                    {error && <p className="text-red-500">{error}</p>}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1B198F] py-4 font-bold text-white transition-all hover:bg-[#1B198F]/90 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        'Sending...'
                      ) : (
                        <>
                          Send Message
                          <Send className="h-5 w-5" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </motion.div>

              {/* Map / Social */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                {/* Map placeholder */}
                <div className="aspect-square overflow-hidden rounded-2xl bg-neutral-200 lg:aspect-video dark:bg-neutral-800">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3430.165891947!2d76.7844!3d30.7333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDQ0JzAwLjAiTiA3NsKwNDcnMDQuMCJF!5e0!3m2!1sen!2sin!4v1600000000000!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

                {/* Social Links */}
                <div className="rounded-2xl bg-neutral-50 p-6 dark:bg-neutral-900">
                  <h3 className="mb-4 font-bold">Follow Us</h3>
                  <div className="flex gap-4">
                    <a
                      href="https://www.instagram.com/gibbonnutrition/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white transition-transform hover:scale-110"
                    >
                      <Instagram className="h-6 w-6" />
                    </a>
                    <a
                      href="https://www.youtube.com/channel/UCjGA-E71FwOIanpFeJspGfA"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white transition-transform hover:scale-110"
                    >
                      <Youtube className="h-6 w-6" />
                    </a>
                    <a
                      href="https://wa.me/917717495954"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white transition-transform hover:scale-110"
                    >
                      <MessageCircle className="h-6 w-6" />
                    </a>
                  </div>
                </div>

                {/* FAQ Link */}
                <div className="rounded-2xl border border-[#1B198F]/20 bg-[#1B198F]/5 p-6">
                  <h3 className="mb-2 font-bold text-[#1B198F]">Looking for quick answers?</h3>
                  <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
                    Check our FAQ section for instant answers to common questions.
                  </p>
                  <a
                    href="/#faq"
                    className="text-sm font-semibold text-[#1B198F] hover:underline"
                  >
                    View FAQ →
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}
