import { api } from './api'
import type { ApiResponse, Product } from '../types'

export async function getWishlist(): Promise<Product[]> {
  const { data } = await api.get<ApiResponse<Product[]>>('/wishlist')
  return data.data
}

export async function addToWishlist(productId: string): Promise<Product> {
  const { data } = await api.post<ApiResponse<Product>>('/wishlist', { productId })
  return data.data
}

export async function removeFromWishlist(productId: string): Promise<void> {
  await api.delete(`/wishlist/${productId}`)
}
