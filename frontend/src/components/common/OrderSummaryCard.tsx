import type { Order } from '../../types'
import { formatPKR } from '../../utils/format'
import { OrderStatusBadge } from './OrderStatusBadge'

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })

/**
 * Read-only summary of a single order: header (id, date, status), line items,
 * money breakdown, and delivery line. Shared by the customer's order history and
 * the public guest order-tracking page so both render orders identically.
 */
export function OrderSummaryCard({ order }: { order: Order }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-neutral-900">
            Order #{order.id.slice(-8).toUpperCase()}
          </p>
          <p className="text-xs text-neutral-500">{formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <ul className="mt-4 divide-y divide-neutral-100 border-y border-neutral-100">
        {order.items?.map((item) => (
          <li key={item.id} className="flex justify-between gap-3 py-2.5 text-sm">
            <span className="text-neutral-700">
              {item.productName}{' '}
              <span className="text-neutral-400">
                ({item.size}) × {item.quantity}
              </span>
            </span>
            <span className="whitespace-nowrap font-medium text-neutral-900">
              {formatPKR(item.lineTotal)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 space-y-1 text-sm">
        <div className="flex justify-between text-neutral-500">
          <span>Subtotal</span>
          <span>{formatPKR(order.subtotal)}</span>
        </div>
        <div className="flex justify-between text-neutral-500">
          <span>Shipping</span>
          <span>{formatPKR(order.shippingFee)}</span>
        </div>
        <div className="flex justify-between border-t border-neutral-100 pt-1 font-semibold text-neutral-900">
          <span>Total</span>
          <span>{formatPKR(order.total)}</span>
        </div>
      </div>

      <p className="mt-3 text-xs text-neutral-400">
        Deliver to {order.customerName}, {order.address}, {order.city}
      </p>
    </div>
  )
}
