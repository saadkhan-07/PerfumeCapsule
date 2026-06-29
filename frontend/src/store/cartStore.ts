import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product, ProductVariant } from '../types'

/**
 * Client-side cart, persisted in localStorage. A line is keyed by variant id
 * (a product+size pair is one line). Quantities are clamped to the variant's
 * available stock so a customer can never cart more than exists.
 */
interface CartState {
  items: CartItem[]
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
}

const clamp = (qty: number, stock: number) => Math.max(1, Math.min(qty, Math.max(stock, 1)))

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (product, variant, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.variant.id === variant.id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variant.id === variant.id
                  ? { ...i, quantity: clamp(i.quantity + quantity, variant.stock) }
                  : i,
              ),
            }
          }
          return {
            items: [...state.items, { product, variant, quantity: clamp(quantity, variant.stock) }],
          }
        }),

      removeItem: (variantId) =>
        set((state) => ({ items: state.items.filter((i) => i.variant.id !== variantId) })),

      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.variant.id === variantId ? { ...i, quantity: clamp(quantity, i.variant.stock) } : i,
          ),
        })),

      clearCart: () => set({ items: [] }),
    }),
    { name: 'pc-cart' },
  ),
)

/** Total number of units across all cart lines (for the navbar badge). */
export const selectCartCount = (state: CartState): number =>
  state.items.reduce((sum, i) => sum + i.quantity, 0)

/** Cart subtotal in rupees (numeric). */
export const selectCartSubtotal = (state: CartState): number =>
  state.items.reduce((sum, i) => sum + Number(i.variant.price) * i.quantity, 0)
