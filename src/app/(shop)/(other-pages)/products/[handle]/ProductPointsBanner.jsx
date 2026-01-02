import InfoTooltip from '@/components/InfoTooltip'

const ProductPointsBanner = ({ points }) => {
  if (!points) return null

  return (
    <div className="mt-4 inline-flex max-w-full items-center gap-x-2 rounded-sm bg-primary-700 p-1 pl-3 font-family-roboto text-sm text-white md:w-[380px]">
      <span className="inline-flex items-center gap-1 text-[16px]">
        <span className="whitespace-normal">Earn up to {points} Points on this purchase</span>
        <InfoTooltip content="Points will be rewarded once order is fulfilled" />
      </span>
    </div>
  )
}

export default ProductPointsBanner