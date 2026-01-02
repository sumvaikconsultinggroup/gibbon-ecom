'use client'

import StarReview from '@/components/StarReview'
import { Button } from '@/shared/Button/Button'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/shared/dialog'
import { Field, Fieldset, Label } from '@/shared/fieldset'
import { Input } from '@/shared/input'
import { Textarea } from '@/shared/textarea'
import { StarIcon } from '@heroicons/react/24/solid'
import { Message01FreeIcons, MessageAdd01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'

interface Review {
  _id: string
  star: number
  reviewerName: string
  reviewDescription: string
  image?: string | null
  createdAt: string
  updatedAt?: string
}

interface ProductReviewsProps {
  reviews: Review[]
  className?: string
  productHandle: string
}

const ProductReviews = ({ reviews, className, productHandle }: ProductReviewsProps) => {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [sortBy, setSortBy] = useState('newest')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const initialVisibleCount = 6

  // Calculate average rating
  const rating = reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.star, 0) / reviews.length : 0

  const reviewNumber = reviews.length

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    setIsImageModalOpen(true)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    try {
      setIsSubmitting(true)

      const reviewDescription = formData.get('review')?.toString() || ''
      const reviewerName = formData.get('reviewerName')?.toString() || ''
      const star = formData.get('rating') ? parseInt(formData.get('rating')?.toString() || '0', 10) : 0
      const imageFile = formData.get('reviewerImage') as File | null

      if (!reviewDescription || !reviewerName || star < 1 || star > 5) {
        toast.error('Please fill in all required fields and select a rating between 1 and 5 stars.')
        setIsSubmitting(false)
        return
      }

      // Only append image if it exists and has content
      if (imageFile && imageFile.size > 0) {
        formData.append('reviewerImage', imageFile)
      }

      // Make API call to add review
      const response = await fetch(`/api/reviews/${productHandle}`, {
        method: 'PUT',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit review')
      }

      if (result.success) {
        // Close the dialog after submission
        setIsOpen(false)

        // Show success message and refresh the page
        toast.success('Thank you for your review! It has been published successfully.')

        router.refresh()
      } else {
        throw new Error(result.message || 'Failed to submit review')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error(
        error instanceof Error ? error.message : 'There was an error submitting your review. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate rating distribution
  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0] // [1-star, 2-star, 3-star, 4-star, 5-star]

    reviews.forEach((review) => {
      if (review.star >= 1 && review.star <= 5) {
        distribution[review.star - 1]++
      }
    })

    return distribution.reverse() // Show 5-star first
  }

  const ratingDistribution = getRatingDistribution()

  const sortedReviews = useMemo(() => {
    const sorted = [...reviews] // Create a mutable copy
    switch (sortBy) {
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      case 'image-first':
        return sorted.sort((a, b) => {
          const aHasImage = !!a.image
          const bHasImage = !!b.image
          if (aHasImage && !bHasImage) return -1
          if (!aHasImage && bHasImage) return 1
          // If both have/don't have an image, sort by newest
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
      case 'newest':
      default:
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
  }, [reviews, sortBy])

  const visibleReviews = showAll ? sortedReviews : sortedReviews.slice(0, initialVisibleCount)

  return (
    <div className={clsx('mx-auto mt-12 max-w-7xl px-4 sm:mt-16 sm:px-6 lg:px-8 font-family-antonio', className)}>
      <div>
        {/* HEADING */}
        <div className="flex flex-col items-baseline justify-between gap-y-4 md:flex-row md:items-center">
          <h2 className="flex scroll-mt-8 items-center text-2xl font-semibold" id="reviews">
            <StarIcon className="mb-0.5 size-7 text-yellow-400" />
            <span className="ml-1.5">
              {rating.toFixed(1)} · {reviewNumber} {reviewNumber === 1 ? 'Review' : 'Reviews'}
            </span>
          </h2>
          <div className="flex items-center gap-x-4">
            {/* Write Review Button */}
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center bg-black px-3 py-2 text-sm text-white transition hover:bg-gray-800"
            >
              <HugeiconsIcon icon={MessageAdd01Icon} size={18} />
              <span className="ml-2">Write a review</span>
            </button>

            {/* Sort Dropdown */}
            <select
              name="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="min-w-[150px] border bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:outline-none"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="image-first">Image First</option>
            </select>
          </div>
        </div>

        {/* Rating Overview */}
        {reviewNumber > 0 && (
          <div className="mt-6 rounded-lg border border-neutral-200 p-6 dark:border-neutral-700">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              {/* Overall Rating */}
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">{rating.toFixed(1)}</div>
                <div className="mt-1 flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={clsx(
                        'size-4',
                        star <= Math.round(rating) ? 'text-yellow-400' : 'text-neutral-300 dark:text-neutral-600'
                      )}
                    />
                  ))}
                </div>
                <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {reviewNumber} {reviewNumber === 1 ? 'review' : 'reviews'}
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="flex-1">
                <div className="space-y-2">
                  {ratingDistribution.map((count, index) => {
                    const starValue = 5 - index
                    const percentage = reviewNumber > 0 ? (count / reviewNumber) * 100 : 0

                    return (
                      <div key={starValue} className="flex items-center gap-2 text-sm">
                        <span className="w-8 text-neutral-600 dark:text-neutral-400">{starValue}★</span>
                        <div className="h-2 flex-1 rounded-full bg-neutral-200 dark:bg-neutral-700">
                          <div
                            className="h-2 rounded-full bg-yellow-400 transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-neutral-600 dark:text-neutral-400">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="mx-auto mt-10 max-w-5xl">
          {reviews.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
                {visibleReviews.map((review) => {
                  const date = new Date(review.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                  return review.image ? (
                    // Card layout for reviews WITH an image
                    <div
                      key={review._id}
                      className="flex flex-col overflow-hidden border border-neutral-200 dark:border-neutral-700"
                    >
                      <div
                        className="relative aspect-[4/5] w-full cursor-pointer"
                        onClick={() => handleImageClick(review.image!)}
                      >
                        <img src={review.image} alt="Review" className="h-full w-full object-cover" />
                      </div>
                      <div className="flex grow flex-col p-3">
                        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                          {review.reviewerName}
                        </h3>
                        <div className="mt-1.5 flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon
                              key={star}
                              className={clsx(
                                'size-4',
                                star <= review.star ? 'text-yellow-400' : 'text-neutral-300 dark:text-neutral-600'
                              )}
                            />
                          ))}
                        </div>
                        <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">
                          {review.reviewDescription}
                        </p>
                        <p className="mt-auto pt-3 text-xs text-neutral-500 dark:text-neutral-400">{date}</p>
                      </div>
                    </div>
                  ) : (
                    // Standard layout for reviews WITHOUT an image
                    <div
                      key={review._id}
                      className="flex flex-col border border-neutral-200 p-4 dark:border-neutral-700"
                    >
                      <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {review.reviewerName}
                      </h3>
                      <div className="mt-1.5 flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon
                            key={star}
                            className={clsx(
                              'size-4',
                              star <= review.star ? 'text-yellow-400' : 'text-neutral-300 dark:text-neutral-600'
                            )}
                          />
                        ))}
                      </div>
                      <p className="mt-3 text-xs text-neutral-600 dark:text-neutral-400">{review.reviewDescription}</p>
                      <p className="mt-auto pt-4 text-xs text-neutral-500 dark:text-neutral-400">{date}</p>
                    </div>
                  )
                })}
              </div>
              {reviews.length > initialVisibleCount && (
                <div className="mt-10 flex justify-center">
                  <Button onClick={() => setShowAll(!showAll)}>
                    {showAll ? 'Show less reviews' : 'Show more reviews'}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center">
              <div className="mb-4 text-neutral-400 dark:text-neutral-500">
                <HugeiconsIcon icon={Message01FreeIcons} className="mx-auto mb-2 h-12 w-12" />
              </div>
              <p className="text-neutral-600 dark:text-neutral-400">
                No reviews yet. Be the first to review this product!
              </p>
            </div>
          )}
        </div>

        {/* Review Dialog */}
        <Dialog size="2xl" open={isOpen} onClose={setIsOpen}>
          <DialogTitle>
            <div className="flex items-center">
              <HugeiconsIcon icon={MessageAdd01Icon} size={20} className="mr-2" />
              Write a review
            </div>
          </DialogTitle>
          <DialogDescription>
            Share your experience with this product. Your review helps other customers make informed decisions.
          </DialogDescription>
          <DialogBody>
            <form onSubmit={handleSubmit} id="review-form">
              <Fieldset>
                <StarReview />

                <Field className="mt-5">
                  <Label>Your name *</Label>
                  <Input name="reviewerName" placeholder="Enter your name" required />
                </Field>

                <Field className="mt-5">
                  <Label>Your review *</Label>
                  <Textarea name="review" placeholder="Share your thoughts about this product..." rows={6} required />
                </Field>

                <Field className="mt-5">
                  <Label>Upload Image (Optional)</Label>
                  <Input name="reviewerImage" type="file" accept="image/*" />
                </Field>

                <div className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
                  <p>* Required fields</p>
                  <p className="mt-1">Your review will be published immediately.</p>
                </div>
              </Fieldset>
            </form>
          </DialogBody>
          <DialogActions>
            <Button size="smaller" plain onClick={() => setIsOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button size="smaller" type="submit" form="review-form" disabled={isSubmitting} className="cursor-pointer">
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-x-2">
                  <svg
                    className="h-5 w-5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 4.75V6.25"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                    <path
                      d="M17.1266 6.87347L16.0659 7.93413"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                    <path
                      d="M19.25 12L17.75 12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                    <path
                      d="M17.1266 17.1265L16.0659 16.0659"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                    <path
                      d="M12 17.75V19.25"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                    <path
                      d="M6.87347 17.1265L7.93413 16.0659"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                    <path
                      d="M4.75 12L6.25 12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                    <path
                      d="M6.87347 6.87347L7.93413 7.93413"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                  <span>Submitting...</span>
                </div>
              ) : (
                'Submit review'
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Image Modal */}
        <Dialog size="4xl" open={isImageModalOpen} onClose={() => setIsImageModalOpen(false)}>
          <DialogBody>
            {selectedImage && (
              <img src={selectedImage} alt="Review" className="max-h-[80vh] w-full rounded-lg object-contain" />
            )}
          </DialogBody>
        </Dialog>
      </div>
    </div>
  )
}

export default ProductReviews
