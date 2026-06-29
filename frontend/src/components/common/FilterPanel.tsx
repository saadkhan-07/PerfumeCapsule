import type { Brand, Category } from '../../types'
import { cn } from '../../utils/cn'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

export type Availability = 'in' | 'out' | null

export interface FilterPanelProps {
  brands?: Brand[]
  categories?: Category[]
  search: string
  onSearchChange: (value: string) => void
  brandId: string
  onBrandChange: (value: string) => void
  categoryId: string
  onCategoryChange: (value: string) => void
  availability: Availability
  onAvailabilityChange: (value: Availability) => void
  priceMin: string
  priceMax: string
  onPriceMinChange: (value: string) => void
  onPriceMaxChange: (value: string) => void
  onApplyPrice: () => void
  onClearAll: () => void
  hasActiveFilters: boolean
  /** Hide the internal "Filters / Clear all" header (the mobile drawer supplies its own). */
  showHeader?: boolean
}

function OptionRow({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 py-1.5 text-left text-sm"
    >
      <span
        className={cn(
          'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border',
          selected ? 'border-neutral-900' : 'border-neutral-300',
        )}
      >
        {selected && <span className="h-2 w-2 rounded-full bg-neutral-900" />}
      </span>
      <span className={cn('truncate', selected ? 'font-medium text-neutral-900' : 'text-neutral-600')}>
        {label}
      </span>
    </button>
  )
}

const Divider = () => <hr className="my-5 border-neutral-100" />

const SectionLabel = ({ children }: { children: string }) => (
  <p className="mb-2 text-sm font-medium text-neutral-900">{children}</p>
)

export function FilterPanel(props: FilterPanelProps) {
  const {
    brands, categories, search, onSearchChange, brandId, onBrandChange,
    categoryId, onCategoryChange, availability, onAvailabilityChange,
    priceMin, priceMax, onPriceMinChange, onPriceMaxChange, onApplyPrice,
    onClearAll, hasActiveFilters, showHeader = true,
  } = props

  return (
    <div>
      {showHeader && (
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900">Filters</h2>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs font-medium text-neutral-500 underline-offset-2 hover:text-neutral-900 hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Search */}
      <SectionLabel>Search</SectionLabel>
      <Input
        type="search"
        placeholder="Search perfumes..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        aria-label="Search products"
      />

      <Divider />

      {/* Brand */}
      <SectionLabel>Brand</SectionLabel>
      <div className="-mt-0.5">
        <OptionRow label="All brands" selected={brandId === ''} onClick={() => onBrandChange('')} />
        {brands?.map((b) => (
          <OptionRow
            key={b.id}
            label={b.name}
            selected={brandId === b.id}
            onClick={() => onBrandChange(b.id)}
          />
        ))}
      </div>

      <Divider />

      {/* Category */}
      <SectionLabel>Category</SectionLabel>
      <div className="-mt-0.5">
        <OptionRow
          label="All categories"
          selected={categoryId === ''}
          onClick={() => onCategoryChange('')}
        />
        {categories?.map((c) => (
          <OptionRow
            key={c.id}
            label={c.name}
            selected={categoryId === c.id}
            onClick={() => onCategoryChange(c.id)}
          />
        ))}
      </div>

      <Divider />

      {/* Availability */}
      <SectionLabel>Availability</SectionLabel>
      <div className="flex gap-2">
        {(['in', 'out'] as const).map((value) => {
          const selected = availability === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => onAvailabilityChange(selected ? null : value)}
              className={cn(
                'flex-1 rounded-lg border px-3 py-2 text-sm transition-colors',
                selected
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-300 text-neutral-600 hover:border-neutral-900',
              )}
            >
              {value === 'in' ? 'In stock' : 'Out of stock'}
            </button>
          )
        })}
      </div>

      <Divider />

      {/* Price range */}
      <SectionLabel>Price range</SectionLabel>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          placeholder="Min (Rs.)"
          value={priceMin}
          onChange={(e) => onPriceMinChange(e.target.value)}
          aria-label="Minimum price"
        />
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          placeholder="Max (Rs.)"
          value={priceMax}
          onChange={(e) => onPriceMaxChange(e.target.value)}
          aria-label="Maximum price"
        />
      </div>
      <Button size="sm" fullWidth className="mt-3" onClick={onApplyPrice}>
        Apply
      </Button>
    </div>
  )
}
