import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getProduct, createProduct, updateProduct, type ProductInput } from '../services/products.service'
import { getBrands, getCategories } from '../services/meta.service'
import { createVariant, updateVariant, deleteVariant, type VariantInput } from '../services/variants.service'
import { addProductImages, deleteProductImage } from '../services/images.service'
import type { ProductImage, ProductVariant } from '../types'
import { getApiErrorMessage } from '../utils/apiError'
import { formatPKR } from '../utils/format'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Skeleton } from '../components/ui/Skeleton'

export function AdminProductFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const qc = useQueryClient()

  const productQ = useQuery({
    queryKey: ['admin', 'product', id],
    queryFn: () => getProduct(id as string),
    enabled: isEdit,
  })
  const { data: brands } = useQuery({ queryKey: ['admin', 'brands'], queryFn: getBrands })
  const { data: categories } = useQuery({ queryKey: ['admin', 'categories'], queryFn: getCategories })

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [brandId, setBrandId] = useState('')
  const [categoryIds, setCategoryIds] = useState<string[]>([])
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    const p = productQ.data
    if (p) {
      setName(p.name)
      setDescription(p.description ?? '')
      setBrandId(p.brandId)
      setCategoryIds((p.categories ?? []).map((c) => c.categoryId))
    }
  }, [productQ.data])

  const saveMut = useMutation({
    mutationFn: (input: ProductInput) => (isEdit ? updateProduct(id as string, input) : createProduct(input)),
    onSuccess: (product) => {
      qc.invalidateQueries({ queryKey: ['admin', 'products', 'all'] })
      qc.invalidateQueries({ queryKey: ['admin', 'product', product.id] })
      if (!isEdit) navigate(`/admin/products/${product.id}`)
    },
    onError: (e) => setFormError(getApiErrorMessage(e)),
  })

  const toggleCategory = (cid: string) =>
    setCategoryIds((prev) => (prev.includes(cid) ? prev.filter((x) => x !== cid) : [...prev, cid]))

  if (isEdit && productQ.isLoading) {
    return <Skeleton className="h-64 w-full rounded-xl" />
  }

  return (
    <div>
      <Link to="/admin/products" className="text-sm text-neutral-500 hover:text-neutral-900">
        ← Back to products
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-semibold tracking-tight">
        {isEdit ? 'Edit product' : 'New product'}
      </h1>

      {/* Product fields */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setFormError(null)
          if (!brandId) {
            setFormError('Please select a brand.')
            return
          }
          saveMut.mutate({ name, description, brandId, categoryIds })
        }}
        className="max-w-xl space-y-4 rounded-xl border border-neutral-200 bg-white p-5"
        noValidate
      >
        {formError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError}
          </div>
        )}
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">Brand</label>
          <select
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            className="h-11 w-full rounded-lg border border-neutral-300 px-3 text-sm focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
          >
            <option value="">Select a brand…</option>
            {brands?.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">Categories</label>
          <div className="flex flex-wrap gap-2">
            {categories?.length ? (
              categories.map((c) => {
                const selected = categoryIds.includes(c.id)
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCategory(c.id)}
                    className={`rounded-full border px-3 py-1.5 text-sm ${
                      selected
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-300 text-neutral-700'
                    }`}
                  >
                    {c.name}
                  </button>
                )
              })
            ) : (
              <p className="text-sm text-neutral-400">No categories yet.</p>
            )}
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit" isLoading={saveMut.isPending}>
            {isEdit ? 'Save changes' : 'Create product'}
          </Button>
          {!isEdit && (
            <p className="mt-2 text-xs text-neutral-400">
              Save the product first, then add variants and images.
            </p>
          )}
        </div>
      </form>

      {/* Variants + Images (edit mode only) */}
      {isEdit && productQ.data && (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <VariantsSection productId={productQ.data.id} variants={productQ.data.variants ?? []} />
          <ImagesSection productId={productQ.data.id} images={productQ.data.images ?? []} />
        </div>
      )}
    </div>
  )
}

