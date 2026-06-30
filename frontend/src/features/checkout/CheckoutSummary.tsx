import type { CartItem } from '../../types'
import { formatPKR } from '../../utils/format'

interface CheckoutSummaryProps {
  items: CartItem[]
  subtotal: number
  /** Resolved shipping fee, or null until a city is selected. */
  shippingFee: number | null
  /** subtotal + shippingFee (equals subtotal when shippingFee is null). */
  total: number
}

/**
 * Order summary content for checkout: each line item (thumbnail with quantity
 * badge, name + size, line price), then Subtotal, Shipping, and Total. Shipping
 * is driven by the selected city (see calculateShippingFee) and mirrors the
 * backend, so the displayed total matches the saved order.
 */
export function CheckoutSummary({ items, subtotal, shippingFee, total }: CheckoutSummaryProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <ul className="space-y-4">
        {items.map(({ product, variant, quantity }) => {
          const image = product.images?.[0]?.url
          const lineTotal = Number(variant.price) * quantity
          return (
            <li key={variant.id} className="flex items-center gap-3">
              {/* relative wrapper (no clipping) so the badge can sit outside the image box */}
              <div className="relative flex-shrink-0">
                <div className="h-14 w-14 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
                  {image ? (
                    <img src={image} alt={product.name} className="h-full w-full object-contain p-1" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-neutral-300">
                      No image
                    </div>
                  )}
                </div>
                {quantity > 1 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-900 px-1 text-xs font-medium text-white">
                    {quantity}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-neutral-900">{product.name}</p>
                <p className="text-xs text-neutral-500">{variant.size}</p>
              </div>

              <p className="whitespace-nowrap text-sm font-medium text-neutral-900">
                {formatPKR(lineTotal)}
              </p>
            </li>
          )
        })}
      </ul>

      <div className="mt-5 space-y-2 border-t border-neutral-100 pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-500">Subtotal</span>
          <span className="font-medium text-neutral-900">{formatPKR(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-500">Shipping</span>
          {shippingFee === null ? (
            <span className="text-neutral-400">Select a city</span>
          ) : shippingFee === 0 ? (
            <span className="font-medium text-neutral-900">Free</span>
          ) : (
            <span className="font-medium text-neutral-900">{formatPKR(shippingFee)}</span>
          )}
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-base font-semibold text-neutral-900">Total</span>
          <span className="text-lg font-semibold text-neutral-900">{formatPKR(total)}</span>
        </div>
      </div>
    </div>
  )
}
