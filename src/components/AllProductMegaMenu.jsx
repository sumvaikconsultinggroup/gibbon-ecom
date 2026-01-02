'use client'

import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import Link from 'next/link'

const AllProductMegaMenu = ({ className = '' }) => {
  // Static product data
  const products = [
    {
      id: 'BCAA',
      name: 'BCAA',
      image:
        'https://cdn.shopify.com/s/files/1/0773/1707/9332/files/BCAA_blueraspberry_front0.png?v=1706343272://cdn.shopify.com/s/files/1/0773/1707/9332/files/TEST_L_ARGINE_greenapple1_0140-min0.png?v=1707975694',
      link: '/products/bcaa',
    },
    {
      id: 'creatine',
      name: 'Creatine',
      image: 'https://cdn.shopify.com/s/files/1/0773/1707/9332/files/Gibbon_13_0.png?v=1706343741',
      link: '/products/creatine',
    },
    {
      id: 'l-carnitine',
      name: 'L-Carnitine',
      image: 'https://cdn.shopify.com/s/files/1/0773/1707/9332/files/carnipure_kiwistrawberry_front0.png?v=1706344648',
      link: '/collections/l-carnitine',
    },
    {
      id: 'pre-workout',
      name: 'Pre Workout',
      image: 'https://cdn.shopify.com/s/files/1/0773/1707/9332/files/BestPreWorkout0.png?v=1710225794',
      link: '/products/jolt',
    },
    {
      id: 'isolate-whey',
      name: 'Isolate & Whey',
      image:
        'https://cdn.shopify.com/s/files/1/0773/1707/9332/files/GibbonRippedIsolate_DoubleSaffron3D0.png?v=1710489309',
      link: '/collections/isolate-whey',
    },
    {
      id: 'mass-gainer',
      name: 'Mass Gainer',
      image: 'https://cdn.shopify.com/s/files/1/0773/1707/9332/files/mass_gainer1kg_choco1-min0.png?v=1706342816',
      link: '/products/mass-gainer-1-kg',
    },
    {
      id: 'glutamine',
      name: 'Glutamine',
      image: 'https://cdn.shopify.com/s/files/1/0773/1707/9332/files/Gibbon_15_0.png?v=1706344438',
      link: '/products/glutamine',
    },
    {
      id: 'combos',
      name: 'Combos',
      image: 'https://cdn.shopify.com/s/files/1/0773/1707/9332/files/MuscleWhey_Jolt0.png?v=1706354047',
      link: '/collections/vitamins',
    },
    {
      id: 'B Arginine',
      name: 'B Arginine',
      image: 'https://cdn.shopify.com/s/files/1/0773/1707/9332/files/TEST_L_ARGINE_mango1_0140-min1.png?v=1706344915',
      link: '/products/b-arginine',
    },
    {
      id: 'health-and-wellness',
      name: 'Health & Wellness',
      image: 'https://cdn.shopify.com/s/files/1/0773/1707/9332/files/flaxseed_front0.png?v=1706350869',
      link: '/collections/health-and-wellness',
    },
  ]

  return (
    <Popover className={`relative font-family-antonio ${className}`}>
      {({ open, close }) => (
        <>
          <PopoverButton className="flex items-center gap-1 rounded-md p-2.5 text-xl font-bold text-black transition-colors duration-200 hover:text-primary-600 focus:ring-0 focus:outline-hidden active:outline-none md:text-lg dark:hover:text-primary-400">
            <span className="font-family-antonio text-[18px] font-bold">ALL PRODUCTS</span>
            <ChevronDownIcon
              className="size-7 text-neutral-700 transition-transform duration-200 group-data-open:rotate-180 dark:text-neutral-300"
              aria-hidden="true"
            />
          </PopoverButton>

          <PopoverPanel className="absolute top-full left-0 z-50 mt-3 w-screen max-w-md px-4 sm:max-w-lg md:max-w-2xl lg:max-w-3xl">
            <div className="ring-opacity-5 overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-black dark:bg-neutral-900 dark:ring-neutral-700">
              <div className="p-4 md:p-5 lg:p-6">
                {/* Header */}
                <div className="mb-5 text-center md:mb-6">
                  <h3 className="text-xl font-bold text-neutral-900 md:text-2xl dark:text-neutral-100">Our Products</h3>
                  <p className="mt-1 text-sm text-neutral-600 md:text-base dark:text-neutral-400">
                    Discover our complete range of fitness and nutrition products
                  </p>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:gap-6 lg:grid-cols-5 lg:gap-8">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      href={product.link}
                      className="group flex flex-col items-center text-center"
                      onClick={() => close()}
                    >
                      {/* Larger Round Image Container */}
                      <div className="relative mb-2 h-16 w-16 overflow-hidden rounded-full bg-neutral-100 ring-2 ring-transparent transition-all duration-300 group-hover:ring-primary-500 group-hover:ring-offset-2 group-hover:ring-offset-white sm:h-20 sm:w-20 md:h-24 md:w-24 dark:bg-neutral-800 dark:group-hover:ring-offset-neutral-900">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                          sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, 96px"
                        />
                      </div>

                      {/* Product Name */}
                      <span className="text-sm font-semibold text-neutral-900 transition-colors duration-200 group-hover:text-primary-600 md:text-base dark:text-neutral-100 dark:group-hover:text-primary-400">
                        {product.name}
                      </span>
                    </Link>
                  ))}
                </div>

                {/* View All Link */}
                <div className="mt-5 border-t border-neutral-200 pt-4 text-center md:mt-6 md:pt-5 dark:border-neutral-700">
                  <Link
                    href="/collections/all-items"
                    className="inline-flex items-center gap-2 text-base font-medium text-primary-600 transition-colors duration-200 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                    onClick={() => close()}
                  >
                    <span>View All Products</span>
                    <ChevronDownIcon className="size-5 -rotate-90" />
                  </Link>
                </div>
              </div>
            </div>
          </PopoverPanel>
        </>
      )}
    </Popover>
  )
}
export default AllProductMegaMenu
