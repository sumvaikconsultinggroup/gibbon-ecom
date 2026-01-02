import FaqSocialSection from '@/components/FaqsSection/FaqsSection'
import FrequentlyBoughtTogether from '@/components/FrequentlyBoughtTogether'
import LikeButton from '@/components/LikeButton'
import RunningBanner from '@/components/RuningBanner'
import SectionSliderProductCard from '@/components/SectionSliderProductCard'
import StarRating from '@/components/StarRating'
import { SuperAdvantage } from '@/components/SuperAdvantage'  
import { VideoProductsSection } from '@/components/reelsSection/ReelsSection'
import Breadcrumb from '@/shared/Breadcrumb'
import axios from 'axios'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import GalleryImages from '../GalleryImages'
import ProductReviews from '../ProductReviews'
import ProductStatus from '../ProductStatus'
import AddToCartPanel from './AddToCartPanel'
import PrepaidDiscountBanner from './PrepaidDiscountBanner'
import { ProductProvider } from './ProductContext'
import ProductDescriptionExcerpt from './ProductDescriptionExcerpt'
import ProductFeatureAccordion from './ProductFeatureAccordion'
import ProductFormSection from './ProductFormSection'
import ProductInfoLinks from './ProductInfoLinks'
import ProductPointsBanner from './ProductPointsBanner'

async function fetchProductByHandle(handle) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await axios.get(`${baseUrl}/api/products/${handle}`)
    return response.data.data
  } catch (error) {
    console.error(`Error fetching product with handle ${handle}:`, error)
    return null
  }
}

async function fetchRelatedProducts(handle) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await axios.get(`${baseUrl}/api/products?all=true`)

    if (!response.data?.success || !Array.isArray(response.data?.data)) {
      console.error('Invalid API response:', response.data)
      return []
    }

    const allProducts = response.data.data
    const relatedProducts = allProducts.filter((p) => p.handle !== handle).slice(0, 6)

    return relatedProducts
  } catch (error) {
    console.error(`Error fetching related products for handle "${handle}":`, error)
    return []
  }
}

export async function generateMetadata({ params }) {
  const { handle } = await params
  const product = await fetchProductByHandle(handle)
  const title = product?.title || 'Product Detail'
  const description = product?.bodyHtml || 'Product detail page'
  return { title, description }
}

