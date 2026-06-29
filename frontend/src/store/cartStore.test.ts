import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore, selectCartCount, selectCartSubtotal } from './cartStore'
import type { Product, ProductVariant } from '../types'

const variant = (id: string, price: string, stock: number): ProductVariant => ({
  id, productId: 'p1', size: '5ml', price, stock, sku: null, createdAt: '', updatedAt: '',
})
const product = (id: string): Product => ({
  id, name: 'Test', slug: 'test', description: null, isActive: true, brandId: 'b1',
  createdAt: '', updatedAt: '',
})

beforeEach(() => {
  useCartStore.setState({ items: [] })
  localStorage.clear()
})

describe('cartStore', () => {
  it('adds an item and reports count + subtotal', () => {
    useCartStore.getState().addItem(product('p1'), variant('v1', '1500', 10), 2)
    expect(useCartStore.getState().items).toHaveLength(1)
    expect(selectCartCount(useCartStore.getState())).toBe(2)
    expect(selectCartSubtotal(useCartStore.getState())).toBe(3000)
  })

  it('merges quantity when the same variant is added again', () => {
    const p = product('p1')
    const v = variant('v1', '1000', 10)
    useCartStore.getState().addItem(p, v, 1)
    useCartStore.getState().addItem(p, v, 2)
    expect(useCartStore.getState().items).toHaveLength(1)
    expect(selectCartCount(useCartStore.getState())).toBe(3)
  })

  it('clamps quantity to available stock', () => {
    useCartStore.getState().addItem(product('p1'), variant('v1', '1000', 3), 10)
    expect(useCartStore.getState().items[0].quantity).toBe(3)
    useCartStore.getState().updateQuantity('v1', 99)
    expect(useCartStore.getState().items[0].quantity).toBe(3)
  })

  it('removes an item and clears the cart', () => {
    useCartStore.getState().addItem(product('p1'), variant('v1', '1000', 5), 1)
    useCartStore.getState().removeItem('v1')
    expect(useCartStore.getState().items).toHaveLength(0)
    useCartStore.getState().addItem(product('p2'), variant('v2', '1000', 5), 1)
    useCartStore.getState().clearCart()
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('persists the cart to localStorage (survives a refresh)', () => {
    useCartStore.getState().addItem(product('p1'), variant('v1', '1500', 5), 1)
    const persisted = JSON.parse(localStorage.getItem('pc-cart') ?? '{}')
    expect(persisted.state.items).toHaveLength(1)
    expect(persisted.state.items[0].variant.id).toBe('v1')
  })
})
