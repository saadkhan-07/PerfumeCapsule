import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../../types'
import { priceRange, isInStock } from '../../utils/format'
import { useCartStore } from '../../store/cartStore'
import { Button } from '../ui/Button'

/**
 * Catalog card: first image, brand, name, price range, and a quick add-to-cart
 * that carts the cheapest in-stock variant (full size selection lives on the
 * product detail page).
 */
export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem)
  const [added, setAdded] = useState(false)

  const image = product.images?.[0]?.url
  const inStock = isInStock(product.variants)
  const firstAvailable = product.variants?.find((v) => v.stock > 0)

  const handleAdd = () => {
    if (!firstAvailable) return
    addItem(product, firstAvailable, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-shadow hover:shadow-md">
      <Link
        to={`/shop/${product.id}`}
        className="relative block aspect-square overflow-hidden bg-neutral-100"
      >
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-300">
            No image
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs uppercase tracking-wide text-neutral-400">{product.brand?.name}</p>
        <Link
          to={`/shop/${product.id}`}
          className="mt-1 line-clamp-2 text-sm font-medium text-neutral-900 hover:underline"
        >
          {product.name}
        </Link>
        <p className="mt-2 text-sm font-semibold text-neutral-900">
          {priceRange(product.variants)}
        </p>

        <div className="mt-3 flex-1" />

        <Button
          size="sm"
          fullWidth
          variant={inStock ? 'primary' : 'secondary'}
          disabled={!inStock}
          onClick={handleAdd}
        >
          {!inStock ? 'Out of stock' : added ? 'Added ✓' : 'Add to cart'}
        </Button>
      </div>
    </div>
  )
}
