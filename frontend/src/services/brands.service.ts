import { api } from './api'
import type { ApiResponse, Brand } from '../types'

export interface BrandInput {
  name: string
  description?: string
  logo?: File | null
}

function toFormData(input: BrandInput): FormData {
  const fd = new FormData()
  fd.append('name', input.name)
  if (input.description !== undefined) fd.append('description', input.description)
  if (input.logo) fd.append('logo', input.logo)
  return fd
}

export async function createBrand(input: BrandInput): Promise<Brand> {
  const { data } = await api.post<ApiResponse<Brand>>('/brands', toFormData(input))
  return data.data
}

export async function updateBrand(id: string, input: BrandInput): Promise<Brand> {
  const { data } = await api.put<ApiResponse<Brand>>(`/brands/${id}`, toFormData(input))
  return data.data
}

export async function deleteBrand(id: string): Promise<void> {
  await api.delete(`/brands/${id}`)
}
