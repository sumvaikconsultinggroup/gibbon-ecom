'use client'

import Prices from '@/components/Prices'
import { useCart } from '@/components/useCartStore'
import Breadcrumb from '@/shared/Breadcrumb'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Link as MyLink } from '@/shared/link'
import { InformationCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import Information from './Information'
import OrderSummary from './OrderSummary'
import Script from 'next/script'

// Track checkout event for live analytics
const trackCheckoutEvent = async (type: string, data: any) => {
  try {
    const sessionData = typeof window !== 'undefined' ? sessionStorage.getItem('_sid_data') : null
    const visitorId = typeof window !== 'undefined' ? localStorage.getItem('_vid') : null
    
    if (sessionData) {
      const { sessionId } = JSON.parse(sessionData)
      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          visitorId,
          type,
          data: {
            ...data,
            timestamp: new Date().toISOString(),
          },
        }),
        keepalive: true,
      })
    }
  } catch (e) {
    // Silently fail tracking
  }
}

// Declare Razorpay type
declare global {
  interface Window {
    Razorpay: any
  }
}

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
    removeAll,
  } = useCart()
  const [isFormValid, setIsFormValid] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const trackedRef = useRef(false)

  // Track checkout start when page loads
  useEffect(() => {
    if (!trackedRef.current && cartItems.length > 0) {
      trackedRef.current = true
      const cartValue = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      trackCheckoutEvent('checkout_start', {
        cartItems: cartItems.length,
        cartValue,
        page: '/checkout',
      })
    }
  }, [cartItems])

  // Create order in database
  const createOrder = async (paymentMethodType: string) => {
    if (!userInfo || !orderSummary) {
      throw new Error('Missing user information or order summary')
    }

    const response = await fetch('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cartItems.map((item) => ({
          productId: item.productId,
          variantId: item.variant?.id,
          name: item.name,
          variantTitle: item.variant?.name,
          quantity: item.quantity,
          price: item.price,
          compareAtPrice: item.comapreAtPrice,
          imageUrl: item.imageUrl,
          sku: item.variant?.option1Value,
        })),
        shippingAddress: {
          firstName: userInfo.name?.split(' ')[0] || '',
          lastName: userInfo.lastName || userInfo.name?.split(' ').slice(1).join(' ') || '',
          address1: userInfo.address1,
          address2: '',
          city: userInfo.city,
          state: userInfo.state,
          country: userInfo.country || 'India',
          zipCode: userInfo.zipcode,
          phone: userInfo.phone,
        },
        customerInfo: {
          email: userInfo.email,
          firstName: userInfo.name?.split(' ')[0] || '',
          lastName: userInfo.lastName || userInfo.name?.split(' ').slice(1).join(' ') || '',
          phone: userInfo.phone,
        },
        paymentMethod: paymentMethodType.toLowerCase(),
        subtotal: orderSummary.subtotal,
        discount: orderSummary.discount,
        shippingCost: orderSummary.shipping,
        tax: orderSummary.taxes,
        totalAmount: orderSummary.total,
      }),
    })

    const data = await response.json()
    if (!data.success) {
      throw new Error(data.message || 'Failed to create order')
    }

    return data.order
  }

  // Handle Razorpay payment
  const handleRazorpayPayment = async (order: any) => {
    try {
      // Create Razorpay order
      const razorpayResponse = await fetch('/api/payments/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.orderId,
          amount: order.totalAmount,
          customerInfo: {
            email: userInfo?.email,
            phone: userInfo?.phone,
            name: userInfo?.name,
          },
        }),
      })

      const razorpayData = await razorpayResponse.json()
      
      if (!razorpayData.success) {
        throw new Error(razorpayData.message || 'Failed to create Razorpay order')
      }

      // Open Razorpay checkout
      const options = {
        key: razorpayData.razorpayKeyId,
        amount: razorpayData.amount,
        currency: razorpayData.currency,
        name: 'Gibbon Nutrition',
        description: `Order #${order.orderNumber}`,
        order_id: razorpayData.razorpayOrderId,
        handler: async function (response: any) {
          // Verify payment
          try {
            const verifyResponse = await fetch('/api/payments/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: order.orderId,
              }),
            })

            const verifyData = await verifyResponse.json()
            
            if (verifyData.success) {
              // Track successful purchase
              trackCheckoutEvent('purchase', {
                orderId: order.orderId,
                orderTotal: order.totalAmount,
                paymentMethod: 'razorpay',
              })

              // Clear cart and redirect
              removeAll()
              router.push(`/payment/success/${order.orderId}`)
            } else {
              throw new Error(verifyData.message || 'Payment verification failed')
            }
          } catch (verifyError: any) {
            setErrorMessage(verifyError.message || 'Payment verification failed')
            setIsProcessing(false)
          }
        },
        prefill: {
          name: userInfo?.name,
          email: userInfo?.email,
          contact: userInfo?.phone,
        },
        theme: {
          color: '#1B198F',
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false)
            setErrorMessage('Payment cancelled')
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()

    } catch (error: any) {
      throw error
    }
  }

  // Handle PayU payment
  const handlePayUPayment = async (order: any) => {
    try {
      const payuResponse = await fetch('/api/payments/payu/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.orderId,
          amount: order.totalAmount,
          productInfo: `Order #${order.orderNumber}`,
          customerInfo: {
            email: userInfo?.email,
            phone: userInfo?.phone,
            firstName: userInfo?.name?.split(' ')[0] || '',
            lastName: userInfo?.lastName || userInfo?.name?.split(' ').slice(1).join(' ') || '',
          },
        }),
      })

      const payuData = await payuResponse.json()
      
      if (!payuData.success) {
        throw new Error(payuData.message || 'Failed to create PayU order')
      }

      // Create form and submit to PayU
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = payuData.payuData.payuUrl

      const fields = payuData.payuData
      Object.keys(fields).forEach((key) => {
        if (key !== 'payuUrl') {
          const input = document.createElement('input')
          input.type = 'hidden'
          input.name = key
          input.value = fields[key]
          form.appendChild(input)
        }
      })

      document.body.appendChild(form)
      form.submit()

    } catch (error: any) {
      throw error
    }
  }

  // Handle COD order
  const handleCODOrder = async (order: any) => {
    // Track successful purchase
    trackCheckoutEvent('purchase', {
      orderId: order.orderId,
      orderTotal: order.totalAmount,
      paymentMethod: 'cod',
    })

    // Clear cart and redirect
    removeAll()
    router.push(`/order-successful?orderId=${order.orderId}`)
  }

  const handleConfirmOrder = async () => {
    if (!isFormValid || !paymentMethod || !userInfo || !orderSummary) {
      setErrorMessage('Please complete all required fields')
      return
    }

    setIsProcessing(true)
    setErrorMessage('')

    try {
      // Create order first
      const order = await createOrder(paymentMethod)

      // Set order details in store
      setOrderDetails({
        orderId: order.orderId,
        name: userInfo.name,
        phone: userInfo.phone,
        address: userInfo.address,
        email: userInfo.email,
        cartItems: cartItems,
        price: orderSummary.total,
        discount: orderSummary.discount,
        paymentMethod: paymentMethod,
      })

      // Handle payment based on method
      if (paymentMethod === 'Prepaid') {
        // Try Razorpay first (can be configured in settings)
        await handleRazorpayPayment(order)
      } else if (paymentMethod === 'COD') {
        await handleCODOrder(order)
      } else {
        throw new Error('Invalid payment method')
      }

    } catch (error: any) {
      console.error('Checkout error:', error)
      setErrorMessage(error.message || 'Failed to process order. Please try again.')
      setIsProcessing(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <main className="container py-16 lg:pt-20 lg:pb-28">
        <div className="flex flex-col items-center justify-center py-20">
          <h1 className="text-2xl font-semibold mb-4">Your cart is empty</h1>
          <p className="text-neutral-500 mb-8">Add some products to your cart to checkout.</p>
          <Link 
            href="/collections/all"
            className="bg-[#1B198F] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#1B198F]/90 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    )
  }

  return (
    <>
      {/* Load Razorpay script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
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

        {errorMessage && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {errorMessage}
            <button 
              onClick={() => setErrorMessage('')}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

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

            <ButtonPrimary 
              className="mt-8 w-full" 
              onClick={handleConfirmOrder} 
              disabled={!isFormValid || !paymentMethod || isProcessing}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                'Confirm order'
              )}
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
                {` `} information
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default CheckoutPage
