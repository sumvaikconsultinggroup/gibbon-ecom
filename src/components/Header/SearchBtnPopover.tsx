'use client'

import { CloseButton, Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { Cancel01Icon, Search01Icon, ArrowRightIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'
import { Link } from '../Link'

const recommendedProducts = [
  {
    id: 1,
    name: 'Omega-3 ',
    price: 2499,
    originalPrice: 2999,
    rating: 4.5,
    reviews: 1250,
    image: '/Recomended-1.png',
    bgColor: '#FEF3C7',
  },
  {
    id: 2,
    name: 'Creatine Monohydrate',
    price: 1299,
    originalPrice: 1599,
    rating: 4.8,
    reviews: 890,
    image: '/Recomended-3.png',
    bgColor: '#DBEAFE',
  },
  {
    id: 3,
    name: 'BCAA Energy',
    price: 1799,
    originalPrice: 2199,
    rating: 4.6,
    reviews: 654,
    image: '/Recomended-2.png',
    bgColor: '#FCE7F3',
  },
  {
    id: 4,
    name: 'Flaxseed',
    price: 1499,
    originalPrice: 1799,
    rating: 4.7,
    reviews: 432,
    image: '/Recomended-4.png',
    bgColor: '#D1FAE5',
  },
]

const SearchBtnPopover = () => {
  const router = useRouter()
  const [query, setQuery] = useState('')

  return (
    <Popover>
      <PopoverButton className="flex cursor-pointer items-center justify-center p-2.5 hover:bg-neutral-100 focus-visible:outline-0 dark:hover:bg-neutral-800">
        <HugeiconsIcon icon={Search01Icon} size={24} color="currentColor" strokeWidth={2.5} />
      </PopoverButton>

      <PopoverPanel
        transition
        className="fixed left-0 right-0 top-12 z-50 bg-white transition duration-200 ease-in-out data-closed:translate-y-1 data-closed:opacity-0 dark:bg-neutral-900 w-full md:max-w-[80vw] mx-auto max-h-[90vh] overflow-y-auto"
        style={{
          boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.12), 0 8px 32px rgba(0, 0, 0, 0.12)',
        }}
      >
        {/* Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-linear-to-b from-[#4bb0dd]/10 to-transparent pointer-events-none z-10"></div>

        <div className="container mx-auto px-4 py-4 md:py-8 relative">
          
          {/* Search Bar */}
          <div className="mx-auto flex w-full max-w-3xl flex-col">
            <form
              className="flex w-full items-center border-2 border-neutral-200 dark:border-neutral-700 px-3 py-2 md:px-6 md:py-3 bg-neutral-50 dark:bg-neutral-800"
              onSubmit={(e) => {
                e.preventDefault()
                if (query) {
                  router.push(`/search?q=${encodeURIComponent(query)}`)
                }
              }}
            >
              <HugeiconsIcon icon={Search01Icon} size={26} color="currentColor" strokeWidth={1.5} />

              <input
                data-autofocus
                autoFocus
                type="text"
                placeholder="Search for products..."
                className="w-full border-none bg-transparent px-4 py-2 text-base focus-visible:outline-none dark:text-white"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                name="q"
                aria-label="Search for products"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />

              <button type="submit" className="p-3 bg-[#1B198F] text-white hover:bg-[#2770a8] transition-colors">
                <HugeiconsIcon icon={ArrowRightIcon} size={20} />
              </button>

              <div className="w-px h-6 bg-neutral-300 dark:bg-neutral-600 mx-3"></div>

              <CloseButton className="p-2.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                <HugeiconsIcon icon={Cancel01Icon} size={24} />
              </CloseButton>
            </form>
          </div>

          {/* Recommended Section */}
          <div className="mt-6 md:mt-12 mx-auto max-w-6xl">
            <h3 className="text-lg md:text-2xl font-bold mb-4 md:mb-6 text-gray-900 dark:text-white">
              Recommended Products
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              {recommendedProducts.map((product) => (
                <div
                  key={product.id}
                  className="group flex flex-col shadow-md hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-neutral-800"
                >
                  {/* Image */}
                  <div
                    className="relative h-32 md:h-48 flex items-center justify-center p-4"
                    style={{ backgroundColor: product.bgColor }}
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={160}
                      height={200}
                      className="object-contain scale transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>

                  <div className="p-2 md:p-4 flex flex-col grow">
                    <Link href={`/products/${product.name.toLowerCase().trim().replace(/ /g, '-')}`}>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {product.name}
                      </h4>
                    </Link>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(product.rating) ? 'fill-yellow-400' : 'fill-gray-300'
                            }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({product.reviews})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        ₹{product.price}
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        ₹{product.originalPrice}
                      </span>
                    </div>

                    {/* Add to Cart */}
                    <Link href={`/products/${product.name.toLowerCase().trim().replace(/ /g, '-')}`} className="w-full py-2.5 bg-[#1B198F] text-white font-medium hover:bg-[#2770a8] transition-colors duration-300 mt-auto block text-center">
                      Add to Cart
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-linear-to-t from-[#4bb0dd]/10 to-transparent pointer-events-none z-10"></div>
      </PopoverPanel>
    </Popover>
  )
}

export default SearchBtnPopover
