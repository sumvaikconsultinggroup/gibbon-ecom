import { toast } from 'react-hot-toast'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

// Live tracking helper
const trackEvent = async (type: string, data: any) => {
  try {
    const sessionData = typeof window !== 'undefined' ? sessionStorage.getItem('_sid_data') : null
    const visitorId = typeof window !== 'undefined' ? localStorage.getItem('_vid') : null
    
    if (sessionData) {
      const { sessionId } = JSON.parse(sessionData)
      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          visitorId,
          type,
          data: {
            ...data,
            timestamp: new Date().toISOString(),
          },
        }),
        keepalive: true,
      })
    }
  } catch (e) {
    // Silently fail tracking
  }
}

export interface PromoCode {
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minOrderAmount?: number
  appliesTo?: 'all' | 'products' | 'categories'
}

export interface ProductVariant {
  name: string
  option: string
}

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  imageUrl?: string
  variants?: ProductVariant[]
  variant?: {
    id: string
    name: string
    option1Value?: string
    option2Value?: string
    option3Value?: string
  }
  quantity: number
  comapreAtPrice?: number
  handle: string
  category?: string
}

export interface OrderDetails {
  orderId: string;
  name: string;
  phone: string;
  address: string;
  email: string;
  cartItems: CartItem[];
  price: number;
  discount: number;
  paymentMethod: string;
}


interface CartStore {
  items: CartItem[]
  totalItems: number
  appliedPromoCode: PromoCode | null
  applicableProductIds: string[]
  orderDetails: OrderDetails | null
  userInfo: { 
    name: string; 
    lastName: string;
    phone: string; 
    address: string; 
    address1: string;
    email: string;
    city: string;
    state: string;
    country: string;
    zipcode: string;
  } | null;
  orderSummary: { subtotal: number; discount: number; shipping: number; taxes: number; total: number } | null;
  orderSuccess: boolean;
  paymentMethod: string | null;
  addItem: (data: Omit<CartItem, 'quantity' | 'id'>) => void
  addMultipleToCart: (data: Omit<CartItem, 'quantity' | 'id'>[]) => void
  removeItem: (id: string) => void
  updateItemQuantity: (id: string, quantity: number) => void
  removeAll: () => void
  applyPromoCode: (promoCode: PromoCode, applicableProductIds: string[]) => void
  removePromoCode: () => void
  validatePromoCode: () => void
  setOrderDetails: (details: OrderDetails) => void
  setUserInfo: (info: { 
    name: string; 
    lastName: string;
    phone: string; 
    address: string; 
    address1: string;
    email: string;
    city: string;
    state: string;
    country: string;
    zipcode: string;
  }) => void;
  setOrderSummary: (summary: { subtotal: number; discount: number; shipping: number; taxes: number; total: number }) => void;
  setOrderSuccess: (status: boolean) => void;
  setPaymentMethod: (method: string) => void;
}

const generateCartItemId = (productId: string, variants?: ProductVariant[]): string => {
  if (!variants || variants.length === 0) {
    return productId
  }
  const variantString = variants
    .map((v) => `${v.name}:${v.option}`)
    .sort()
    .join('-')
  return `${productId}-${variantString}`
}

