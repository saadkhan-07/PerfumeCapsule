import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProducts, useBrands, useCategories } from '../hooks/useCatalog'
import { useDebounce } from '../hooks/useDebounce'
import { isInStock } from '../utils/format'
import { cn } from '../utils/cn'
import { PageWrapper } from '../components/layout/PageWrapper'
import { ProductCard } from '../components/common/ProductCard'
import { ProductCardSkeleton } from '../components/common/ProductCardSkeleton'
import { EmptyState } from '../components/common/EmptyState'
import { Button } from '../components/ui/Button'
import { SlidersIcon } from '../components/ui/icons'
import { FilterPanel, type Availability } from '../components/common/FilterPanel'
import { FilterDrawer } from '../components/common/FilterDrawer'

const PAGE_SIZE = 12
const GRID = 'grid grid-cols-2 gap-x-8 gap-y-12 pb-20 lg:grid-cols-3 xl:grid-cols-4'

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Server-side filters (supported by GET /products).
  const [search, setSearch] = useState('')
  const [brandId, setBrandId] = useState(() => searchParams.get('brand') ?? '')
  const [categoryId, setCategoryId] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(search, 400)

  // Client-side filters (the API query schema is strict — these are applied locally).
  const [availability, setAvailability] = useState<Availability>(null)
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [appliedMin, setAppliedMin] = useState('')
  const [appliedMax, setAppliedMax] = useState('')

  const [filtersOpen, setFiltersOpen] = useState(false)

  const { data: brands } = useBrands()
  const { data: categories } = useCategories()
  const { data, isLoading, isError, isPlaceholderData } = useProducts({
    brandId: brandId || undefined,
    categoryId: categoryId || undefined,
    search: debouncedSearch || undefined,
    page,
    limit: PAGE_SIZE,
  })

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, brandId, categoryId])

  const handleBrandChange = (value: string) => {
    setBrandId(value)
    const next = new URLSearchParams(searchParams)
    if (value) next.set('brand', value)
    else next.delete('brand')
    setSearchParams(next, { replace: true })
  }

  const applyPrice = () => {
    setAppliedMin(priceMin)
    setAppliedMax(priceMax)
  }

  const clearAll = () => {
    setSearch('')
    handleBrandChange('')
    setCategoryId('')
    setAvailability(null)
    setPriceMin('')
    setPriceMax('')
    setAppliedMin('')
    setAppliedMax('')
  }

  // Apply the client-only filters (availability + price) to the fetched page.
  const visible = useMemo(() => {
    let list = data?.items ?? []
    if (availability === 'in') list = list.filter((p) => isInStock(p.variants))
    if (availability === 'out') list = list.filter((p) => !isInStock(p.variants))

    const min = appliedMin ? Number(appliedMin) : null
    const max = appliedMax ? Number(appliedMax) : null
    if (min !== null || max !== null) {
      list = list.filter((p) => {
        const prices = (p.variants ?? []).map((v) => Number(v.price))
        if (!prices.length) return false
        const pMin = Math.min(...prices)
        const pMax = Math.max(...prices)
        if (min !== null && pMax < min) return false
        if (max !== null && pMin > max) return false
        return true
      })
    }
    return list
  }, [data, availability, appliedMin, appliedMax])

  // Active-filter chips.
  const chips = [
    brandId && { label: brands?.find((b) => b.id === brandId)?.name ?? 'Brand', onRemove: () => handleBrandChange('') },
    categoryId && { label: categories?.find((c) => c.id === categoryId)?.name ?? 'Category', onRemove: () => setCategoryId('') },
    availability && { label: availability === 'in' ? 'In stock' : 'Out of stock', onRemove: () => setAvailability(null) },
    (appliedMin || appliedMax) && {
      label: `Rs.${appliedMin || 0} – ${appliedMax || '∞'}`,
      onRemove: () => {
        setAppliedMin('')
        setAppliedMax('')
        setPriceMin('')
        setPriceMax('')
      },
    },
    debouncedSearch && { label: `“${debouncedSearch}”`, onRemove: () => setSearch('') },
  ].filter(Boolean) as { label: string; onRemove: () => void }[]

  const activeCount = chips.length
  const pagination = data?.pagination

  const filterPanelProps = {
    brands,
    categories,
    search,
    onSearchChange: setSearch,
    brandId,
    onBrandChange: handleBrandChange,
    categoryId,
    onCategoryChange: setCategoryId,
    availability,
    onAvailabilityChange: setAvailability,
    priceMin,
    priceMax,
    onPriceMinChange: setPriceMin,
    onPriceMaxChange: setPriceMax,
    onApplyPrice: applyPrice,
    onClearAll: clearAll,
    hasActiveFilters: activeCount > 0,
  }

  return (
    <PageWrapper>
      {/* Title + subtitle (full width) */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Shop</h1>
        <p className="mt-1 text-sm text-neutral-500 no-underline">Authentic branded decants.</p>
      </header>

      {/* Filter trigger bar (all sizes) — opens the filter drawer */}
      <div className="border-b border-neutral-200">
        <div className="flex items-center justify-between py-3">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-neutral-900"
          >
            <SlidersIcon className="h-5 w-5" />
            Filters
          </button>
          {activeCount > 0 && (
            <span className="text-xs text-neutral-500">
              {activeCount} {activeCount === 1 ? 'filter' : 'filters'} active
            </span>
          )}
        </div>

        {chips.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-3">
            {chips.map((chip, i) => (
              <button
                key={i}
                type="button"
                onClick={chip.onRemove}
                className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-700"
              >
                {chip.label}
                <span aria-hidden="true">×</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product grid (full width) */}
      <div className="mt-8">
        {isError ? (
          <EmptyState
            title="Couldn’t load products"
            message="Something went wrong while fetching the catalog. Please try again."
          />
        ) : isLoading ? (
          <div className={GRID}>
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState title="No products found" message="Try adjusting your search or filters." />
        ) : (
          <>
            <div className={cn(GRID, 'transition-opacity', isPlaceholderData ? 'opacity-60' : 'opacity-100')}>
              {visible.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-4">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
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
      </div>

      {/* Filter drawer (slides from left, all sizes) */}
      <FilterDrawer open={filtersOpen} onClose={() => setFiltersOpen(false)} onClearAll={clearAll}>
        <FilterPanel {...filterPanelProps} showHeader={false} />
      </FilterDrawer>
    </PageWrapper>
  )
}
