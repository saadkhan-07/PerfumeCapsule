import { Link } from 'react-router-dom'
import { useMyOrders } from '../hooks/useMyOrders'
import { formatPKR } from '../utils/format'
import type { Order } from '../types'
import { PageWrapper } from '../components/layout/PageWrapper'
import { EmptyState } from '../components/common/EmptyState'
import { OrderStatusBadge } from '../components/common/OrderStatusBadge'
import { Skeleton } from '../components/ui/Skeleton'
import { Button } from '../components/ui/Button'

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })

function OrderCard({ order }: { order: Order }) {
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

export function OrderHistoryPage() {
  const { data: orders, isLoading, isError } = useMyOrders()

  return (
    <PageWrapper>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">My Orders</h1>

      {isError ? (
        <EmptyState title="Couldn’t load your orders" message="Please try again in a moment." />
      ) : isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : !orders || orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          message="When you place an order, it will appear here."
          action={
            <Link to="/shop">
              <Button>Start shopping</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4 pb-12">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </PageWrapper>
  )
}
