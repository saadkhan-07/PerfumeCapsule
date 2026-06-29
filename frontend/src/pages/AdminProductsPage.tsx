import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getProducts, deleteProduct } from '../services/products.service'
import type { Product } from '../types'
import { getApiErrorMessage } from '../utils/apiError'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/admin/ConfirmDialog'
import { Skeleton } from '../components/ui/Skeleton'

export function AdminProductsPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products', 'all'],
    queryFn: () => getProducts({ limit: 100 }),
  })

  const [toDelete, setToDelete] = useState<Product | null>(null)
  const [error, setError] = useState<string | null>(null)

  const delMut = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products', 'all'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      setToDelete(null)
    },
    onError: (e) => {
      setError(getApiErrorMessage(e))
      setToDelete(null)
    },
  })

  const products = data?.items ?? []

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
        <Link to="/admin/products/new">
          <Button>New product</Button>
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        {isLoading ? (
          <div className="space-y-3 p-5">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : products.length === 0 ? (
          <p className="p-5 text-sm text-neutral-500">No products yet.</p>
        ) : (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-neutral-100 text-neutral-500">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Brand</th>
                <th className="px-5 py-3 font-medium">Variants</th>
                <th className="px-5 py-3 font-medium">Images</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="px-5 py-3 font-medium text-neutral-900">{p.name}</td>
                  <td className="px-5 py-3 text-neutral-600">{p.brand?.name ?? '—'}</td>
                  <td className="px-5 py-3 text-neutral-600">{p.variants?.length ?? 0}</td>
                  <td className="px-5 py-3 text-neutral-600">{p.images?.length ?? 0}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/products/${p.id}`}>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </Link>
                      <Button size="sm" variant="danger" onClick={() => setToDelete(p)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete product"
        message={`Delete “${toDelete?.name}”? Its variants and images will be removed.`}
        isLoading={delMut.isPending}
        onConfirm={() => toDelete && delMut.mutate(toDelete.id)}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}
