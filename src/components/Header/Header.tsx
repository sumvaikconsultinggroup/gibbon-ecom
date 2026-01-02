import { getCollections } from '@/data/data'
import { getCurrencies, getHeaderDropdownCategories, getLanguages, getNavMegaMenu } from '@/data/navigation'
import { SignedIn, SignedOut } from '@clerk/nextjs'
import clsx from 'clsx'
import Image from 'next/image'
import AllProductMegaMenu from '../AllProductMegaMenu'
import { Link } from '../Link'
import CartBtn from './CartBtn'
import CategoriesDropdown from './CategoriesDropdown'
import HamburgerBtnMenu from './HamburgerBtnMenu'
import SearchBtnPopover from './SearchBtnPopover'
import WishlistBtn from './WishlistBtn'
import AccountDropdown from './AccountDropdown'

const Header = async ({ hasBorderBottom = true }) => {
  const megamenu = await getNavMegaMenu()
  const dropdownCategories = await getHeaderDropdownCategories()
  const currencies = await getCurrencies()
  const languages = await getLanguages()
  const featuredCollections = (await getCollections()).slice(7, 11)

  return (
    <div
      className={clsx(
        'sticky z-20 flex  border-b items-center justify-between border-neutral-200 bg-white font-family-antonio md:top-0 md:h-18 dark:border-neutral-700 dark:bg-neutral-900',
        hasBorderBottom && 'border-b',
        !hasBorderBottom && 'has-[.header-popover-full-panel]:border-b'
      )}
    >
      {/* Left Section */}
      <div className="flex h-full items-center pl-4 md:pl-0">
        <HamburgerBtnMenu />
        <CategoriesDropdown className="hidden h-full items-center md:flex" />
        <AllProductMegaMenu className="hidden h-full items-center border-x border-neutral-200 px-4 md:flex dark:border-neutral-700" />
      </div>

      {/* Center Section */}
      <div className="absolute left-1/2 z-20 hidden -translate-x-1/2 md:block">
        <Link href="/">
          <Image
            src="/GibbonLogoEccom.png"
            alt="Gibbon Nutrition Logo"
            width={200}
            height={60}
            className="h-16 w-auto"
          />
        </Link>
      </div>

      {/* Right Section */}
      <div className="flex h-full items-center">
        <div className="flex h-full items-center border-x border-neutral-200 px-4 dark:border-neutral-700">
          <div className="text-[15px] font-medium">
            <SearchBtnPopover />
          </div>
        </div>
        <div className="hidden h-full items-center border-r border-neutral-200 px-4 md:flex dark:border-neutral-700">
          <div className="text-[15px] font-medium">
            <WishlistBtn />
          </div>
        </div>
        <div className="flex h-full items-center border-r border-neutral-200 px-4 dark:border-neutral-700">
          <div className="text-[15px] font-medium">
            <CartBtn />
          </div>
        </div>
        <SignedIn>
          <div className="flex h-full items-center border-r border-neutral-200 px-4 dark:border-neutral-700">
            <div className="text-[15px] font-medium">
              <AccountDropdown />
            </div>
          </div>
        </SignedIn>
        <SignedOut>
          <div className="flex h-full items-center border-r border-neutral-200 px-4 dark:border-neutral-700">
            <Link
              href="/sign-in"
              className="flex items-center justify-center hover:text-gray-900 dark:hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="text-black-700 h-6 w-6 font-bold dark:text-gray-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </Link>
          </div>
        </SignedOut>
      </div>
    </div>
  )
}

export default Header
