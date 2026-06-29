import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useProduct } from '../hooks/useCatalog'
import { useWishlist, useWishlistMutations } from '../hooks/useWishlist'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'
import type { ProductVariant } from '../types'
import { formatPKR } from '../utils/format'
import { cn } from '../utils/cn'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import { QuantityStepper } from '../components/common/QuantityStepper'
import { EmptyState } from '../components/common/EmptyState'

export function ProductDetailPage() {
  const { productId } = useParams()
  const { data: product, isLoading, isError } = useProduct(productId)

  const addItem = useCartStore((s) => s.addItem)
  const isCustomer = useAuthStore((s) => s.isAuthenticated && s.user?.role === 'user')

  const { data: wishlist } = useWishlist()
  const { add: addWish, remove: removeWish } = useWishlistMutations()

  const [activeImage, setActiveImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  // Default the selected variant to the first in-stock one (or the first).
  const variant = useMemo(() => {
    if (selectedVariant) return selectedVariant
    return product?.variants?.find((v) => v.stock > 0) ?? product?.variants?.[0] ?? null
  }, [selectedVariant, product])

  if (isLoading) return <DetailSkeleton />
  if (isError || !product) {
    return (
      <PageWrapper>
        <EmptyState
          title="Product not found"
          message="This product may have been removed."
          action={
            <Link to="/shop" className="text-sm font-medium text-neutral-900 underline">
              Back to shop
            </Link>
          }
        />
      </PageWrapper>
    )
  }

  const images = product.images ?? []
  const mainImage = images[activeImage]?.url
  const isWishlisted = Boolean(wishlist?.some((p) => p.id === product.id))
  const outOfStock = !variant || variant.stock === 0

  const handleAddToCart = () => {
    if (!variant || outOfStock) return
    addItem(product, variant, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 1400)
  }

  const toggleWishlist = () => {
    if (isWishlisted) removeWish.mutate(product.id)
    else addWish.mutate(product.id)
  }

  return (
    <PageWrapper>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="aspect-square overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
            {mainImage ? (
              <img src={mainImage} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-neutral-300">
                No image
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    'h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2',
                    i === activeImage ? 'border-neutral-900' : 'border-transparent',
                  )}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <Link
            to={`/shop?brand=${product.brandId}`}
            className="text-xs font-medium uppercase tracking-wide text-neutral-400 hover:text-neutral-900"
          >
            {product.brand?.name}
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{product.name}</h1>

          <p className="mt-3 text-2xl font-semibold text-neutral-900">
            {variant ? formatPKR(variant.price) : '—'}
          </p>
          <p className="mt-1 text-sm">
            {!variant ? null : variant.stock === 0 ? (
              <span className="text-red-600">Out of stock</span>
            ) : variant.stock <= 5 ? (
              <span className="text-amber-600">Only {variant.stock} left</span>
            ) : (
              <span className="text-green-600">In stock</span>
            )}
          </p>

          {/* Variant (size) selector — generated from variants */}
          <div className="mt-6">
            <p className="mb-2 text-sm font-medium text-neutral-700">Size</p>
            <div className="flex flex-wrap gap-2">
              {product.variants?.map((v) => {
                const isSelected = variant?.id === v.id
                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={v.stock === 0}
                    onClick={() => {
                      setSelectedVariant(v)
                      setQuantity(1)
                    }}
                    className={cn(
                      'min-w-14 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                      isSelected
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-300 text-neutral-900 hover:border-neutral-900',
                      v.stock === 0 && 'cursor-not-allowed text-neutral-300 line-through hover:border-neutral-300',
                    )}
                  >
                    {v.size}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Quantity + add to cart */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <QuantityStepper
              value={quantity}
              onChange={setQuantity}
              max={variant?.stock ?? 1}
            />
            <Button onClick={handleAddToCart} disabled={outOfStock} className="flex-1 sm:flex-none">
              {outOfStock ? 'Out of stock' : added ? 'Added to cart ✓' : 'Add to cart'}
            </Button>
            {isCustomer && (
              <Button
                variant="outline"
                onClick={toggleWishlist}
                isLoading={addWish.isPending || removeWish.isPending}
                aria-pressed={isWishlisted}
              >
                {isWishlisted ? '♥ Wishlisted' : '♡ Wishlist'}
              </Button>
            )}
          </div>

          {product.description && (
            <div className="mt-8 border-t border-neutral-200 pt-6">
              <h2 className="text-sm font-medium text-neutral-700">Description</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-neutral-600">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}

function DetailSkeleton() {
  return (
    <PageWrapper>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-7 w-1/3" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      </div>
    </PageWrapper>
  )
}
