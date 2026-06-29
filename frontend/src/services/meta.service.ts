import { api } from './api'
import type { ApiResponse, Brand, Category } from '../types'

export async function getBrands(): Promise<Brand[]> {
  const { data } = await api.get<ApiResponse<Brand[]>>('/brands')
  return data.data
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get<ApiResponse<Category[]>>('/categories')
  return data.data
}
