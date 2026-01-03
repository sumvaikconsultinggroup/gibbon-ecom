import { getCollections } from '@/data/data'
import { getCurrencies, getHeaderDropdownCategories, getLanguages, getNavMegaMenu } from '@/data/navigation'
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
import HeaderAuthButton from './HeaderAuthButton'

const Header = async ({ hasBorderBottom = true }) => {
  const megamenu = await getNavMegaMenu()
  const dropdownCategories = await getHeaderDropdownCategories()
  const currencies = await getCurrencies()
  const languages = await getLanguages()
  const featuredCollections = (await getCollections()).slice(7, 11)

  return (
    <header
      className={clsx(
        'sticky top-0 z-40 bg-white/95 backdrop-blur-md transition-all duration-300 dark:bg-neutral-900/95',
        hasBorderBottom && 'border-b border-neutral-200 dark:border-neutral-700',
        !hasBorderBottom && 'has-[.header-popover-full-panel]:border-b'
      )}
    >
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:h-20 lg:px-0">
          {/* Left Section - Mobile Menu & Categories */}
          <div className="flex items-center gap-2 lg:gap-4">
            <HamburgerBtnMenu />
            <CategoriesDropdown className="hidden lg:flex" />
            <AllProductMegaMenu className="hidden h-full items-center lg:flex" />
          </div>

          {/* Center - Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:relative lg:left-0 lg:top-0 lg:translate-x-0 lg:translate-y-0">
            <Link href="/" className="block">
              <Image
                src="/GibbonLogoEccom.png"
                alt="Gibbon Nutrition Logo"
                width={160}
                height={48}
                className="h-10 w-auto sm:h-12 lg:h-14"
                priority
              />
            </Link>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800">
              <SearchBtnPopover />
            </div>

            {/* Wishlist - Hidden on Mobile */}
            <div className="hidden h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-neutral-100 sm:flex dark:hover:bg-neutral-800">
              <WishlistBtn />
            </div>

            {/* Cart */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800">
              <CartBtn />
            </div>

            {/* Account */}
            <HeaderAuthButton />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
