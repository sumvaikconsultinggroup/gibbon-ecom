'use client'

import NcInputNumber from '@/components/NcInputNumber'
import Prices from '@/components/Prices'
import { useCart } from '@/components/useCartStore'
import { TCardProduct } from '@/data/data'
import Breadcrumb from '@/shared/Breadcrumb'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Link as MyLink } from '@/shared/link'
import { Coordinate01Icon, InformationCircleIcon, PaintBucketIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Information from './Information'
import OrderSummary from './OrderSummary'

const CheckoutPage = () => {
  const router = useRouter()
  const {
    items: cartItems,
    userInfo,
    orderSummary,
    paymentMethod,
    setUserInfo,
    setOrderSummary,
    setOrderDetails,
    setOrderSuccess,
    setPaymentMethod,
  } = useCart()
  const [isFormValid, setIsFormValid] = useState(false)

  console.log('try to fix shit v1', userInfo)

  const handleConfirmOrder = async () => {
    if (isFormValid && paymentMethod && userInfo && orderSummary) {
      const orderId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      setOrderDetails({
        orderId: orderId,
        name: userInfo.name,
        phone: userInfo.phone,
        address: userInfo.address,
        email: userInfo.email,
        cartItems: cartItems,
        price: orderSummary.total,
        discount: orderSummary.discount,
        paymentMethod: paymentMethod,
      })
      setOrderSuccess(true)
      if (paymentMethod === 'Prepaid') {
        router.push('/checkout/pay-u-checkout')
      } else {
        try {
          const response = await fetch(' http://localhost:3000/api/order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user: {
                firstName: userInfo.name,
                email: userInfo.email,
                phone: userInfo.phone,
              },
              products: cartItems.map((item) => ({
                productId: item.id,
                title: item.name,
                quantity: item.quantity,
                variant: {
                  price: item.price,
                  option1Value: item.variant?.option1Value || '',
                  image: item.imageUrl || '',
                },
              })),
              totalAmount: orderSummary.total,
              deliveryAddress: userInfo.address,
              payment: {
                method: paymentMethod,
              },
            }),
          })

          const data = await response.json()

          if (data.success) {
            router.push('/order-successful')
          } else {
            alert(data.message || 'Failed to place order')
            setOrderSuccess(false)
          }
        } catch (error) {
          console.error('Error placing order:', error)
          alert('Failed to place order')
          setOrderSuccess(false)
        }
      }
    }
  }

  const renderProduct = (product: TCardProduct) => {
    const { image, price, name, handle, id, size, color, quantity } = product

    return (
      <div key={id} className="relative flex py-8 first:pt-0 last:pb-0 sm:py-10 xl:py-12">
        <div className="relative h-36 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:w-32">
          {image?.src && (
            <Image
              fill
              src={image || '/placeholder-images.webp'}
              alt={image.alt || ''}
              sizes="300px"
              className="object-contain object-center"
              priority
            />
          )}
          <Link href={'/products/' + handle} className="absolute inset-0"></Link>
        </div>

        <div className="ml-3 flex flex-1 flex-col sm:ml-6">
          <div>
            <div className="flex justify-between">
              <div className="flex-[1.5]">
                <h3 className="text-base font-semibold">
                  <Link href={'/products/' + handle}>{name}</Link>
                </h3>
                <div className="mt-1.5 flex text-sm text-neutral-600 sm:mt-2.5 dark:text-neutral-300">
                  <div className="flex items-center gap-x-2">
                    <HugeiconsIcon icon={PaintBucketIcon} size={16} color="currentColor" strokeWidth={1.5} />
                    <span>{color}</span>
                  </div>
                  <span className="mx-4 border-l border-neutral-200 dark:border-neutral-700"></span>
                  <div className="flex items-center gap-x-2">
                    <HugeiconsIcon icon={Coordinate01Icon} size={16} color="currentColor" strokeWidth={1.5} />
                    <span>{size}</span>
                  </div>
                </div>

                <div className="relative mt-3 flex w-full justify-between sm:hidden">
                  <select
                    name="qty"
                    id="qty"
                    defaultValue={quantity}
                    className="form-select relative z-10 rounded-md bg-white px-2 py-1 text-xs outline-1 outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-neutral-800"
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                  </select>
                  <Prices contentClass="py-1 px-2 md:py-1.5 md:px-2.5 text-sm font-medium h-full" price={price || 0} />
                </div>
              </div>

              <div className="hidden flex-1 justify-end sm:flex">
                <Prices price={price || 0} className="mt-0.5" />
              </div>
            </div>
          </div>

          <div className="mt-auto flex items-end justify-between pt-4 text-sm">
            <div className="hidden sm:block">
              <NcInputNumber className="relative z-10" />
            </div>

            <div className="relative z-10 mt-3 flex items-center text-sm font-medium text-primary-600 hover:text-primary-500">
              <span>Remove</span>
            </div>
          </div>
        </div>
      </div>
    ) 
  }

  return (
    <main className="container py-16 lg:pt-20 lg:pb-28">
      <div className="mb-16">
        <h1 className="mb-5 block text-3xl font-semibold lg:text-4xl">Checkout</h1>
        <Breadcrumb
          breadcrumbs={[
            { id: 1, name: 'Home', href: '/' },
            { id: 2, name: 'Cart', href: '/cart' },
          ]}
          currentPage="Checkout"
        />
      </div>

      <div className="flex flex-col lg:flex-row">
        <div className="flex-1">
          <Information
            onUpdateUserInfo={setUserInfo}
            onUpdatePaymentMethod={setPaymentMethod}
            onUpdateValidation={setIsFormValid}
          />
        </div>

        <div className="my-10 shrink-0 border-t lg:mx-10 lg:my-0 lg:border-t-0 lg:border-l xl:lg:mx-14 2xl:mx-16" />

        <div className="w-full lg:w-[36%]">
          <div className="mt-8 divide-y divide-neutral-200/70 dark:divide-neutral-700">
            <OrderSummary onSummaryUpdate={setOrderSummary} />
          </div>

          <ButtonPrimary className="mt-8 w-full" onClick={handleConfirmOrder} disabled={!isFormValid || !paymentMethod}>
            Confirm order
          </ButtonPrimary>
          <div className="mt-5 flex items-center justify-center text-sm text-neutral-500 dark:text-neutral-400">
            <p className="relative block pl-5">
              <HugeiconsIcon
                icon={InformationCircleIcon}
                size={16}
                color="currentColor"
                className="absolute top-0.5 -left-1"
                strokeWidth={1.5}
              />
              Learn more{` `}
              <MyLink
                target="_blank"
                rel="noopener noreferrer"
                href="#"
                className="font-medium text-neutral-900 underline dark:text-neutral-200"
              >
                Taxes
              </MyLink>
              <span>
                {` `}and{` `}
              </span>
              <MyLink
                target="_blank"
                rel="noopener noreferrer"
                href="#"
                className="font-medium text-neutral-900 underline dark:text-neutral-200"
              >
                Shipping
              </MyLink>
              {` `} infomation
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default CheckoutPage
