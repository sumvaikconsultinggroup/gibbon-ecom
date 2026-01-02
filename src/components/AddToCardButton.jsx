// src/components/AddToCartButton.jsx (Example)
'use client'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'

import { useCart } from './useCartStore'


export default function AddToCartButton({ product, products, blackVariant = true }) {
  const { addItem, addMultipleToCart } = useCart()



  const handleAddToCart = () => {
    if (products) {
        addMultipleToCart(products)
    } else if (product) {
        addItem(product)
    }
  }

  return blackVariant ? (
    <ButtonPrimary className=' cursor-pointer' onClick={handleAddToCart}>Add to Cart</ButtonPrimary>
  ) : (
    <button
      onClick={handleAddToCart}
      className="flex justify-around items-center py-2 text-lg text-white font-family-roboto font-medium bg-[#1B198F] cursor-pointer shadow-[4px_6px_0px_black]  border-black  relative overflow-hidden w-full  transition-[box-shadow_250ms,transform_250ms,filter_50ms] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_3px_0px_black]  before:content-[''] before:absolute before:inset-0 before:bg-[#2a75b3] before:z-[-1] before:-translate-x-full before:transition-transform before:duration-250 hover:before:translate-x-0"
    >
      Add to Cart
    </button>
  )
}