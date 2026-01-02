'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'

export default function RecommendedProducts({ currentProduct, mainProductPrice, onSelectionChange }) {
  const [selectedProducts, setSelectedProducts] = useState([])

  const recommendedProducts = useMemo(() => {
    if (!currentProduct?.recommendedProducts) {
      return []
    }
    return currentProduct.recommendedProducts
  }, [currentProduct])

  const handleCheckboxChange = (product) => {
    setSelectedProducts((prevSelected) => {
      if (prevSelected.some((p) => p._id === product._id)) {
        return prevSelected.filter((p) => p._id !== product._id)
      } else {
        return [...prevSelected, product]
      }
    })
  }

  // ✅ Notify parent component when selection changes
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedProducts)
    }
  }, [selectedProducts, onSelectionChange])

  const totalPrice = useMemo(() => {
    const selectedTotal = selectedProducts.reduce((sum, product) => sum + (product.price || 0), 0)
    return mainProductPrice + selectedTotal
  }, [selectedProducts, mainProductPrice])

  if (recommendedProducts.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-y-3">
      <h3 className="text-base font-extrabold text-[#1b198f] font-family-roboto  ml-2 tracking-wider ">Gibbon Also Recommends</h3>
      {recommendedProducts.map((recProduct) => (
        <div key={recProduct._id} className="flex items-stretch gap-x-3 p-2 dark:bg-neutral-800">
          <input
            type="checkbox"
            onChange={() => handleCheckboxChange(recProduct)}
            checked={selectedProducts.some((p) => p._id === recProduct._id)}
            className="mt-5 size-5 shrink-0 cursor-pointer border-[#1b198f] text-[#1b198f] focus:ring-[#1b198f] dark:border-neutral-600 dark:bg-neutral-900"
          />
          <div className="relative h-20 w-20 shrink-0 overflow-hidden">
            <Image src={recProduct.images[0].src} alt={recProduct.handle} fill className="object-cover" />
          </div>
          <div className="flex flex-1 flex-col justify-between">
            <h4 className="text-sm font-semibold uppercase">{recProduct.handle}</h4>
            <div>
              <div className="flex items-baseline gap-x-1 text-sm font-semibold">
                <span className="text-[20px] font-semibold text-[#1b198f] dark:text-neutral-100">
                  {recProduct.price ? `₹${recProduct.price.toLocaleString('en-IN')}` : 'Free'}
                </span>
                {recProduct.compareAtPrice && (
                  <>
                    <del className="mx-2.5 font-family-roboto text-[14px] font-medium text-gray-500">
                      &#8377;{recProduct.compareAtPrice.toLocaleString('en-IN')}
                    </del>

                    {recProduct.price && (
                      <span className="font-600 font-family-roboto text-[14px] text-green-600 dark:text-green-500">
                        -
                        {`${Math.round(((recProduct.compareAtPrice - recProduct.price) / recProduct.compareAtPrice) * 100)}% off`}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {selectedProducts.length > 0 && (
        <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
          <span className="text-base font-semibold text-blue-800 dark:text-blue-300">
            Total Price: ₹{totalPrice.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  )
}
