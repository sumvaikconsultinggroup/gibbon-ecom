import { StarIcon } from '@heroicons/react/24/solid'
import { FC } from 'react'

interface StarRatingProps {
  rating: number
  className?: string
}

const StarRating: FC<StarRatingProps> = ({ rating, className = '' }) => {
  const totalStars = 5
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 !== 0
  const emptyStars = totalStars - fullStars - (hasHalfStar ? 1 : 0)

  return (
    <div className={`flex items-center ${className}`}>
      {/* Full Stars */}
      {Array.from({ length: fullStars }).map((_, index) => (
        <StarIcon key={`full-${index}`} className="size-5 text-yellow-400" />
      ))}

      {/* Half Star */}
      {hasHalfStar && (
        <div className="relative">
          <StarIcon className="size-5 text-neutral-300 dark:text-neutral-600" />
          <div className="absolute top-0 left-0 h-full w-1/2 overflow-hidden">
            <StarIcon className="size-5 text-yellow-400" />
          </div>
        </div>
      )}

      {/* Empty Stars */}
      {Array.from({ length: emptyStars }).map((_, index) => (
        <StarIcon key={`empty-${index}`} className="size-5 text-neutral-300 dark:text-neutral-600" />
      ))}
    </div>
  )
}

export default StarRating