import Link from 'next/link'
import { Instagram, Mail, Phone, Youtube, MapPin, Clock, Shield, Truck, RotateCcw } from 'lucide-react'
import Image from 'next/image'
import FooterBlogSection from './Footer/FooterBlogSection'

const footerLinks = {
  categories: [
    { name: 'Whey Protein', href: '/collections/whey-protein' },
    { name: 'Pre-Workout', href: '/collections/pre-workout' },
    { name: 'Mass Gainer', href: '/collections/mass-gainer' },
    { name: 'BCAAs & EAAs', href: '/collections/bcaa' },
    { name: 'Vitamins', href: '/collections/vitamins' },
    { name: 'Creatine', href: '/collections/creatine' },
  ],
  quickLinks: [
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Blog', href: '/blog' },
    { name: 'FAQs', href: '/faqs' },
    { name: 'Track Order', href: '/track-order' },
  ],
  policies: [
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Refund Policy', href: '/refund-policy' },
    { name: 'Shipping Policy', href: '/shipping-policy' },
  ],
}

const trustBadges = [
  { icon: Shield, text: 'Secure Payments' },
  { icon: Truck, text: 'Free Shipping ₹999+' },
  { icon: RotateCcw, text: '7 Day Returns' },
]

export default function Footer() {
  return (
    <footer className="bg-neutral-950 text-white">
      {/* Trust Badges Bar */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {trustBadges.map((badge, index) => (
              <div key={index} className="flex items-center justify-center gap-3">
                <badge.icon className="h-6 w-6 text-[#1B198F]" />
                <span className="text-sm font-semibold">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-6 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="mb-6 inline-block">
              <Image
                src="/GibbonLogoEccom.png"
                alt="Gibbon Nutrition"
                width={180}
                height={54}
                className="h-12 w-auto brightness-0 invert"
              />
            </Link>
            <p className="mb-6 max-w-sm text-sm leading-relaxed text-neutral-400">
              Gibbon Nutrition crafts premium fitness supplements that are lab-tested, 
              FSSAI certified, and designed to help you achieve your fitness goals. 
              Made in India with love.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              <Link
                href="https://www.instagram.com/gibbonnutrition/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-[#1B198F]"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="https://www.youtube.com/channel/UCjGA-E71FwOIanpFeJspGfA"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-[#1B198F]"
              >
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="mb-4 font-[family-name:var(--font-family-antonio)] text-sm font-bold uppercase tracking-wider">
              Categories
            </h3>
            <ul className="space-y-3">
              {footerLinks.categories.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links & Policies */}
          <div>
            <h3 className="mb-4 font-[family-name:var(--font-family-antonio)] text-sm font-bold uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 font-[family-name:var(--font-family-antonio)] text-sm font-bold uppercase tracking-wider">
              Get In Touch
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="tel:+917717495954"
                  className="flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-white"
                >
                  <Phone className="h-4 w-4" />
                  +91 77174 95954
                </Link>
              </li>
              <li>
                <Link
                  href="mailto:info@gibbonnutrition.com"
                  className="flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-white"
                >
                  <Mail className="h-4 w-4" />
                  info@gibbonnutrition.com
                </Link>
              </li>
              <li className="flex items-start gap-2 text-sm text-neutral-400">
                <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Mon - Sat: 9AM - 7PM IST</span>
              </li>
            </ul>
          </div>

          {/* Blog Section */}
          <div className="lg:col-span-1">
            <FooterBlogSection />
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            {/* Copyright */}
            <p className="text-center text-xs text-neutral-500">
              © {new Date().getFullYear()} Gibbon Nutrition. All rights reserved.
            </p>

            {/* Policy Links */}
            <div className="flex flex-wrap justify-center gap-4">
              {footerLinks.policies.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-xs text-neutral-500 transition-colors hover:text-white"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Payment Methods */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">Pay with:</span>
              <div className="flex gap-1">
                <div className="rounded bg-white px-2 py-1">
                  <span className="text-[10px] font-bold text-[#1A1F71]">VISA</span>
                </div>
                <div className="flex items-center rounded bg-white px-2 py-1">
                  <div className="flex">
                    <div className="-mr-1 h-3 w-3 rounded-full bg-[#EB001B]"></div>
                    <div className="h-3 w-3 rounded-full bg-[#F79E1B] opacity-80"></div>
                  </div>
                </div>
                <div className="rounded bg-white px-2 py-1">
                  <span className="text-[10px] font-bold text-[#5f259f]">RuPay</span>
                </div>
                <div className="rounded bg-white px-2 py-1">
                  <span className="text-[10px] font-bold text-[#002E6E]">UPI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
