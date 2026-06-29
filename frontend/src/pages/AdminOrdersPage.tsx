import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getAllOrders } from '../services/orders.service'
import { formatPKR } from '../utils/format'
import { OrderStatusBadge } from '../components/common/OrderStatusBadge'
import { Skeleton } from '../components/ui/Skeleton'

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })

export function AdminOrdersPage() {
  const navigate = useNavigate()
  const { data: orders, isLoading } = useQuery({ queryKey: ['admin', 'orders'], queryFn: getAllOrders })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Orders</h1>

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        {isLoading ? (
          <div className="space-y-3 p-5">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : !orders || orders.length === 0 ? (
          <p className="p-5 text-sm text-neutral-500">No orders yet.</p>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-neutral-100 text-neutral-500">
              <tr>
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">City</th>
                <th className="px-5 py-3 font-medium">Items</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {orders.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => navigate(`/admin/orders/${o.id}`)}
                  className="cursor-pointer hover:bg-neutral-50"
                >
                  <td className="px-5 py-3 font-medium text-neutral-900">
                    #{o.id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-5 py-3 text-neutral-700">{o.customerName}</td>
                  <td className="px-5 py-3 text-neutral-600">{o.city}</td>
                  <td className="px-5 py-3 text-neutral-600">{o.items?.length ?? 0}</td>
                  <td className="px-5 py-3 text-neutral-900">{formatPKR(o.total)}</td>
                  <td className="px-5 py-3">
                    <OrderStatusBadge status={o.status} />
                  </td>
                  <td className="px-5 py-3 text-neutral-500">{formatDate(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
