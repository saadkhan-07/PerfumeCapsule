import { api } from './api'
import type { ApiResponse, Product } from '../types'

export interface ProductListParams {
  brandId?: string
  categoryId?: string
  search?: string
  page?: number
  limit?: number
}

export interface ProductListResult {
  items: Product[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

/** Strip empty/undefined values so we don't send blank query params. */
function cleanParams(params: ProductListParams): Record<string, string | number> {
  const out: Record<string, string | number> = {}
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '' && v !== null) out[k] = v
  }
  return out
}

export async function getProducts(params: ProductListParams): Promise<ProductListResult> {
  const { data } = await api.get<ApiResponse<ProductListResult>>('/products', {
    params: cleanParams(params),
  })
  return data.data
}

export async function getProduct(id: string): Promise<Product> {
  const { data } = await api.get<ApiResponse<Product>>(`/products/${id}`)
  return data.data
}

export interface ProductInput {
  name: string
  description?: string
  brandId: string
  categoryIds: string[]
  isActive?: boolean
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const { data } = await api.post<ApiResponse<Product>>('/products', input)
  return data.data
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product> {
  const { data } = await api.put<ApiResponse<Product>>(`/products/${id}`, input)
  return data.data
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`)
}
