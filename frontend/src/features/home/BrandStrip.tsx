import { Link } from 'react-router-dom'
import { useBrands } from '../../hooks/useCatalog'

/** Matches PageWrapper's max-width + horizontal padding (see FeaturedProducts). */
const CONTAINER = 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8'
// Keep horizontal swipe-scroll on mobile but hide the native scrollbar.
const SCROLLBAR_HIDDEN = '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'

/**
 * A quiet logo/name strip of the brands we carry. Wraps and centers on desktop;
 * scrolls horizontally on mobile so every brand stays reachable by swipe.
 */
export function BrandStrip() {
  const { data: brands, isLoading } = useBrands()

  // Hide entirely while loading or when there are no brands — no empty box.
  if (isLoading || !brands || brands.length === 0) return null

  return (
    <section className="py-20 md:py-28">
      <div className={CONTAINER}>
        <p className="text-center text-xs uppercase tracking-wide text-neutral-400">Brands we carry</p>

        <div
          className={`mt-8 flex gap-x-12 overflow-x-auto md:flex-wrap md:justify-center ${SCROLLBAR_HIDDEN}`}
        >
          {brands.map((brand) => (
            <Link
              key={brand.id}
              to={`/shop?brand=${brand.id}`}
              aria-label={`Shop ${brand.name}`}
              className="flex h-14 flex-shrink-0 cursor-pointer items-center justify-center px-4 transition-opacity duration-200 hover:opacity-70"
            >
              {brand.logoUrl ? (
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="h-full w-auto object-contain"
                  style={{ mixBlendMode: 'multiply' }}
                />
              ) : (
                <span className="whitespace-nowrap text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900">
                  {brand.name}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
