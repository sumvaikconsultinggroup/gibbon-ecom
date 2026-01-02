'use client'

import { Info, Percent, X } from 'lucide-react'
import { useState } from 'react'

export default function PrepaidDiscountBanner({ price }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Calculate price with 3% prepaid discount
  const discountedPrice = Math.round(price * 0.97)

  return (
    <>
      <div className="mt-3 flex w-max items-center gap-x-2 rounded-md bg-linear-to-r from-[#1b198f] to-[#2a75b3] px-[18px] py-[12px] font-family-roboto text-white capitalize shadow-sm">
        <span className="font-family-roboto font-medium">
          <span className="text-[16px]">Get it for as low as </span>
          <span className="text-[18px]">₹{discountedPrice.toLocaleString('en-IN')}</span>
        </span>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center rounded-full bg-white p-0.5 text-[#1b198f] hover:bg-neutral-100"
        >
          <Info className="h-[14px] w-[14px]" />
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-family-roboto backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-xl bg-white px-6 pt-10 pb-6 shadow-2xl">
            <div className="absolute -top-6 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-[#fff8e1] shadow-lg ring-4 ring-white">
              <Percent className="h-6 w-6 text-[#fcd266]" />
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-neutral-600 transition hover:bg-neutral-300 hover:text-neutral-900"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="mb-1 text-center text-[26px] leading-tight font-bold text-black uppercase">
              Get it for as low as ₹{discountedPrice.toLocaleString('en-IN')}
            </h3>
            <p className="text-center text-[15px] text-neutral-600 capitalize">3% Prepaid Discount</p>
          </div>
        </div>
      )}
    </>
  )
}
