'use client'

import { Link } from '@/components/Link'
import { usePathname } from 'next/navigation'

const pages: {
  name: string
  link: string
  icon: string
}[] = [
  {
    name: 'Settings',
    link: '/account',
    icon: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
  },
  {
    name: 'Wishlists',
    link: '/account-wishlists',
    icon: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>`,
  },
  {
    name: 'Orders',
    link: '/orders',
    icon: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>`,
  },
  {
    name: 'Wallet',
    link: '/account-wallet',
    icon: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a1 1 0 11-2 0 1 1 0 012 0z" /></svg>`,
  },
  // {
  //   name: 'Password',
  //   link: '/account-password',
  //   icon: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>`,
  // },
  // {
  //   name: 'Billing',
  //   link: '/account-billing',
  //   icon: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>`,
  // },
]

const PageTab = () => {
  const pathname = usePathname()

  return (
    <div className="p-2">
      <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-0">
        {pages.map((item, index) => {
          let isActive = pathname === item.link
          if (item.link === '/orders' && pathname.includes('/orders/')) {
            isActive = true
          }

          return (
            <Link
              key={item.link}
              href={item.link}
              className={`group relative flex flex-col items-center gap-2 rounded-xl px-4 py-4 font-family-roboto text-sm font-semibold transition-all duration-300 sm:flex-row sm:gap-3 sm:rounded-none sm:border-b-4 sm:py-5 ${
                isActive
                  ? 'bg-linear-to-br from-[#1B198F] to-[#3086C8] text-white shadow-lg sm:border-[#1B198F] sm:bg-none sm:text-[#1B198F] sm:shadow-none dark:sm:text-[#3086C8]'
                  : 'border-transparent bg-neutral-50 text-neutral-600 hover:bg-neutral-100 sm:bg-transparent sm:text-neutral-500 sm:hover:border-neutral-300 sm:hover:bg-transparent sm:hover:text-neutral-900 dark:bg-neutral-700/30 dark:text-neutral-400 dark:hover:bg-neutral-700/50 dark:sm:hover:text-neutral-100'
              }`}
            >
              {/* Icon */}
              <span
                className={`transition-transform duration-300 ${
                  isActive ? 'scale-110' : 'group-hover:scale-110'
                }`}
                dangerouslySetInnerHTML={{ __html: item.icon }}
              />
              
              {/* Label */}
              <span className="text-center sm:text-left">{item.name}</span>

              {/* Active Indicator Dot (Mobile) */}
              {isActive && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-white sm:hidden" />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default PageTab