function VariantsSection({ productId, variants }: { productId: string; variants: ProductVariant[] }) {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'product', productId] })
  const [size, setSize] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [eSize, setESize] = useState('')
  const [ePrice, setEPrice] = useState('')
  const [eStock, setEStock] = useState('')

  const addMut = useMutation({
    mutationFn: (v: VariantInput) => createVariant(productId, v),
    onSuccess: () => {
      invalidate()
      setSize('')
      setPrice('')
      setStock('')
    },
    onError: (e) => setError(getApiErrorMessage(e)),
  })
  const updMut = useMutation({
    mutationFn: ({ vid, v }: { vid: string; v: Partial<VariantInput> }) =>
      updateVariant(productId, vid, v),
    onSuccess: () => {
      invalidate()
      setEditingId(null)
    },
    onError: (e) => setError(getApiErrorMessage(e)),
  })
  const delMut = useMutation({
    mutationFn: (vid: string) => deleteVariant(productId, vid),
    onSuccess: invalidate,
    onError: (e) => setError(getApiErrorMessage(e)),
  })

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5">
      <h2 className="mb-4 text-lg font-semibold text-neutral-900">Variants</h2>

      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {variants.length === 0 && <p className="text-sm text-neutral-400">No variants yet.</p>}
        {variants.map((v) =>
          editingId === v.id ? (
            <div key={v.id} className="flex flex-wrap items-center gap-2">
              <Input className="w-20" value={eSize} onChange={(e) => setESize(e.target.value)} />
              <Input className="w-24" type="number" value={ePrice} onChange={(e) => setEPrice(e.target.value)} />
              <Input className="w-20" type="number" value={eStock} onChange={(e) => setEStock(e.target.value)} />
              <Button
                size="sm"
                isLoading={updMut.isPending}
                onClick={() =>
                  updMut.mutate({
                    vid: v.id,
                    v: { size: eSize.trim(), price: Number(ePrice), stock: Number(eStock) },
                  })
                }
              >
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                Cancel
              </Button>
            </div>
          ) : (
            <div key={v.id} className="flex items-center justify-between gap-2 rounded-lg bg-neutral-50 px-3 py-2 text-sm">
              <span className="font-medium text-neutral-900">{v.size}</span>
              <span className="text-neutral-600">{formatPKR(v.price)}</span>
              <span className={v.stock <= 5 ? 'text-amber-600' : 'text-neutral-500'}>
                stock: {v.stock}
              </span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingId(v.id)
                    setESize(v.size)
                    setEPrice(String(v.price))
                    setEStock(String(v.stock))
                    setError(null)
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => delMut.mutate(v.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  Delete
                </Button>
              </div>
            </div>
          ),
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          setError(null)
          const p = Number(price)
          if (!size.trim() || !p) {
            setError('Size and a price greater than 0 are required.')
            return
          }
          addMut.mutate({ size: size.trim(), price: p, stock: stock ? Number(stock) : 0 })
        }}
        className="mt-4 flex flex-wrap items-end gap-2 border-t border-neutral-100 pt-4"
      >
        <Input label="Size" className="w-20" placeholder="5ml" value={size} onChange={(e) => setSize(e.target.value)} />
        <Input label="Price" className="w-24" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
        <Input label="Stock" className="w-20" type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
        <Button type="submit" size="sm" isLoading={addMut.isPending}>
          Add
        </Button>
      </form>
    </section>
  )
}

function ImagesSection({ productId, images }: { productId: string; images: ProductImage[] }) {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'product', productId] })
  const [error, setError] = useState<string | null>(null)

  const uploadMut = useMutation({
    mutationFn: (files: File[]) => addProductImages(productId, files),
    onSuccess: invalidate,
    onError: (e) => setError(getApiErrorMessage(e)),
  })
  const delMut = useMutation({
    mutationFn: (imageId: string) => deleteProductImage(productId, imageId),
    onSuccess: invalidate,
    onError: (e) => setError(getApiErrorMessage(e)),
  })

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5">
      <h2 className="mb-4 text-lg font-semibold text-neutral-900">Images</h2>

      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {images.length === 0 ? (
        <p className="text-sm text-neutral-400">No images yet.</p>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {images.map((img) => (
            <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border border-neutral-200">
              <img src={img.url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => delMut.mutate(img.id)}
                className="absolute right-1 top-1 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 border-t border-neutral-100 pt-4">
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">
          Upload images {uploadMut.isPending && <span className="text-neutral-400">(uploading…)</span>}
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={uploadMut.isPending}
          onChange={(e) => {
            const files = Array.from(e.target.files ?? [])
            if (files.length) uploadMut.mutate(files)
            e.target.value = ''
          }}
          className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-900 file:px-3 file:py-2 file:text-sm file:text-white"
        />
      </div>
    </section>
  )
}
