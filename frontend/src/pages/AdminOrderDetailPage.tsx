import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getOrder, updateOrderStatus } from '../services/orders.service'
import type { OrderStatus } from '../types'
import { formatPKR } from '../utils/format'
import { getApiErrorMessage } from '../utils/apiError'
import { OrderStatusBadge } from '../components/common/OrderStatusBadge'
import { Skeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/common/EmptyState'

const STATUSES: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
]

export function AdminOrderDetailPage() {
  const { id } = useParams()
  const qc = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['admin', 'order', id],
    queryFn: () => getOrder(id as string),
    enabled: Boolean(id),
  })

  const statusMut = useMutation({
    mutationFn: (status: OrderStatus) => updateOrderStatus(id as string, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'order', id] })
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] })
    },
    onError: (e) => setError(getApiErrorMessage(e)),
  })

  if (isLoading) return <Skeleton className="h-64 w-full rounded-xl" />
  if (isError || !order) {
    return <EmptyState title="Order not found" message="This order may have been removed." />
  }

  return (
    <div>
      <Link to="/admin/orders" className="text-sm text-neutral-500 hover:text-neutral-900">
        ← Back to orders
      </Link>
      <div className="mb-6 mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          Order #{order.id.slice(-8).toUpperCase()}
        </h1>
        <OrderStatusBadge status={order.status} />
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-neutral-100 text-neutral-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Size</th>
                  <th className="px-5 py-3 font-medium">Qty</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {order.items?.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-3 text-neutral-900">{item.productName}</td>
                    <td className="px-5 py-3 text-neutral-600">{item.size}</td>
                    <td className="px-5 py-3 text-neutral-600">{item.quantity}</td>
                    <td className="px-5 py-3 text-neutral-600">{formatPKR(item.unitPrice)}</td>
                    <td className="px-5 py-3 text-right text-neutral-900">{formatPKR(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 ml-auto max-w-xs space-y-1 text-sm">
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
        </div>

        {/* Shipping + status */}
        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-neutral-900">Shipping</h2>
            <dl className="space-y-1 text-sm text-neutral-600">
              <div>{order.customerName}</div>
              <div>{order.customerPhone}</div>
              <div>{order.address}</div>
              <div>{order.city}</div>
              <div className="pt-2 text-xs text-neutral-400">Payment: {order.paymentMethod}</div>
            </dl>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-neutral-900">Update status</h2>
            <select
              value={order.status}
              disabled={statusMut.isPending}
              onChange={(e) => {
                setError(null)
                statusMut.mutate(e.target.value as OrderStatus)
              }}
              className="h-11 w-full rounded-lg border border-neutral-300 px-3 text-sm focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            {statusMut.isPending && <p className="mt-2 text-xs text-neutral-400">Saving…</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
