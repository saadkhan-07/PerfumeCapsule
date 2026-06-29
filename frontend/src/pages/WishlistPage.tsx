import { Link } from 'react-router-dom'
import { useWishlist, useWishlistMutations } from '../hooks/useWishlist'
import { ProductCard } from '../components/common/ProductCard'
import { ProductCardSkeleton } from '../components/common/ProductCardSkeleton'
import { EmptyState } from '../components/common/EmptyState'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Button } from '../components/ui/Button'

export function WishlistPage() {
  const { data: products, isLoading, isError } = useWishlist()
  const { remove } = useWishlistMutations()

  return (
    <PageWrapper>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Your wishlist</h1>

      {isError ? (
        <EmptyState title="Couldn’t load your wishlist" message="Please try again in a moment." />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : !products || products.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          message="Save products you love to find them here later."
          action={
            <Link to="/shop">
              <Button>Browse products</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col gap-2">
              <ProductCard product={product} />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => remove.mutate(product.id)}
                isLoading={remove.isPending && remove.variables === product.id}
              >
                Remove from wishlist
              </Button>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}
