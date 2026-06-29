import { api } from './api'
import type { ApiResponse, ProductVariant } from '../types'

export interface VariantInput {
  size: string
  price: number
  stock?: number
  sku?: string
}

export async function createVariant(productId: string, input: VariantInput): Promise<ProductVariant> {
  const { data } = await api.post<ApiResponse<ProductVariant>>(`/products/${productId}/variants`, input)
  return data.data
}

export async function updateVariant(
  productId: string,
  variantId: string,
  input: Partial<VariantInput>,
): Promise<ProductVariant> {
  const { data } = await api.put<ApiResponse<ProductVariant>>(
    `/products/${productId}/variants/${variantId}`,
    input,
  )
  return data.data
}

export async function deleteVariant(productId: string, variantId: string): Promise<void> {
  await api.delete(`/products/${productId}/variants/${variantId}`)
}
