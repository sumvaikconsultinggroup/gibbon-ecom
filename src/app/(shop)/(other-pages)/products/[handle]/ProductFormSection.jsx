'use client'

import NcInputNumber from '@/components/NcInputNumber'
import ProductColorOptions from '@/components/ProductForm/ProductColorOptions'
import ProductForm from '@/components/ProductForm/ProductForm'
import ProductSizeOptions from '@/components/ProductForm/ProductSizeOptions'
import Image from 'next/image'
import { useState } from 'react'
import RecommendedProducts from './RecommendedProducts'
import { useProductContext } from './ProductContext'

export default function ProductFormSection({ product, transformedProduct, defaultFlavorOption, defaultSizeOption }) {
  const [selectedRecommendedProducts, setSelectedRecommendedProducts] = useState([])
  const { setSelectedColor } = useProductContext()

  return (
    <ProductForm product={transformedProduct} selectedRecommendedProducts={selectedRecommendedProducts}>
      <fieldset className="flex flex-col gap-y-10">
        {/* VARIANTS AND SIZE LIST */}
        <div className="flex flex-col gap-y-8 font-family-roboto">
          <ProductColorOptions options={product.options[0]} defaultColor={defaultFlavorOption} onColorChange={setSelectedColor} />
          <ProductSizeOptions options={product.options} defaultSize={defaultSizeOption} />
        </div>

        {/* RECOMMENDED PRODUCTS */}
        <RecommendedProducts
          currentProduct={product}
          mainProductPrice={transformedProduct.price}
          onSelectionChange={setSelectedRecommendedProducts}
        />

        <div className="flex flex-col gap-y-3">
          {/* QTY AND ADD TO CART BUTTON */}
          <div className="flex gap-x-3.5">
            <div className="flex items-center justify-center border border-neutral-700 px-2 py-2 sm:p-2.5 dark:bg-neutral-800/70">
              <NcInputNumber name="quantity" defaultValue={1} />
            </div>

            <button
              type="submit"
              className="relative flex w-full cursor-pointer items-center justify-around overflow-hidden border-black bg-[#1B198F] py-1 font-family-roboto text-[20px] font-medium text-white uppercase shadow-[4px_6px_0px_black] transition-[box-shadow_250ms,transform_250ms,filter_50ms] before:absolute before:inset-0 before:z-[-1] before:-translate-x-full before:bg-[#2a75b3] before:transition-transform before:duration-250 before:content-[''] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_3px_0px_black] hover:before:translate-x-0"
            >
              Add to cart
            </button>
          </div>

          <div className="bg-[#1b198f] py-3 text-center text-md font-medium text-white font-family-roboto">
            FREE SHIPPING + 3% PREPAID BONUS
          </div>
        </div>

        {/* PAYMENT METHODS IMAGE */}
        <div className="mt-1 flex justify-center border border-neutral-200 py-[15px] dark:border-neutral-900">
          <Image
            src="/PaymentMethod.webp"
            alt="Accepted payment methods"
            width={400}
            height={40}
            className="object-contain"
          />
        </div>
      </fieldset>
    </ProductForm>
  )
}
