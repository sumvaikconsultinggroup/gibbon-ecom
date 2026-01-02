'use client'

import { useState } from 'react'
import Image from 'next/image'
import { XIcon } from 'lucide-react'

export default function ProductInfoLinks({ product }) {
  const [isOpen, setIsOpen] = useState(false)
  const [contentKey, setContentKey] = useState(null) // 'nutrition' or 'ingredients'

  const openDrawer = (key) => {
    setContentKey(key)
    setIsOpen(true)
  }

  const closeDrawer = () => {
    setIsOpen(false)
    // Delay clearing content to allow for exit animation
    setTimeout(() => setContentKey(null), 300)
  }

  const hasNutrition = !!product.nutrientsFactsImage
  const hasIngredients = !!product.ingredients

  if (!hasNutrition && !hasIngredients) {
    return null
  }

  return (
    <>
      <div className="font-family-antonio flex items-center justify-center gap-x-8">
        {hasNutrition && (
          <button
            type="button"
            onClick={() => openDrawer('nutrition')}
            className="cursor-pointer text-md font-semibold underline hover:text-primary-600 dark:hover:text-primary-400"
          >
            Nutritional Facts
          </button>
        )}
        {hasIngredients && (
          <button
            type="button"
            onClick={() => openDrawer('ingredients')}
            className="cursor-pointer text-md font-semibold underline hover:text-primary-600 dark:hover:text-primary-400"
          >
            Ingredients
          </button>
        )}
      </div>

      {/* Drawer */}
      <div
        className={`fixed inset-0 z-9999 flex transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60" onClick={closeDrawer} />

        {/* Content */}
        <div
          className={`relative flex h-full w-full max-w-md flex-col bg-white shadow-xl transition-transform duration-300 ease-in-out dark:bg-neutral-900 ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-700">
            <h2 className="text-lg font-semibold capitalize">{contentKey === 'nutrition' ? 'Nutritional Facts' : 'Ingredients'}</h2>
            <button type='button' onClick={closeDrawer} className="rounded-full p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800">
              <XIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {contentKey === 'nutrition' && product.nutrientsFactsImage && (
              <Image src={product.nutrientsFactsImage} alt="Nutritional Facts" width={500} height={700} className="h-auto w-full" />
            )}
            {contentKey === 'ingredients' && product.ingredients && (
              <p className="whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">{product.ingredients}</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}