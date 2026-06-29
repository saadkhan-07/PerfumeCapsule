import { Link } from 'react-router-dom'
import type { Product } from '../../types'
import { priceRange, isInStock } from '../../utils/format'
import { cn } from '../../utils/cn'
import { ImageIcon } from '../ui/icons'
import { WishlistButton } from './WishlistButton'

/**
 * Borderless, typography-led catalog card. The whole card is a link to the
 * product detail page; the product photo is the hero (object-contain, 3:4).
 */
export function ProductCard({ product }: { product: Product }) {
  const image = product.images?.[0]?.url
  const inStock = isInStock(product.variants)

  return (
    <Link to={`/shop/${product.id}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-white">
        <WishlistButton productId={product.id} />
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain transition-transform duration-[400ms] ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-200">
            <ImageIcon className="h-14 w-14" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <p className="text-xs uppercase tracking-wider text-neutral-400">{product.brand?.name}</p>
        <p className="mt-1 truncate text-sm font-medium text-neutral-900">{product.name}</p>
        <p className={cn('mt-1 text-sm', inStock ? 'text-neutral-900' : 'text-neutral-400')}>
          {priceRange(product.variants)}
        </p>
        {!inStock && <p className="mt-0.5 text-xs text-red-600">Out of stock</p>}
      </div>
    </Link>
  )
}
