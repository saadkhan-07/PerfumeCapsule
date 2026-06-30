import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getBrands } from '../services/meta.service'
import { createBrand, updateBrand, deleteBrand, type BrandInput } from '../services/brands.service'
import type { Brand } from '../types'
import { getApiErrorMessage } from '../utils/apiError'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/admin/ConfirmDialog'
import { Skeleton } from '../components/ui/Skeleton'

export function AdminBrandsPage() {
  const qc = useQueryClient()
  const { data: brands, isLoading } = useQuery({ queryKey: ['admin', 'brands'], queryFn: getBrands })

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Brand | null>(null)
  const [toDelete, setToDelete] = useState<Brand | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [logo, setLogo] = useState<File | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [pageError, setPageError] = useState<string | null>(null)

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin', 'brands'] })
    qc.invalidateQueries({ queryKey: ['brands'] })
  }

  const openCreate = () => {
    setEditing(null)
    setName('')
    setDescription('')
    setLogo(null)
    setFormError(null)
    setFormOpen(true)
  }
  const openEdit = (b: Brand) => {
    setEditing(b)
    setName(b.name)
    setDescription(b.description ?? '')
    setLogo(null)
    setFormError(null)
    setFormOpen(true)
  }

  const saveMut = useMutation({
    mutationFn: (input: BrandInput) =>
      editing ? updateBrand(editing.id, input) : createBrand(input),
    onSuccess: () => {
      invalidate()
      setFormOpen(false)
    },
    onError: (e) => setFormError(getApiErrorMessage(e)),
  })

  const delMut = useMutation({
    mutationFn: (id: string) => deleteBrand(id),
    onSuccess: () => {
      invalidate()
      setToDelete(null)
    },
    onError: (e) => {
      setPageError(getApiErrorMessage(e))
      setToDelete(null)
    },
  })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    saveMut.mutate({ name, description, logo })
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Brands</h1>
        <Button onClick={openCreate}>Add brand</Button>
      </div>

      {pageError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {pageError}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        {isLoading ? (
          <div className="space-y-3 p-5">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : !brands || brands.length === 0 ? (
          <p className="p-5 text-sm text-neutral-500">No brands yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-100 text-neutral-500">
              <tr>
                <th className="px-5 py-3 font-medium">Logo</th>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {brands.map((b) => (
                <tr key={b.id}>
                  <td className="px-5 py-3">
                    {b.logoUrl ? (
                      <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden p-1">
                        <img
                          src={b.logoUrl}
                          alt={b.name}
                          className="max-w-full max-h-full w-auto h-auto object-contain"
                        />
                      </div>
                    ) : (
                      <div className="flex w-10 h-10 items-center justify-center rounded-md bg-gray-100 text-xs text-neutral-400">
                        —
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3 font-medium text-neutral-900">{b.name}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(b)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setToDelete(b)}>
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

      {/* Create / edit modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit brand' : 'Add brand'}
      >
        <form onSubmit={submit} className="space-y-4" noValidate>
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </div>
          )}
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Logo {editing && <span className="text-neutral-400">(leave empty to keep current)</span>}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-900 file:px-3 file:py-2 file:text-sm file:text-white"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saveMut.isPending}>
              {editing ? 'Save changes' : 'Create brand'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete brand"
        message={`Delete “${toDelete?.name}”? This cannot be undone.`}
        isLoading={delMut.isPending}
        onConfirm={() => toDelete && delMut.mutate(toDelete.id)}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}
