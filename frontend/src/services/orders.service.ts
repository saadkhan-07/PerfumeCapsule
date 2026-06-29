import { api } from './api'
import type { ApiResponse, Order, OrderStatus, PaymentMethod } from '../types'

export interface CreateOrderPayload {
  items: { variantId: string; quantity: number }[]
  shippingInfo: { name: string; phone: string; address: string; city: string }
  paymentMethod: PaymentMethod
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const { data } = await api.post<ApiResponse<Order>>('/orders', payload)
  return data.data
}

/** The current customer's own orders, newest first. */
export async function getMyOrders(): Promise<Order[]> {
  const { data } = await api.get<ApiResponse<Order[]>>('/orders/mine')
  return data.data
}

/** Admin: every order, newest first. */
export async function getAllOrders(): Promise<Order[]> {
  const { data } = await api.get<ApiResponse<Order[]>>('/orders')
  return data.data
}

/** Admin or owner: a single order by id. */
export async function getOrder(id: string): Promise<Order> {
  const { data } = await api.get<ApiResponse<Order>>(`/orders/${id}`)
  return data.data
}

/** Admin: update an order's status. */
export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const { data } = await api.put<ApiResponse<Order>>(`/orders/${id}/status`, { status })
  return data.data
}
