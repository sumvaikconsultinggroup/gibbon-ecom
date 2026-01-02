'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import {
  Award,
  Users,
  Target,
  Heart,
  Shield,
  Leaf,
  FlaskConical,
  Globe,
  ChevronRight,
} from 'lucide-react'
import MegaHeader from '@/components/Header/MegaHeader'
import Footer from '@/components/Footer'

const stats = [
  { value: '50K+', label: 'Happy Customers' },
  { value: '150+', label: 'Products' },
  { value: '4.9', label: 'Average Rating' },
  { value: '2019', label: 'Founded' },
]

const values = [
  {
    icon: FlaskConical,
    title: 'Science-Backed',
    description: 'Every formula is developed with evidence-based research and tested for efficacy.',
  },
  {
    icon: Leaf,
    title: '100% Natural',
    description: 'No artificial colors, fillers, or harmful additives. Just pure, clean nutrition.',
  },
  {
    icon: Shield,
    title: 'Quality First',
    description: 'Third-party tested and FSSAI certified. We never compromise on quality.',
  },
  {
    icon: Heart,
    title: 'Customer Love',
    description: 'Your success is our mission. We\'re here to support your fitness journey.',
  },
]

const team = [
  {
    name: 'Founder & CEO',
    role: 'Vision & Strategy',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  },
  {
    name: 'Head of R&D',
    role: 'Product Development',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
  },
  {
    name: 'Operations Lead',
    role: 'Supply Chain',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
  },
]

export default function AboutPage() {
  return (
    <>
      <MegaHeader />
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-[#1B198F] py-20 text-white lg:py-32">
          <div className="absolute inset-0 opacity-20">
            <div className="h-full w-full bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[size:50px_50px]" />
          </div>
          <div className="container relative mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-3xl text-center"
            >
              <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
                Our Story
              </span>
              <h1 className="mb-6 font-[family-name:var(--font-family-antonio)] text-4xl font-black uppercase sm:text-5xl lg:text-6xl">
                Fueling India's Fitness Revolution
              </h1>
              <p className="text-lg text-white/80">
                Since 2019, Gibbon Nutrition has been on a mission to provide premium, 
                lab-tested supplements that help athletes and fitness enthusiasts achieve 
                their goals without compromise.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="relative -mt-12">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 gap-4 rounded-2xl bg-white p-8 shadow-2xl sm:grid-cols-4 dark:bg-neutral-900"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-black text-[#1B198F] sm:text-4xl">{stat.value}</div>
                  <div className="text-sm text-neutral-500">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <span className="mb-2 inline-block text-sm font-bold uppercase tracking-wider text-[#1B198F]">
                  The Beginning
                </span>
                <h2 className="mb-6 font-[family-name:var(--font-family-antonio)] text-3xl font-black uppercase sm:text-4xl">
                  Born From Passion, Built For Results
                </h2>
                <div className="space-y-4 text-neutral-600 dark:text-neutral-400">
                  <p>
                    Gibbon Nutrition was founded with a simple yet powerful vision: to provide 
                    Indian athletes with world-class supplements that don't compromise on quality 
                    or authenticity.
                  </p>
                  <p>
                    Frustrated by the lack of transparent, lab-tested options in the market, 
                    our founders set out to create a brand that prioritizes purity, efficacy, 
                    and customer trust above all else.
                  </p>
                  <p>
                    Today, we're proud to serve over 50,000 fitness enthusiasts across India, 
                    from beginners taking their first steps to professional athletes competing 
                    at the highest levels.
                  </p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative aspect-square overflow-hidden rounded-2xl"
              >
                <Image
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800"
                  alt="Gibbon Nutrition Story"
                  fill
                  className="object-cover"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-neutral-50 py-20 lg:py-32 dark:bg-neutral-900">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16 text-center"
            >
              <span className="mb-2 inline-block text-sm font-bold uppercase tracking-wider text-[#1B198F]">
                Our Values
              </span>
              <h2 className="font-[family-name:var(--font-family-antonio)] text-3xl font-black uppercase sm:text-4xl">
                What We Stand For
              </h2>
            </motion.div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="rounded-2xl bg-white p-6 text-center shadow-sm dark:bg-neutral-800"
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#1B198F]/10">
                    <value.icon className="h-7 w-7 text-[#1B198F]" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-neutral-900 dark:text-white">{value.title}</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl rounded-3xl bg-[#1B198F] p-8 text-center text-white sm:p-12 lg:p-16">
              <Target className="mx-auto mb-6 h-12 w-12" />
              <h2 className="mb-6 font-[family-name:var(--font-family-antonio)] text-3xl font-black uppercase sm:text-4xl">
                Our Mission
              </h2>
              <p className="text-lg text-white/80">
                To empower every fitness enthusiast in India with premium, authentic, 
                and science-backed supplements that deliver real results. We believe 
                that everyone deserves access to world-class nutrition without the 
                premium price tag or the worry of fake products.
              </p>
              <Link
                href="/collections/all"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-bold text-[#1B198F] transition-all hover:bg-neutral-100"
              >
                Explore Products
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-neutral-200 bg-neutral-50 py-20 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-4 font-[family-name:var(--font-family-antonio)] text-3xl font-black uppercase">
              Ready to Transform Your Fitness Journey?
            </h2>
            <p className="mb-8 text-neutral-600 dark:text-neutral-400">
              Join 50,000+ athletes who trust Gibbon for their nutrition needs.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/collections/all"
                className="rounded-full bg-[#1B198F] px-8 py-4 font-bold text-white transition-all hover:bg-[#1B198F]/90"
              >
                Shop Now
              </Link>
              <Link
                href="/contact"
                className="rounded-full border-2 border-[#1B198F] px-8 py-4 font-bold text-[#1B198F] transition-all hover:bg-[#1B198F]/5"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}
