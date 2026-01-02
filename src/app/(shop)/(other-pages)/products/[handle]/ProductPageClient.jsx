'use client'

import AddToCartButton from '@/components/AddToCardButton'
import { Divider } from '@/components/Divider'
import FrequentlyBoughtTogether from '@/components/FrequentlyBoughtTogether'
import NcInputNumber from '@/components/NcInputNumber'
import Prices from '@/components/Prices'
import ProductColorOptions from '@/components/ProductForm/ProductColorOptions'
import ProductForm from '@/components/ProductForm/ProductForm'
import ProductSizeOptions from '@/components/ProductForm/ProductSizeOptions'
import ProductStatus from '@/components/ProductStatus'
import StarRating from '@/components/StarRating'
import Breadcrumb from '@/shared/Breadcrumb'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import AddToCartPanel from './AddToCartPanel'
import ProductDescriptionExcerpt from './ProductDescriptionExcerpt'

export default function ProductPageClient({ product, transformedProduct, recommendedProducts }) {
  const [isPanelVisible, setIsPanelVisible] = useState(false)
  const addToCartRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the main add to cart button is not visible, show the panel.
        setIsPanelVisible(!entry.isIntersecting)
      },
      {
        rootMargin: '0px 0px 0% 0px', // Trigger when the element is completely out of view from the bottom
      }
    )

    const currentRef = addToCartRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [])

  const features = [
    { name: 'Authenticity', image: '/Feature1.webp' },
    { name: 'Lab Tested', image: '/Feature2.webp' },
    { name: 'Informed Choice', image: '/Feature3.webp' },
  ]

  const defaultFlavorOption = product.options?.find((opt) => opt.name === 'Flavors')?.values?.[0] || ''
  const defaultSizeOption = product.options?.find((opt) => opt.name === 'Net Weight')?.values?.[0] || ''

  return (
    <>
      <div className="w-full pt-5 font-family-antonio uppercase lg:w-[45%] lg:pt-0 lg:pl-7 xl:pl-9 2xl:pl-10">
        <div className="sticky top-8 flex flex-col gap-y-10">
          {/* ---------- 1 HEADING ----------  */}
          <div>
            <Breadcrumb breadcrumbs={transformedProduct.breadcrumbs} currentPage={product.title} />
            <span className="inline-block rounded-[50px] border border-black bg-[#90f22a] px-4 py-1 text-lg font-bold text-black md:mt-10">
              {' '}
              NEW LAUNCH
            </span>
            <h1 className="leading-[120%] font-bold text-primary-700 sm:text-3xl md:mt-4 md:text-[32px]">
              {product.title}
            </h1>

            <div className="mt-4 flex flex-col gap-y-3">
              <Prices
                contentClass="text-[30px] font-family-roboto font-bold text-[#151515] mr-[10.5px]"
                price={transformedProduct.price}
                compareAtPrice={transformedProduct.compareAtPrice}
              />
              <p className="font-family-roboto text-lg font-medium text-[#6b7280] lowercase dark:text-neutral-400">
                Incl. of all taxes and Shipping.
              </p>
              <div className="flex items-center gap-x-3">
                <a href="#reviews" className="flex items-center text-sm font-medium">
                  <StarRating rating={parseFloat(transformedProduct.rating)} />
                  <div className="ms-1.5 flex items-center gap-x-1.5">
                    <span className="font-family-roboto font-semibold">{transformedProduct.rating}</span>
                    <span className="font-family-roboto text-neutral-500 underline hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200">
                      ({transformedProduct.reviewNumber} reviews)
                    </span>
                  </div>
                </a>
                <ProductStatus status={product.status} />
              </div>
              <ProductDescriptionExcerpt htmlContent={product.bodyHtml} />

              <div className="mt-4 inline-flex w-[340px] gap-2 rounded-md bg-blue-900 px-4 py-2 font-family-roboto text-[16px] text-white capitalize">
                <p className="inline-block">Earn upto 232 Points on this purchase</p>
              </div>

              <div className="mt-4 border-y border-neutral-200 font-family-roboto dark:border-neutral-700">
                <div className="-mx-4 flex">
                  {features.map((feature) => (
                    <div
                      key={feature.name}
                      className="flex flex-1 items-center justify-center gap-x-2 border-x border-neutral-200 px-3 py-4 first:border-l-0 last:border-r-0 dark:border-neutral-700"
                    >
                      <Image src={feature.image} alt={feature.name} width={48} height={48} />
                      <span className="text-lg font-normal text-neutral-700 normal-case dark:text-neutral-300">
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <ProductForm product={transformedProduct}>
            <fieldset className="flex flex-col gap-y-10">
              <div className="flex flex-col gap-y-8">
                <ProductColorOptions options={product.options?.[0]} defaultColor={defaultFlavorOption} />
                <ProductSizeOptions options={product.options} defaultSize={defaultSizeOption} />
              </div>

              {recommendedProducts.length > 0 && (
                <div className="flex flex-col gap-y-4">
                  <h3 className="font-family-roboto text-lg font-semibold uppercase">Frequently Bought Together</h3>
                  {recommendedProducts.map((recProduct) => (
                    <div
                      key={recProduct.id}
                      className="flex items-start gap-x-4 rounded-lg border border-neutral-200 p-3 dark:border-neutral-700"
                    >
                      <input
                        type="checkbox"
                        className="mt-1 size-5 shrink-0 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-900"
                      />
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md">
                        <Image src={recProduct.images[0].src} alt={recProduct.title} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-family-antonio text-base font-semibold normal-case">{recProduct.title}</h4>

                        <Prices
                          price={recProduct.variants[0].price}
                          compareAtPrice={recProduct.variants[0].compare_at_price}
                          className="mt-2"
                          contentClass="text-sm font-semibold"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div ref={addToCartRef} className="flex gap-x-3.5">
                <div className="flex items-center justify-center rounded-full bg-neutral-100/70 px-2 py-3 sm:p-3.5 dark:bg-neutral-800/70">
                  <NcInputNumber name="quantity" defaultValue={1} />
                </div>
                <AddToCartButton product={transformedProduct} blackVariant={false} />
              </div>
            </fieldset>
          </ProductForm>

          <Image
            src="/Paymnt.webp"
            alt="Gibbon Nutrition"
            width={800}
            height={200}
            className="w-full rounded-none border-2 border-gray-300 object-cover p-4"
          />

          <Divider />

          <FrequentlyBoughtTogether products={recommendedProducts} currentProduct={transformedProduct} />

          {/* <AccordionInfo handle={product.handle} /> */}
          <div className="hidden xl:block">{/* <Policy /> */}</div>
        </div>
      </div>
      <AddToCartPanel product={transformedProduct} isVisible={isPanelVisible} />
    </>
  )
}