export default async function Page({ params }) {
  const { handle } = await params
  const product = await fetchProductByHandle(handle)
  const relatedProducts = await fetchRelatedProducts(handle)

  if (!product) {
    return notFound()
  }

  const galleryImages = product.images?.map((img) => img.src).filter(Boolean) || []

  const ratingCount =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.star, 0) / product.reviews.length
      : 0

  const transformedProduct = {
    ...product,
    featuredImage: product.images?.[0] || null,
    rating: ratingCount.toFixed(1) || 0.0,
    reviewNumber: product.reviews?.length || 0,
    price: product.variants?.[0]?.price || 0,
    compareAtPrice: product.variants?.[0]?.compareAtPrice,
    breadcrumbs: [
      { name: 'Home', href: '/' },
      { name: 'Products', href: '/products' },
      { name: product.productCategory || 'Category', href: '/products' },
    ],
  }

  const defaultVariant = product.variants?.[0]
  const defaultFlavorOption = product.options?.find((opt) => opt.name === 'Flavors')?.values?.[0] || ''
  const defaultSizeOption = product.options?.find((opt) => opt.name === 'Net Weight')?.values?.[0] || ''
  const netWeightOption = product.options?.find((opt) => opt.name === 'Net Weight')
  const netWeight = netWeightOption?.values?.[0] || ''

  const recommendedProducts = [...relatedProducts].sort(() => 0.5 - Math.random()).slice(0, 2)

  const features = [
    { name: 'Authenticity', image: '/Feature1.webp' },
    { name: 'Lab Tested', image: '/Feature2.webp' },
    { name: 'Informed Choice', image: '/Feature3.webp' },
  ]

  return (
    <ProductProvider defaultColor={defaultFlavorOption}>
      <main className="mt-3 w-full lg:mt-4">
        {/* Product Details Section with max-width container */}
        <div className="w-full px-4 sm:px-0">
          <div className="mb-4 block lg:block lg:px-[60px]">
            <Breadcrumb breadcrumbs={transformedProduct.breadcrumbs} currentPage={product.title} />
          </div>
          <div className="flex flex-col-reverse gap-8 lg:flex-row lg:gap-x-0">
            {/* LEFT SIDE - Product Info */}
            <div className="w-full pt-2 font-family-antonio uppercase md:pt-0 lg:w-[45%] lg:px-[60px] lg:pb-10">
              <div className="relative flex flex-col gap-y-10">
                {/* HEADING */}
                <div>
                  <div className="hidden lg:hidden">    
                    <Breadcrumb breadcrumbs={transformedProduct.breadcrumbs} currentPage={product.title} />
                  </div>
                  <h1 className="text-3xl font-semibold tracking-wider text-[#1b198f] md:mt-10 md:mb-5 md:text-[32px]">
                    {product.title}
                  </h1> 

                  <PrepaidDiscountBanner price={transformedProduct.price} />

                  <div className="mt-4 flex flex-col gap-y-2">
                    <div>
                      <div className="flex items-center gap-x-1 font-family-roboto text-[30px]">
                        <span className="self-center text-[20px] font-semibold text-[#1b198f] md:text-[30px] dark:text-neutral-100">
                          {transformedProduct.price ? `₹${transformedProduct.price.toLocaleString()}` : 'Free'}
                        </span>
                        {transformedProduct.compareAtPrice && (
                          <>
                            <del className="mx-2.5 self-center font-family-roboto text-[12px] font-medium text-black md:text-[24px]">
                              &#8377;{transformedProduct.compareAtPrice.toLocaleString('en-IN')}
                            </del>
                            {transformedProduct.price && (
                              <span className="self-center font-family-roboto text-[12px] font-bold text-green-600 md:text-[14px] dark:text-green-500">
                                -
                                {`${Math.round(((transformedProduct.compareAtPrice - transformedProduct.price) / transformedProduct.compareAtPrice) * 100)}% off`}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <p className="font-family-roboto text-[18px] text-neutral-500 capitalize dark:text-neutral-400">
                      Incl. of all taxes & shipping
                    </p>

                    <div className="mt-3 flex items-center gap-x-3 font-family-roboto">
                      <a href="#reviews" className="flex items-center text-sm font-medium">
                        <StarRating rating={parseFloat(transformedProduct.rating)} />
                        <div className="ms-1.5 flex items-center gap-x-2 border-l border-neutral-300 pl-2 dark:border-neutral-600">
                          <span className="text-black capitalize hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200">
                            {transformedProduct.reviewNumber} reviews
                          </span>
                        </div>
                      </a>
                      <ProductStatus status={product.status} />
                    </div>

                    <ProductDescriptionExcerpt htmlContent={product.bodyHtml} />

                    <ProductPointsBanner points={product.points} />

                    {/* FEATURES/GUARANTEES SECTION */}
                    <div className="mt-4 border-y border-neutral-200 dark:border-neutral-700">
                      <div className="-mx-4 flex">
                        {features.map((feature) => (
                          <div
                            key={feature.name}
                            className="flex flex-1 flex-col items-center justify-center gap-y-2 border-x border-neutral-200 px-3 py-3 first:border-l-0 last:border-r-0 sm:flex-row sm:gap-x-2 sm:gap-y-0 dark:border-neutral-700"
                          >
                            <Image src={feature.image} alt={feature.name} width={40} height={40} />

                            <span className="text-center font-family-roboto text-[16px] font-medium text-neutral-700 normal-case sm:text-left dark:text-neutral-300">
                              {feature.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ✅ UPDATED: Use the new ProductFormSection component */}
                <ProductFormSection
                  product={product}
                  transformedProduct={transformedProduct}
                  defaultFlavorOption={defaultFlavorOption}
                  defaultSizeOption={defaultSizeOption}
                />

                <ProductInfoLinks product={product} />
              </div>
            </div>

            {/* RIGHT SIDE - Gallery Images */}
            <div className="w-full lg:w-[55%] lg:pl-8">
              <div className="sticky top-8">
                <GalleryImages images={galleryImages} />
                <LikeButton className="absolute top-3 left-3" />
              </div>
            </div>
          </div>
        </div>

        {/* DETAIL AND REVIEW SECTIONS */}
        <div>
          <FrequentlyBoughtTogether products={relatedProducts} currentProduct={product} />

          <div className="md:mt-10 md:w-full">
            <VideoProductsSection showHeading={false} />
          </div>

          <div className="mt-9 w-full px-4 sm:mt-16 md:mt-12 md:px-0">
            <Image
              src="/ProductPageBanner-2.png"
              alt="Banner"
              width={1920}
              height={400}
              className="aspect-square h-auto w-full object-cover md:aspect-auto"
            />
          </div>

          <ProductReviews reviews={product.reviews} productHandle={product.handle} />

          <div className="mt-12 w-full px-4 sm:mt-16 md:px-0">
            <Image
              src="/ProductPageBanner-3.png"
              alt="Banner"
              width={1920}
              height={400}
              className="aspect-square h-auto w-full object-cover md:aspect-auto"
            />
          </div>

          <SuperAdvantage lesspadding={true} />
        </div>

        {/* FULL WIDTH SECTIONS - No container */}
        <div className="mt-12 sm:mt-16">
          <RunningBanner className="py-0" />
          <FaqSocialSection />
        </div>

        {/* RELATED PRODUCTS AND FEATURES */}
        <div className="mx-auto mt-12 max-w-7xl px-4 sm:mt-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-y-10 sm:gap-y-16">
            <SectionSliderProductCard
              data={relatedProducts}
              relatedProducts={relatedProducts}
              heading="Customers also purchased"
              subHeading=""
              headingFontClassName="text-3xl font-semibold"
              headingClassName="mb-12 text-neutral-900 dark:text-neutral-50"
            />
            <ProductFeatureAccordion />
          </div>
        </div>
        <AddToCartPanel product={product} isVisible={true} defaultFlavorOption={defaultFlavorOption} />
      </main>
    </ProductProvider>
  )
}
