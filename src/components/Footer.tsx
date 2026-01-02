import Link from "next/link"
import { Instagram, Mail, Phone, Youtube } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-[#1B198F] text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:divide-x md:divide-white/20">
          {/* Shop All Column */}
          <div className="md:px-8">
            <h3 className="font-black text-xl tracking-tight mb-6 [font-family:var(--font-family-antonio)]">CATEGORIES</h3>
            <ul className="space-y-3 [font-family:var(--font-roboto)]">
              <li>
                <Link href="/collections/health-and-wellness" className="hover:underline">
                  Health & Wellness
                </Link>
              </li>
              <li>
                <Link href="/collections/build-muscle" className="hover:underline">
                  Build Muscle
                </Link>
              </li>
              <li>
                <Link href="/collections/weight-management" className="hover:underline">
                  Weight Management
                </Link>
              </li>
              <li>
                <Link href="/collections/pre-workout" className="hover:underline">
                  Pre Workout
                </Link>
              </li>
              <li>
                <Link href="/collections/muscle-recovery" className="hover:underline">
                  Muscle Recovery
                </Link>
              </li>
            </ul>
          </div>

          {/* Know More Column */}
          <div className="md:px-8">
            <h3 className="font-black text-xl tracking-tight mb-6 [font-family:var(--font-family-antonio)]">TOP PRODUCTS</h3>
            <ul className="space-y-3 [font-family:var(--font-roboto)]">
              <li>
                <Link href="/products/jolt" className="hover:underline">
                  JOLT
                </Link>
              </li>
              <li>
                <Link href="/products/mass-gainer-5kg" className="hover:underline">
                  Mass Gainer 5KG
                </Link>
              </li>
              <li>
                <Link href="/products/my-omega" className="hover:underline">
                  My Omega
                </Link>
              </li>
              <li>
                <Link href="/products/my-whey-2-kg" className="hover:underline">
                  My Whey 2 kg
                </Link>
              </li>
              <li>
                <Link href="/products/daily-bcaa" className="hover:underline">
                  Daily BCAA
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Policy Column */}
          <div className="md:px-8">
            <h3 className="font-black text-xl tracking-tight mb-6 [font-family:var(--font-family-antonio)]">USEFULL LINKS</h3>
            <ul className="space-y-3 [font-family:var(--font-roboto)]">
              {/* <li>
                <Link href="#" className="hover:underline">
                  Refer & Earn
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Refund & Returns
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Shipping Policy
                </Link>
              </li> */}
              <li>
                <Link href="/blog" className="hover:underline">
                  Blogs
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:underline">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Follow Along Column */}
          <div className="md:px-8">
            <h3 className="font-black text-xl tracking-tight mb-6 [font-family:var(--font-family-antonio)]">FOLLOW ALONG</h3>
            <div className="flex gap-3">
              <Link
                href="https://www.instagram.com/gibbonnutrition/"
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <Instagram className="w-6 h-6 text-black" />
              </Link>
              <Link
                href="https://www.youtube.com/channel/UCjGA-E71FwOIanpFeJspGfA"
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <Youtube className="w-6 h-6 text-black" />
              </Link>
            </div>
          </div>

          {/* Get In Touch Column */}
          <div className="md:px-8">
            <h3 className="font-black text-xl tracking-tight mb-6 [font-family:var(--font-family-antonio)]">GET IN TOUCH</h3>
            <ul className="space-y-1 [font-family:var(--font-roboto)]">
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5" />
                <Link href="tel:+917717495954" className="hover:underline">
                 +91 77174 95954
                </Link>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5" />
                <Link href="tel:+919056013132" className="hover:underline">
                 +91 90560 13132
                </Link>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5" />
                <Link href="mailto:info@gibbonnutrition.com" className="hover:underline">
                  info@gibbonnutrition.com
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/20">
        <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">© 2025 Gibbon. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="text-sm mr-2">Pay Using:</span>
            <div className="flex gap-1">
              {/* Payment Icons */}
              <div className="bg-white rounded px-2 py-1 flex items-center justify-center">
                <span className="text-[#1A1F71] font-bold text-xs">VISA</span>
              </div>
              <div className="bg-white rounded px-2 py-1 flex items-center justify-center">
                <div className="flex">
                  <div className="w-4 h-4 bg-[#EB001B] rounded-full -mr-1.5"></div>
                  <div className="w-4 h-4 bg-[#F79E1B] rounded-full opacity-80"></div>
                </div>
              </div>
              <div className="bg-[#016FD0] rounded px-2 py-1 flex items-center justify-center">
                <span className="text-white font-bold text-xs">AMEX</span>
              </div>
              <div className="bg-white rounded px-2 py-1 flex items-center justify-center">
                <span className="text-[#003087] font-bold text-xs italic">
                  Pay<span className="text-[#009CDE]">Pal</span>
                </span>
              </div>
              <div className="bg-white rounded px-2 py-1 flex items-center justify-center">
                <span className="text-[#0079BE] font-bold text-xs">DC</span>
              </div>
              <div className="bg-white rounded px-2 py-1 flex items-center justify-center">
                <span className="text-[#FF6000] font-bold text-[10px]">DISCOVER</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
