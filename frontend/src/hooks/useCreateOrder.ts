import { useMutation } from '@tanstack/react-query'
import { createOrder } from '../services/orders.service'

/** Mutation for placing an order (POST /api/orders). */
export function useCreateOrder() {
  return useMutation({ mutationFn: createOrder })
}
