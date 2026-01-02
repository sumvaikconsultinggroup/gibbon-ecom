'use client'

import AddToCartButton from '@/components/AddToCardButton'
import React from 'react'
import { useProductContext } from './ProductContext'

const AddToCartPanel = ({ product, isVisible }) => {
  if (!product) {
    return null
  }

  const { selectedColor } = useProductContext()
  


  // Find variant matching the selected color - FIXED: use option1Value instead of option1
  const selectedVariant = product.variants?.find((v) => v.option1Value === selectedColor) || product.variants?.[0]

  

  // Transform IProduct to CartItem format
  const cartProduct = {
    productId: product._id?.toString() || product.handle,
    name: product.title,
    price: selectedVariant?.price || 0,
    imageUrl: product.images?.[0]?.src,
    handle: product.handle,
    variant: selectedVariant,
  }

  const panelStyle = {
    position: 'fixed',
    zIndex: 11,
    top: 'auto',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
    background: '#f5f5f5',
    bottom: 0,
    left: 0,
    height: 'auto',
    transition: 'transform 0.3s ease-in-out',
    // transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
  }

  return (
    <div style={panelStyle} className="border-t-[1.5px] border-blue-900">
      <div className="container flex items-center justify-center">
        <div className="w-full px-4 sm:w-[420px] sm:px-0">
          <AddToCartButton product={cartProduct} blackVariant={false} />
        </div>
      </div>
    </div>
  )
}

export default AddToCartPanel