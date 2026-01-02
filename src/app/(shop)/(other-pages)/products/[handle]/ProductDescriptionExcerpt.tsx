'use client'

import { useState, useMemo } from 'react'

interface ProductDescriptionExcerptProps {
  htmlContent: string
  initialLength?: number
  expandedLength?: number
}

const ProductDescriptionExcerpt: React.FC<ProductDescriptionExcerptProps> = ({
  htmlContent,
  initialLength = 80,
  expandedLength = 300,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const plainText = useMemo(() => {
    if (!htmlContent) return ''
    return htmlContent
      .replace(/<[^>]*>?/gm, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }, [htmlContent])

  if (!plainText) return null

  const visibleLength = isExpanded ? expandedLength : initialLength
  const isTruncatable = plainText.length > visibleLength

  const content = isTruncatable
    ? `${plainText.substring(0, visibleLength)}...`
    : plainText

  return (
    <div className="text-lg font-family-roboto md:mt-4 lowercase text-[#000000f2] dark:text-neutral-400">
      <p className="inline-block font-light">
        {content}{' '}
        {plainText.length > initialLength && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-block text-[#1b198f] hover:underline dark:text-primary-400 underline cursor-pointer"
          >
            {isExpanded ? 'Read less' : 'Read more'}
          </button>
        )}
      </p>
    </div>
  )
}

export default ProductDescriptionExcerpt
