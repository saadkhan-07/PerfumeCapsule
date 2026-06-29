import type { ProductVariant } from '../types'

/** Format a money value (number or Decimal-string) as `Rs. 1,500`. */
export function formatPKR(value: number | string): string {
  const n = typeof value === 'string' ? Number(value) : value
  return `Rs. ${Number.isFinite(n) ? n.toLocaleString('en-PK') : '0'}`
}

/** Lowest variant price, e.g. for "from Rs. 1,500" on cards. */
export function minVariantPrice(variants: ProductVariant[] | undefined): number | null {
  if (!variants || variants.length === 0) return null
  return Math.min(...variants.map((v) => Number(v.price)))
}

/** A price range string for a product's variants: single price or `min – max`. */
export function priceRange(variants: ProductVariant[] | undefined): string {
  if (!variants || variants.length === 0) return '—'
  const prices = variants.map((v) => Number(v.price))
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return min === max ? formatPKR(min) : `${formatPKR(min)} – ${formatPKR(max)}`
}

/** True if any variant has stock. */
export function isInStock(variants: ProductVariant[] | undefined): boolean {
  return Boolean(variants?.some((v) => v.stock > 0))
}
