'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface ProductContextType {
  selectedColor: string
  setSelectedColor: (color: string) => void
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export function ProductProvider({ children, defaultColor }: { children: ReactNode; defaultColor: string }) {
  const [selectedColor, setSelectedColor] = useState(defaultColor)

  return (
    <ProductContext.Provider value={{ selectedColor, setSelectedColor }}>
      {children}
    </ProductContext.Provider>
  )
}

export function useProductContext() {
  const context = useContext(ProductContext)
  if (!context) {
    throw new Error('useProductContext must be used within a ProductProvider')
  }
  return context
}