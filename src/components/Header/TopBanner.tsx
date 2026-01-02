import { Link } from '../Link'

const TopBanner = () => {
  return (
    <div className="bg-white px-4 py-2 sm:py-3 font-['Roboto',serif] text-black dark:bg-neutral-800 dark:text-white border-b border-gray-200 dark:border-neutral-700/40">
      <div className="text-center">
        <h5 className="m-0">
          <Link
            href="/promo"
            className="group inline-flex items-center justify-center text-xs sm:text-[15px] font-medium hover:underline"
          >
            Get 3% Pre Paid Bonus
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="ml-1.5 h-4 w-4 sm:h-6 sm:w-6 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M2 10a.75.75 0 01.75-.75h12.59l-2.1-1.95a.75.75 0 111.02-1.1l3.5 3.25a.75.75 0 010 1.1l-3.5 3.25a.75.75 0 11-1.02-1.1l2.1-1.95H2.75A.75.75 0 012 10z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </h5>
      </div>
    </div>
  )
}

export default TopBanner
