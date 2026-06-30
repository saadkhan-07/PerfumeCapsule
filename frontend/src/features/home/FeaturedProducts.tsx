import { Link } from 'react-router-dom'
import { useProducts } from '../../hooks/useCatalog'
import { ProductCard } from '../../components/common/ProductCard'
import { ProductCardSkeleton } from '../../components/common/ProductCardSkeleton'

/** Matches PageWrapper's max-width + horizontal padding so the section aligns
 *  with the hero and shop page. Vertical rhythm is owned by the section. */
const CONTAINER = 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8'
const GRID = 'grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-3 xl:grid-cols-4'
const FEATURED_COUNT = 4

/**
 * A small curated strip of the first few catalog products, reusing the exact
 * ProductCard and skeleton from the shop page. The schema has no `featured`
 * flag, so we simply show the first active products (limit=4).
 */
export function FeaturedProducts() {
  const { data, isLoading, isError } = useProducts({ page: 1, limit: FEATURED_COUNT })
  const products = (data?.items ?? []).slice(0, FEATURED_COUNT)

  // Hide the whole section when the catalog is empty or unavailable — never
  // render a broken, headed-but-empty box on the homepage.
  if (!isLoading && (isError || products.length === 0)) return null

  return (
    <section className="py-20 md:py-28">
      <div className={CONTAINER}>
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">Featured</h2>
          <Link
            to="/shop"
            className="text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900"
          >
            View all
          </Link>
        </div>

        <div className={`${GRID} mt-10`}>
          {isLoading
            ? Array.from({ length: FEATURED_COUNT }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
    </section>
  )
}
