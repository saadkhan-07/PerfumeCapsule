import { useQuery } from '@tanstack/react-query'
import { getProducts } from '../services/products.service'
import { getAllOrders } from '../services/orders.service'
import { formatPKR } from '../utils/format'
import { Skeleton } from '../components/ui/Skeleton'

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-neutral-900">{value}</p>
    </div>
  )
}

export function AdminDashboardPage() {
  const productsQ = useQuery({
    queryKey: ['admin', 'products', 'all'],
    queryFn: () => getProducts({ limit: 100 }),
  })
  const ordersQ = useQuery({ queryKey: ['admin', 'orders'], queryFn: getAllOrders })

  const totalProducts = productsQ.data?.pagination.total ?? 0
  const orders = ordersQ.data ?? []
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0)

  const lowStock = (productsQ.data?.items ?? []).flatMap((p) =>
    (p.variants ?? [])
      .filter((v) => v.stock <= 5)
      .map((v) => ({ id: v.id, product: p.name, size: v.size, stock: v.stock })),
  )

  const loading = productsQ.isLoading || ordersQ.isLoading

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Dashboard</h1>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total products" value={totalProducts} />
          <StatCard label="Total orders" value={totalOrders} />
          <StatCard label="Total revenue" value={formatPKR(totalRevenue)} />
        </div>
      )}

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-neutral-900">
          Low stock alerts{' '}
          <span className="text-sm font-normal text-neutral-400">(stock ≤ 5)</span>
        </h2>
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          {loading ? (
            <div className="p-5">
              <Skeleton className="h-5 w-1/2" />
            </div>
          ) : lowStock.length === 0 ? (
            <p className="p-5 text-sm text-neutral-500">All variants are well stocked.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-neutral-100 text-neutral-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Size</th>
                  <th className="px-5 py-3 font-medium">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {lowStock.map((row) => (
                  <tr key={row.id}>
                    <td className="px-5 py-3 text-neutral-900">{row.product}</td>
                    <td className="px-5 py-3 text-neutral-600">{row.size}</td>
                    <td className="px-5 py-3">
                      <span className={row.stock === 0 ? 'text-red-600' : 'text-amber-600'}>
                        {row.stock}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  )
}
