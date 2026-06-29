import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getProducts, getProduct, type ProductListParams } from '../services/products.service'
import { getBrands, getCategories } from '../services/meta.service'

/** Paginated catalog listing. Keeps previous page visible while the next loads. */
export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => getProducts(params),
    placeholderData: keepPreviousData,
  })
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id as string),
    enabled: Boolean(id),
  })
}

export function useBrands() {
  return useQuery({ queryKey: ['brands'], queryFn: getBrands, staleTime: 1000 * 60 * 30 })
}

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: getCategories, staleTime: 1000 * 60 * 30 })
}
