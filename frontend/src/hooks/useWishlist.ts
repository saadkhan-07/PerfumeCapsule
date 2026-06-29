import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getWishlist, addToWishlist, removeFromWishlist } from '../services/wishlist.service'
import { useAuthStore } from '../store/authStore'

/** The current customer's wishlist. Only runs for authenticated customers. */
export function useWishlist() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isCustomer = useAuthStore((s) => s.user?.role === 'user')
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: getWishlist,
    enabled: isAuthenticated && isCustomer,
  })
}

/** Add/remove mutations that keep the wishlist query in sync. */
export function useWishlistMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['wishlist'] })

  const add = useMutation({ mutationFn: addToWishlist, onSuccess: invalidate })
  const remove = useMutation({ mutationFn: removeFromWishlist, onSuccess: invalidate })

  return { add, remove }
}
