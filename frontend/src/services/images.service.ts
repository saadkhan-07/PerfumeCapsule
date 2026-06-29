import { api } from './api'
import type { ApiResponse, ProductImage } from '../types'

/** Upload one or more images for a product (Cloudinary, backend-only). */
export async function addProductImages(productId: string, files: File[]): Promise<ProductImage[]> {
  const fd = new FormData()
  for (const file of files) fd.append('images', file)
  const { data } = await api.post<ApiResponse<ProductImage[]>>(`/products/${productId}/images`, fd)
  return data.data
}

export async function deleteProductImage(productId: string, imageId: string): Promise<void> {
  await api.delete(`/products/${productId}/images/${imageId}`)
}
