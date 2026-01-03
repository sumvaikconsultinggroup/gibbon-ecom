'use client'

import { useEffect, useRef, useCallback } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

// Generate unique session ID
function generateSessionId(): string {
  return 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Generate persistent visitor ID
function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return ''
  
  let visitorId = localStorage.getItem('_vid')
  if (!visitorId) {
    visitorId = 'vis_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
    localStorage.setItem('_vid', visitorId)
  }
  return visitorId
}

// Get or create session ID (expires after 30 min of inactivity)
function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return ''
  
  const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes
  const stored = sessionStorage.getItem('_sid_data')
  
  if (stored) {
    try {
      const data = JSON.parse(stored)
      if (Date.now() - data.lastActive < SESSION_TIMEOUT) {
        // Update last active
        data.lastActive = Date.now()
        sessionStorage.setItem('_sid_data', JSON.stringify(data))
        return data.sessionId
      }
    } catch (e) {
      // Invalid data, create new session
    }
  }
  
  // Create new session
  const sessionId = generateSessionId()
  sessionStorage.setItem('_sid_data', JSON.stringify({
    sessionId,
    lastActive: Date.now(),
  }))
  return sessionId
}

interface TrackEvent {
  type: string
  data?: Record<string, any>
}

export function useTracker() {
  const sessionIdRef = useRef<string>('')
  const visitorIdRef = useRef<string>('')
  const lastPageRef = useRef<string>('')
  
  // Initialize IDs
  useEffect(() => {
    sessionIdRef.current = getOrCreateSessionId()
    visitorIdRef.current = getOrCreateVisitorId()
  }, [])
  
  // Track event function
  const track = useCallback(async (event: TrackEvent) => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = getOrCreateSessionId()
      visitorIdRef.current = getOrCreateVisitorId()
    }
    
    try {
      const response = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          visitorId: visitorIdRef.current,
          type: event.type,
          data: {
            ...event.data,
            timestamp: new Date().toISOString(),
          },
        }),
        // Use keepalive for events that might fire on page unload
        keepalive: true,
      })
      
      // Update session last active
      const stored = sessionStorage.getItem('_sid_data')
      if (stored) {
        const data = JSON.parse(stored)
        data.lastActive = Date.now()
        sessionStorage.setItem('_sid_data', JSON.stringify(data))
      }
      
      return response.ok
    } catch (error) {
      console.error('Track error:', error)
      return false
    }
  }, [])
  
  // Track page view
  const trackPageView = useCallback((page: string, title?: string) => {
    if (page === lastPageRef.current) return
    lastPageRef.current = page
    
    track({
      type: 'page_view',
      data: {
        page,
        title: title || document.title,
        referrer: document.referrer,
      },
    })
  }, [track])
  
  // Track product view
  const trackProductView = useCallback((productId: string, productName: string, price: number) => {
    track({
      type: 'product_view',
      data: {
        productId,
        productName,
        productPrice: price,
        page: window.location.pathname,
      },
    })
  }, [track])
  
  // Track add to cart
  const trackAddToCart = useCallback((productId: string, productName: string, price: number, quantity: number = 1) => {
    track({
      type: 'add_to_cart',
      data: {
        productId,
        productName,
        productPrice: price,
        quantity,
        page: window.location.pathname,
      },
    })
  }, [track])
  
  // Track remove from cart
  const trackRemoveFromCart = useCallback((productId: string, productName: string, price: number, quantity: number = 1) => {
    track({
      type: 'remove_from_cart',
      data: {
        productId,
        productName,
        productPrice: price,
        quantity,
      },
    })
  }, [track])
  
  // Track checkout start
  const trackCheckoutStart = useCallback((cartItems: number, cartValue: number) => {
    track({
      type: 'checkout_start',
      data: {
        cartItems,
        cartValue,
      },
    })
  }, [track])
  
  // Track purchase
  const trackPurchase = useCallback((orderId: string, orderTotal: number, items: any[]) => {
    track({
      type: 'purchase',
      data: {
        orderId,
        orderTotal,
        items,
      },
    })
  }, [track])
  
  // Track search
  const trackSearch = useCallback((query: string, resultsCount: number) => {
    track({
      type: 'search',
      data: {
        searchQuery: query,
        searchResults: resultsCount,
      },
    })
  }, [track])
  
  return {
    track,
    trackPageView,
    trackProductView,
    trackAddToCart,
    trackRemoveFromCart,
    trackCheckoutStart,
    trackPurchase,
    trackSearch,
    sessionId: sessionIdRef.current,
    visitorId: visitorIdRef.current,
  }
}

// Auto-tracking component to be added to layout
export default function LiveTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { trackPageView, track } = useTracker()
  const initRef = useRef(false)
  
  // Track page views on route change
  useEffect(() => {
    const page = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
    trackPageView(page)
  }, [pathname, searchParams, trackPageView])
  
  // Initialize session and track session start
  useEffect(() => {
    if (initRef.current) return
    initRef.current = true
    
    // Get UTM params
    const params = new URLSearchParams(window.location.search)
    
    track({
      type: 'session_start',
      data: {
        page: window.location.pathname,
        referrer: document.referrer,
        utmSource: params.get('utm_source'),
        utmMedium: params.get('utm_medium'),
        utmCampaign: params.get('utm_campaign'),
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
      },
    })
    
    // Track cart abandonment on page unload
    const handleUnload = () => {
      const cartData = localStorage.getItem('cart')
      if (cartData) {
        try {
          const cart = JSON.parse(cartData)
          if (cart && cart.length > 0) {
            track({
              type: 'cart_abandon',
              data: {
                cartItems: cart.length,
                cartValue: cart.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
              },
            })
          }
        } catch (e) {}
      }
    }
    
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [track])
  
  return null
}
