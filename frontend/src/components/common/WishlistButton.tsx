import type { MouseEvent } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useWishlist, useWishlistMutations } from '../../hooks/useWishlist'
import { HeartIcon } from '../ui/icons'

/**
 * Heart toggle overlaid on a product card image. Only renders for logged-in
 * customers. Stops click propagation so toggling never triggers card navigation.
 */
export function WishlistButton({ productId }: { productId: string }) {
  const isCustomer = useAuthStore((s) => s.isAuthenticated && s.user?.role === 'user')
  const { data: wishlist } = useWishlist()
  const { add, remove } = useWishlistMutations()

  if (!isCustomer) return null

  const isWishlisted = Boolean(wishlist?.some((p) => p.id === productId))

  const toggle = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isWishlisted) remove.mutate(productId)
    else add.mutate(productId)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={isWishlisted}
      className="group/heart absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/70 backdrop-blur transition hover:bg-white"
    >
      {isWishlisted ? (
        <HeartIcon filled className="h-5 w-5 text-neutral-900" />
      ) : (
        <span className="relative h-5 w-5">
          <HeartIcon className="absolute inset-0 h-5 w-5 text-neutral-400 transition-opacity group-hover/heart:opacity-0" />
          <HeartIcon filled className="absolute inset-0 h-5 w-5 text-neutral-900 opacity-0 transition-opacity group-hover/heart:opacity-100" />
        </span>
      )}
    </button>
  )
}
