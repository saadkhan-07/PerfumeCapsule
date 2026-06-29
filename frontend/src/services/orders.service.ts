import { api } from './api'
import type { ApiResponse, Order, PaymentMethod } from '../types'

export interface CreateOrderPayload {
  items: { variantId: string; quantity: number }[]
  shippingInfo: { name: string; phone: string; address: string; city: string }
  paymentMethod: PaymentMethod
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const { data } = await api.post<ApiResponse<Order>>('/orders', payload)
  return data.data
}
