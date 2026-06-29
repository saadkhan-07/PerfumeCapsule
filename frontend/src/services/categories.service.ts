import { api } from './api'
import type { ApiResponse, Category } from '../types'

export async function createCategory(name: string): Promise<Category> {
  const { data } = await api.post<ApiResponse<Category>>('/categories', { name })
  return data.data
}

export async function updateCategory(id: string, name: string): Promise<Category> {
  const { data } = await api.put<ApiResponse<Category>>(`/categories/${id}`, { name })
  return data.data
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`)
}