export const useCart = create(
  persist<CartStore>(
    (set, get) => ({
      items: [],
      totalItems: 0,
      appliedPromoCode: null,
      applicableProductIds: [],
      orderDetails: null,
      userInfo: null,
      orderSummary: null,
      orderSuccess: false,
      paymentMethod: null,
      addItem: (data) => {
        console.log('data from data', data)

        const { productId, variants } = data
        const cartItemId = generateCartItemId(productId, variants)
        const currentItems = get().items
        const existingItem = currentItems.find((item) => item.id === cartItemId)

        if (existingItem) {
          // If item already exists, just increment its quantity
          toast.success('Item quantity updated.')
          set({
            items: currentItems.map((item) =>
              item.id === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
            ),
            totalItems: get().totalItems + 1,
          })
        } else {
          // If item does not exist, add it to cart
          const newItem: CartItem = {
            ...data,
            id: cartItemId,
            quantity: 1,
          }

          toast.success('Item added to cart.')
          set({ items: [...currentItems, newItem], totalItems: get().totalItems + 1 })
        }
        get().validatePromoCode()

        // Sync cart with server
        fetch('/api/cart/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: get().items }),
        }).catch((err) => console.error('Failed to sync cart:', err))
      },
      addMultipleToCart: (itemsToAdd) => {
        const currentItems = get().items
        let newTotalItems = get().totalItems
        const updatedItems = [...currentItems]

        itemsToAdd.forEach((itemData) => {
          const { productId, variants } = itemData
          const cartItemId = generateCartItemId(productId, variants)
          const existingItemIndex = updatedItems.findIndex((item) => item.id === cartItemId)

          if (existingItemIndex > -1) {
            const existingItem = updatedItems[existingItemIndex]
            updatedItems[existingItemIndex] = { ...existingItem, quantity: existingItem.quantity + 1 }
            newTotalItems++
          } else {
            const newItem: CartItem = {
              ...itemData,
              id: cartItemId,
              quantity: 1,
            }
            updatedItems.push(newItem)
            newTotalItems++
          }
        })

        toast.success(`${itemsToAdd.length} items added to cart.`)
        set({ items: updatedItems, totalItems: newTotalItems })
        get().validatePromoCode()
        fetch('/api/cart/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: get().items }),
        }).catch((err) => console.error('Failed to sync cart:', err))
      },
      removeItem: (id) => {
        const item = get().items.find((i) => i.id === id)
        if (!item) return

        fetch('/api/cart/sync/edit', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'remove', item }),
        }).catch(() => {})

        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
          totalItems: Math.max(0, state.totalItems - item.quantity),
        }))

        toast.success('Item removed.')
      },
      updateItemQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }

        const item = get().items.find((i) => i.id === id)
        if (!item) return

        fetch('/api/cart/sync/edit', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'updateQty', item: { ...item, quantity } }),
        }).catch(() => {})

        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
          totalItems: Math.max(0, state.totalItems + (quantity - item.quantity)),
        }))
      },
      removeAll: () => set({ items: [], totalItems: 0, userInfo: null, orderSummary: null, orderSuccess: false, paymentMethod: null }),
      applyPromoCode: (promoCode: PromoCode, applicableProductIds: string[]) => {
        set({ appliedPromoCode: promoCode, applicableProductIds })
        toast.success('Promo code applied!')
      },
      removePromoCode: () => {
        set({ appliedPromoCode: null, applicableProductIds: [] })
      },
      validatePromoCode: () => {
        const { items, appliedPromoCode, applicableProductIds, removePromoCode } = get()
        if (!appliedPromoCode) return

        // 1. Check if the cart still meets the minimum order amount
        const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
        if (appliedPromoCode.minOrderAmount && subtotal < appliedPromoCode.minOrderAmount) {
          removePromoCode()
          toast.error(`Promo code removed. Order total is below the minimum of ₹${appliedPromoCode.minOrderAmount}.`)
          return
        }

        // 2. Check if any applicable products are still in the cart
        if (appliedPromoCode.appliesTo === 'products' && applicableProductIds.length > 0) {
          const hasApplicableItem = items.some((item) => applicableProductIds.includes(item.id))
          if (!hasApplicableItem) {
            removePromoCode()
            toast.error('Promo code removed as applicable products are no longer in the cart.')
          }
        }
      },
      setOrderDetails: (details: OrderDetails) => {
        set({ orderDetails: details });
      },
      setUserInfo: (info) => {
        console.log('Debugging userInfo update:', info);
        set({ userInfo: info });
      },
      setOrderSummary: (summary) => set({ orderSummary: summary }),
      setOrderSuccess: (status) => set({ orderSuccess: status }),
      setPaymentMethod: (method) => set({ paymentMethod: method }),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
