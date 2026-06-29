import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProducts, useBrands, useCategories } from '../hooks/useCatalog'
import { useDebounce } from '../hooks/useDebounce'
import { PageWrapper } from '../components/layout/PageWrapper'
import { ProductCard } from '../components/common/ProductCard'
import { ProductCardSkeleton } from '../components/common/ProductCardSkeleton'
import { EmptyState } from '../components/common/EmptyState'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Button } from '../components/ui/Button'

const PAGE_SIZE = 12

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [search, setSearch] = useState('')
  const [brandId, setBrandId] = useState(() => searchParams.get('brand') ?? '')
  const [categoryId, setCategoryId] = useState('')
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebounce(search, 400)

  const { data: brands } = useBrands()
  const { data: categories } = useCategories()
  const { data, isLoading, isError, isPlaceholderData } = useProducts({
    brandId: brandId || undefined,
    categoryId: categoryId || undefined,
    search: debouncedSearch || undefined,
    page,
    limit: PAGE_SIZE,
  })

  // Reset to page 1 whenever filters change.
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, brandId, categoryId])

  // Keep the brand filter reflected in the URL (so brand links deep-link here).
  const handleBrandChange = (value: string) => {
    setBrandId(value)
    const next = new URLSearchParams(searchParams)
    if (value) next.set('brand', value)
    else next.delete('brand')
    setSearchParams(next, { replace: true })
  }

  const products = data?.items ?? []
  const pagination = data?.pagination

  return (
    <PageWrapper>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Shop</h1>
        <p className="mt-1 text-sm text-neutral-500">Authentic branded decants.</p>
      </header>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Input
          type="search"
          placeholder="Search perfumes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search products"
        />
        <Select
          value={brandId}
          onChange={(e) => handleBrandChange(e.target.value)}
          aria-label="Filter by brand"
        >
          <option value="">All brands</option>
          {brands?.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Select>
        <Select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      {/* Results */}
      {isError ? (
        <EmptyState
          title="Couldn’t load products"
          message="Something went wrong while fetching the catalog. Please try again."
        />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title="No products found"
          message="Try adjusting your search or filters."
        />
      ) : (
        <>
          <div
            className={`grid grid-cols-1 gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${
              isPlaceholderData ? 'opacity-60' : 'opacity-100'
            }`}
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-neutral-500">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </PageWrapper>
  )
}
