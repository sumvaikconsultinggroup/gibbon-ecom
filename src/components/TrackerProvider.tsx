'use client'

import { createContext, useContext, useCallback, useRef, useEffect, ReactNode } from 'react'

interface TrackerContextType {
  trackAddToCart: (productId: string, productName: string, price: number, quantity?: number) => void
  trackRemoveFromCart: (productId: string, productName: string, price: number, quantity?: number) => void
  trackCheckoutStart: (cartItems: number, cartValue: number) => void
  trackPurchase: (orderId: string, orderTotal: number, items: any[]) => void
  trackProductView: (productId: string, productName: string, price: number) => void
  trackSearch: (query: string, resultsCount: number) => void
}

const TrackerContext = createContext<TrackerContextType | null>(null)

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  const stored = sessionStorage.getItem('_sid_data')
  if (stored) {
    try {
      return JSON.parse(stored).sessionId
    } catch (e) {}
  }
  return ''
}

function getVisitorId(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('_vid') || ''
}

export function TrackerProvider({ children }: { children: ReactNode }) {
  const queueRef = useRef<any[]>([])
  const processingRef = useRef(false)
  
  // Process event queue
  const processQueue = useCallback(async () => {
    if (processingRef.current || queueRef.current.length === 0) return
    processingRef.current = true
    
    while (queueRef.current.length > 0) {
      const event = queueRef.current.shift()
      try {
        await fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event),
          keepalive: true,
        })
      } catch (e) {
        console.error('Track error:', e)
      }
    }
    
    processingRef.current = false
  }, [])
  
  // Queue an event
  const queueEvent = useCallback((type: string, data: any) => {
    queueRef.current.push({
      sessionId: getSessionId(),
      visitorId: getVisitorId(),
      type,
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      },
    })
    processQueue()
  }, [processQueue])
  
  const trackAddToCart = useCallback((productId: string, productName: string, price: number, quantity = 1) => {
    queueEvent('add_to_cart', {
      productId,
      productName,
      productPrice: price,
      quantity,
      page: typeof window !== 'undefined' ? window.location.pathname : '',
    })
  }, [queueEvent])
  
  const trackRemoveFromCart = useCallback((productId: string, productName: string, price: number, quantity = 1) => {
    queueEvent('remove_from_cart', {
      productId,
      productName,
      productPrice: price,
      quantity,
    })
  }, [queueEvent])
  
  const trackCheckoutStart = useCallback((cartItems: number, cartValue: number) => {
    queueEvent('checkout_start', { cartItems, cartValue })
  }, [queueEvent])
  
  const trackPurchase = useCallback((orderId: string, orderTotal: number, items: any[]) => {
    queueEvent('purchase', { orderId, orderTotal, items })
  }, [queueEvent])
  
  const trackProductView = useCallback((productId: string, productName: string, price: number) => {
    queueEvent('product_view', {
      productId,
      productName,
      productPrice: price,
      page: typeof window !== 'undefined' ? window.location.pathname : '',
    })
  }, [queueEvent])
  
  const trackSearch = useCallback((query: string, resultsCount: number) => {
    queueEvent('search', { searchQuery: query, searchResults: resultsCount })
  }, [queueEvent])
  
  return (
    <TrackerContext.Provider value={{
      trackAddToCart,
      trackRemoveFromCart,
      trackCheckoutStart,
      trackPurchase,
      trackProductView,
      trackSearch,
    }}>
      {children}
    </TrackerContext.Provider>
  )
}

export function useTrackerContext() {
  const context = useContext(TrackerContext)
  if (!context) {
    // Return no-op functions if not in provider
    return {
      trackAddToCart: () => {},
      trackRemoveFromCart: () => {},
      trackCheckoutStart: () => {},
      trackPurchase: () => {},
      trackProductView: () => {},
      trackSearch: () => {},
    }
  }
  return context
}
