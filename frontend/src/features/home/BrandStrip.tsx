import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useBrands } from '../../hooks/useCatalog'

/** Matches PageWrapper's max-width + horizontal padding (see FeaturedProducts). */
const CONTAINER = 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8'
// Keep horizontal swipe-scroll on mobile but hide the native scrollbar.
const SCROLLBAR_HIDDEN = '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'

/**
 * A quiet logo/name strip of the brands we carry. Wraps and centers on desktop;
 * scrolls horizontally on mobile so every brand stays reachable by swipe. On
 * mobile the strip opens scrolled so the centerpiece logo (Dior) is centered in
 * the viewport, matching the desktop composition.
 */
export function BrandStrip() {
  const { data: brands, isLoading } = useBrands()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Center the strip on the Dior logo on mount (mobile only — on desktop the row
  // wraps and isn't horizontally scrollable, so setting scrollLeft is a no-op).
  // Matched by name (not index) so reordering brands later doesn't break it;
  // falls back to the middle brand if there is no "Dior".
  useEffect(() => {
    const container = scrollRef.current
    if (!container || !brands || brands.length === 0) return

    const centerOnCenterpiece = () => {
      let idx = brands.findIndex((b) => b.name.trim().toLowerCase() === 'dior')
      if (idx === -1) idx = Math.floor(brands.length / 2)
      const child = container.children[idx] as HTMLElement | undefined
      if (!child) return
      const containerRect = container.getBoundingClientRect()
      const childRect = child.getBoundingClientRect()
      // Child's center in the container's scroll coordinate space.
      const childCenter = childRect.left - containerRect.left + container.scrollLeft + childRect.width / 2
      container.scrollLeft = Math.max(0, childCenter - container.clientWidth / 2)
    }

    centerOnCenterpiece()

    // Logo widths aren't known until the images load, which shifts positions —
    // re-center once any still-loading logos finish.
    const imgs = Array.from(container.querySelectorAll('img'))
    const pending = imgs.filter((img) => !img.complete)
    if (pending.length === 0) return
    let remaining = pending.length
    const onLoad = () => {
      remaining -= 1
      if (remaining <= 0) centerOnCenterpiece()
    }
    pending.forEach((img) => img.addEventListener('load', onLoad, { once: true }))
    return () => pending.forEach((img) => img.removeEventListener('load', onLoad))
  }, [brands])

  // Hide entirely while loading or when there are no brands — no empty box.
  if (isLoading || !brands || brands.length === 0) return null

  return (
    <section className="py-20 md:py-28">
      <div className={CONTAINER}>
        <p className="text-center text-xs uppercase tracking-wide text-neutral-400">Brands we carry</p>

        <div
          ref={scrollRef}
          className={`mt-8 flex gap-x-12 gap-y-6 overflow-x-auto md:flex-wrap md:justify-center md:overflow-x-visible ${SCROLLBAR_HIDDEN}`}
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
