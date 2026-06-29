import { useQuery } from '@tanstack/react-query'
import { getMyOrders } from '../services/orders.service'
import { useAuthStore } from '../store/authStore'

/** The current customer's order history. Only runs for authenticated customers. */
export function useMyOrders() {
  const enabled = useAuthStore((s) => s.isAuthenticated && s.user?.role === 'user')
  return useQuery({
    queryKey: ['my-orders'],
    queryFn: getMyOrders,
    enabled,
  })
}
