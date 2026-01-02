'use client'
import clsx from 'clsx'
import { Trash2Icon } from 'lucide-react'
import Image from 'next/image'
import { Link } from './Link'
import Prices from './Prices'
import { Aside } from './aside/aside'
import { CartItem, useCart } from './useCartStore'

interface Props {
  className?: string
}

const CartProgressBar = ({ total }: { total: number }) => {
  const freeShippingThreshold = 1000
  const discount5Threshold = 5000
  const discount10Threshold = 10000

  const progress = Math.min((total / discount10Threshold) * 100, 100)
  const freeShippingAchieved = total >= freeShippingThreshold
  const discount5Achieved = total >= discount5Threshold
  const discount10Achieved = total >= discount10Threshold

  let message
  if (discount10Achieved) {
    message = `You've unlocked 10% OFF!`
  } else if (total < discount5Threshold) {
    message = `You are ₹ ${(discount5Threshold - total).toFixed(2)} away from 5% OFF!`
  } else {
    message = `You are ₹ ${(discount10Threshold - total).toFixed(2)} away from 10% OFF!`
  }

  return (
    <div className="space-y-3 border-b border-neutral-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center gap-2">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full ${freeShippingAchieved ? 'bg-[#1b198f]' : 'bg-gray-200'}`}
          >
            {freeShippingAchieved ? (
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span
            className={`inline-block font-family-roboto text-[12px] font-medium ${freeShippingAchieved ? 'text-[#1b198f]' : 'text-gray-500'}`}
          >
            Free Shipping
          </span>
        </div>
        <div className="flex flex-col-reverse items-center gap-2">
          <span className={`font-family-roboto text-[12px] ${discount5Achieved ? 'text-[#1b198f]' : 'text-gray-500'}`}>
            5% Off
          </span>
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full ${discount5Achieved ? 'bg-[#1b198f]' : 'bg-gray-200'}`}
          >
            {discount5Achieved ? (
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            )}
          </div>
        </div>
        <div className="flex flex-col-reverse items-center gap-2">
          <span className={`font-family-roboto text-[12px] ${discount10Achieved ? 'text-[#1b198f]' : 'text-gray-500'}`}>
            10% Off
          </span>
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full ${discount10Achieved ? 'bg-[#1b198f]' : 'bg-gray-200'}`}
          >
            {discount10Achieved ? (
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            )}
          </div>
        </div>
      </div>
      <div className="relative h-1.5 overflow-hidden rounded-full bg-gray-200">
        <div className="h-full bg-[#1b198f] transition-all duration-300 ease-in-out" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-center text-sm font-medium text-[#1b198f]">{message}</p>
    </div>
  )
}

const AsideSidebarCart = ({ className = '' }: Props) => {
  const { items, removeItem, updateItemQuantity } = useCart()
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <Aside
      openFrom="right"
      type="cart"
      heading="Your Cart"
      className="z-2147483638"
      contentMaxWidthClassName="max-w-none !w-[500px] !max-w-[calc(100%-16px)] !m-2.5 !rounded-[15px] !h-[calc(100vh-20px)]"
    >
      <div className={clsx('flex h-full flex-col', className)}>
        <CartProgressBar total={subtotal} />
        {/* CONTENT */}
        <div className="hidden-scrollbar flex-1 overflow-x-hidden overflow-y-auto px-6 py-6">
          {items.length > 0 ? (
            <div className="flow-root">
              <ul role="list" className="-my-6 divide-y divide-neutral-900/10 dark:divide-neutral-100/10">
                {items.map((product) => (
                  <CartProduct
                    key={product.id}
                    product={product}
                    removeItem={removeItem}
                    updateItemQuantity={updateItemQuantity}
                  />
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="text-neutral-500 dark:text-neutral-400">Your cart is empty.</p>
            </div>
          )}
        </div>

        {/* FOOTER  */}
        <section
          aria-labelledby="summary-heading"
          className="mt-auto grid shrink-0 gap-4 border-t border-neutral-900/10 px-6 py-6 dark:border-neutral-100/10"
        >
          <h2 id="summary-heading" className="sr-only">
            Order summary
          </h2>
          <div>
            <div className="flex justify-between items-center text-base font-medium font-family-roboto text-[#1b198f]">
              <p className="font-medium text-[16.8px]">Subtotal ({totalItems} items)</p>
              <span className="mt-0.5 text-[16.8px]">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="mt-4 flex justify-center">
              <div className="w-full rounded-full bg-black py-2 text-center text-xs text-white">
                All discounts will be applied at checkout
              </div>
            </div>
            <div className="mt-4">
              <Link
                href={'/checkout'}
                className="relative flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden border-black bg-[#1B198F] py-2 font-family-roboto text-lg font-medium text-white uppercase shadow-[4px_6px_0px_black] transition-[box-shadow_250ms,transform_250ms,filter_50ms] before:absolute before:inset-0 before:z-[-1] before:-translate-x-full before:bg-[#2a75b3] before:transition-transform before:duration-250 before:content-[''] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_3px_0px_black] hover:before:translate-x-0"
              >
                <span>Checkout</span>
                <div className="flex -space-x-2">
                  {['/paytm.png', '/phonepe.png', '/google.png'].map((src, i) => (
                    <div key={i} className="relative h-6 w-6 overflow-hidden rounded-full border border-white bg-white">
                      <Image src={src} alt="payment icon" fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </Link>
            </div>
            <div className="mt-6 flex justify-center text-center text-sm text-black dark:text-neutral-400">
              <p className="text-xs font-medium">
                or{' '}
                <Link href={'/collections/all'} className="hover :underline text-xs font-medium uppercase">
                  Continue Shopping<span aria-hidden="true"> →</span>
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </Aside>
  )
}

interface CartProductProps {
  product: CartItem
  removeItem: (id: string) => void
  updateItemQuantity: (id: string, quantity: number) => void
}

const CartProduct = ({ product, removeItem, updateItemQuantity }: CartProductProps) => {
  const { id, name, price, imageUrl, variant, quantity, productId, comapreAtPrice, handle } = product


  const handleDecrement = () => {
    if (quantity > 1) {
      updateItemQuantity(id, quantity - 1)
    }
  }

  const handleIncrement = () => {
    if (quantity < 99) {
      updateItemQuantity(id, quantity + 1)
    }
  }

  return (
    <div className="flex py-5 last:pb-0">
      <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-neutral-100">
        {imageUrl && <Image fill src={imageUrl} alt={name} className="object-contain" sizes="200px" />}
        <Link className="absolute inset-0" href={`/products/${handle}`} />
      </div>

      <div className="ml-4 flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between">
            <h3 className="font-family-roboto text-[14px] font-bold text-[#1b198f] uppercase">
              <Link href={'/products/' + handle}>{name}</Link>
            </h3>
            <button type="button" onClick={() => removeItem(id)} className="font-medium">
              <Trash2Icon className="size-4 text-gray-400" />
            </button>
          </div>
          {variant && (
            <p className="mt-1 font-family-roboto text-sm text-neutral-500 dark:text-neutral-400">
              {[variant.option1Value, variant.option2Value].filter(Boolean).join(' / ')}
            </p>
          )}
        </div>
        <div className="mt-2 flex items-end justify-between text-sm">
          <div className="flex items-center border border-neutral-300 dark:border-neutral-600">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={quantity <= 1}
              className="flex h-7 w-7 items-center justify-center px-2 transition-colors hover:bg-neutral-100 disabled:opacity-50 dark:hover:bg-neutral-800"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="flex h-7 min-w-8 items-center justify-center border-x border-neutral-300 text-sm font-medium dark:border-neutral-600">
              {quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrement}
              disabled={quantity >= 99}
              className="flex h-7 w-7 items-center justify-center px-2 transition-colors hover:bg-neutral-100 disabled:opacity-50 dark:hover:bg-neutral-800"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <div className="flex items-baseline gap-x-1">
            <span className="font-family-roboto text-[14px] font-bold text-[#1b198f]">
              ₹{(price || 0).toLocaleString('en-IN')}
            </span>
            {comapreAtPrice && (
              <del className="font-family-roboto text-[12px] text-gray-400">
                ₹{comapreAtPrice.toLocaleString('en-IN')}
              </del>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AsideSidebarCart
