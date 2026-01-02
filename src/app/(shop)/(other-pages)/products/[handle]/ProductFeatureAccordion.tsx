'use client'

import { Disclosure, Transition } from '@headlessui/react'
import { ChevronUpIcon } from '@heroicons/react/24/solid'

const accordionData = [
  {
    heading: 'Enhanced Muscle Growth',
    description: 'Formulated with premium whey protein isolate to support lean muscle development and repair.',
  },
  {
    heading: 'Rapid Absorption Formula',
    description:
      'Micro-filtered for fast absorption, delivering essential amino acids to your muscles when they need it most.',
  },
  {
    heading: 'Zero Added Sugar',
    description:
      'Enjoy a delicious taste without compromising your nutritional goals. Sweetened naturally for a guilt-free experience.',
  },
]

export default function ProductFeatureAccordion() {
  return (
    <div className="mb-10 w-full font-family-antonio">
      <Disclosure>
        {({ open }) => (
          <>
            <Disclosure.Button className="relative uppercase flex w-full justify-center bg-neutral-100 px-4 py-3 text-center text-xl font-semibold text-neutral-900 hover:bg-neutral-200 focus:outline-none focus-visible:ring focus-visible:ring-primary-500/75 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700">
              Know More About Product
              <ChevronUpIcon
                className={`${
                  open ? 'rotate-180 transform' : ''
                } absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500 transition-transform`}
              />
            </Disclosure.Button>
            <Transition
              enter="transition duration-100 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              <Disclosure.Panel className="relative mt-2">
                {/* Pointed corner */}
                <div className="absolute -top-1 left-6 h-3 w-3 rotate-45 bg-white dark:bg-neutral-800"></div>
                <div className="rounded-lg bg-white p-5 shadow-lg ring-1 ring-black/5 dark:bg-neutral-800 dark:ring-white/10">
                  <ul className="space-y-4">
                    {accordionData.map((item) => (
                      <li key={item.heading}>
                        <h4 className="text-[21px] uppercase font-semibold text-blue-700 dark:text-blue-400">
                          <span className="mr-2">•</span>
                          {item.heading}
                        </h4>
                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{item.description}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </Disclosure.Panel>
            </Transition>
          </>
        )}
      </Disclosure>
    </div>
  )
}
