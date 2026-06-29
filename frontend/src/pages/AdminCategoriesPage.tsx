import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getCategories } from '../services/meta.service'
import { createCategory, updateCategory, deleteCategory } from '../services/categories.service'
import type { Category } from '../types'
import { getApiErrorMessage } from '../utils/apiError'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { ConfirmDialog } from '../components/admin/ConfirmDialog'
import { Skeleton } from '../components/ui/Skeleton'

export function AdminCategoriesPage() {
  const qc = useQueryClient()
  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: getCategories,
  })

  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [toDelete, setToDelete] = useState<Category | null>(null)
  const [error, setError] = useState<string | null>(null)

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin', 'categories'] })
    qc.invalidateQueries({ queryKey: ['categories'] })
  }

  const createMut = useMutation({
    mutationFn: (name: string) => createCategory(name),
    onSuccess: () => {
      invalidate()
      setNewName('')
    },
    onError: (e) => setError(getApiErrorMessage(e)),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateCategory(id, name),
    onSuccess: () => {
      invalidate()
      setEditingId(null)
    },
    onError: (e) => setError(getApiErrorMessage(e)),
  })
  const delMut = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      invalidate()
      setToDelete(null)
    },
    onError: (e) => {
      setError(getApiErrorMessage(e))
      setToDelete(null)
    },
  })

  const addSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setError(null)
    createMut.mutate(newName.trim())
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Categories</h1>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={addSubmit} className="mb-6 flex gap-3">
        <Input
          placeholder="New category name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <Button type="submit" isLoading={createMut.isPending}>
          Add
        </Button>
      </form>

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        {isLoading ? (
          <div className="space-y-3 p-5">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : !categories || categories.length === 0 ? (
          <p className="p-5 text-sm text-neutral-500">No categories yet.</p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {categories.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 px-5 py-3">
                {editingId === c.id ? (
                  <>
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        isLoading={updateMut.isPending}
                        onClick={() => updateMut.mutate({ id: c.id, name: editName.trim() })}
                      >
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="font-medium text-neutral-900">{c.name}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(c.id)
                          setEditName(c.name)
                          setError(null)
                        }}
                      >
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setToDelete(c)}>
                        Delete
                      </Button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete category"
        message={`Delete “${toDelete?.name}”? Products will be unlinked from it.`}
        isLoading={delMut.isPending}
        onConfirm={() => toDelete && delMut.mutate(toDelete.id)}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}
