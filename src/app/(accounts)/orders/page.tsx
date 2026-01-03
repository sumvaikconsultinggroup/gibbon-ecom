'use client'

import { Link } from '@/components/Link'
import Prices from '@/components/Prices'
import Image from 'next/image'
import { useEffect, useState } from 'react'

// Define types based on API response
interface IOrderItem {
  productId: string
  name: string
  productName?: string
  quantity: number
  price: number
  image?: string
  flavours?: string[]
}

interface IOrder {
  _id: string
  createdAt: string
  status: string
  totalAmount: number
  items: IOrderItem[]
}

const Order = ({ order }: { order: IOrder }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800">
      <div className="flex flex-col gap-4 border-b border-neutral-200 bg-neutral-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-neutral-700 dark:bg-neutral-800/50">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href={'/orders/' + order._id}
              className="font-family-antonio text-lg font-bold text-[#1B198F] hover:underline dark:text-[#3086C8]"
            >
              #{order._id.slice(-6).toUpperCase()}
            </Link>
            <span className="rounded-full bg-[#3086C8]/10 px-2.5 py-0.5 text-xs font-bold text-[#3086C8] uppercase">
              {order.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href={'/orders/' + order._id}
            className="inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600"
          >
            View order
          </Link>
        </div>
      </div>
      <div className="divide-y divide-neutral-200 px-6 dark:divide-neutral-700">
        {order.items.map((item, index) => (
          <div key={index} className="flex py-6">
            <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:w-20">
              <Image
                fill
                sizes="100px"
                src={item.image || '/placeholder-images.webp'}
                alt={item.name || 'Product Image'}
                className="h-full w-full object-cover object-center"
              />
            </div>

            <div className="ml-4 flex flex-1 flex-col">
              <div>
                <div className="flex justify-between">
                  <div>
                    <h3 className="line-clamp-1 text-base font-medium text-neutral-900 dark:text-neutral-100">
                      {item.name || item.productName}
                    </h3>
                    {item.flavours && item.flavours.length > 0 && (
                      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        <span>{item.flavours.join(', ')}</span>
                      </p>
                    )}
                  </div>
                  <Prices className="mt-0.5 ml-2" price={item.price || 0} />
                </div>
              </div>
              <div className="flex flex-1 items-end justify-between text-sm">
                <p className="flex items-center text-neutral-500 dark:text-neutral-400">
                  <span className="hidden sm:inline-block">Qty</span>
                  <span className="inline-block sm:hidden">x</span>
                  <span className="ml-2">{item.quantity}</span>
                </p>

                <div className="flex">
                  <Link
                    href={'/products/' + item.productId}
                    className="font-medium text-[#3086C8] hover:text-[#1B198F] dark:hover:text-[#3086C8]"
                  >
                    Leave review
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const Page = () => {
  const [orders, setOrders] = useState<IOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orderHistory')
        if (res.ok) {
          const text = await res.text()
          try {
            const data = JSON.parse(text)
            setOrders(data.orders || [])
          } catch (e) {
            console.error('Failed to parse orders response')
          }
        }
      } catch (error) {
        console.error('Failed to fetch orders', error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="size-10 animate-spin rounded-full border-4 border-neutral-200 border-t-primary-500 dark:border-neutral-700 dark:border-t-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-y-10 sm:gap-y-12">
      {/* HEADING */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-family-antonio text-3xl font-bold text-[#1B198F] uppercase dark:text-[#3086C8]">
          Order history
        </h2>
        <p className="font-family-roboto text-neutral-600 dark:text-neutral-400">View and manage your recent orders.</p>
      </div>
      {orders.length > 0 ? (
        <div className="space-y-8">
          {orders.map((order) => (
            <Order key={order._id} order={order} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 py-20 text-center dark:border-neutral-700 dark:bg-neutral-800/50">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#3086C8]/10 text-[#3086C8]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
          </div>
          <h3 className="font-family-antonio text-2xl font-bold text-[#1B198F] uppercase dark:text-[#3086C8]">
            No orders yet
          </h3>
          <p className="mt-2 max-w-md px-4 text-neutral-500 dark:text-neutral-400">
            You haven't placed any orders yet. Explore our collection and find something you love!
          </p>
          <Link
            href="/"
            className="mt-8 inline-block rounded-lg bg-[#1B198F] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#3086C8]"
          >
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  )
}

export default Page
