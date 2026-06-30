import { Link } from 'react-router-dom'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Button } from '../components/ui/Button'
import { FeaturedProducts } from '../features/home/FeaturedProducts'
import { HowItWorks } from '../features/home/HowItWorks'
import { BrandStrip } from '../features/home/BrandStrip'
import { EditorialBanner } from '../features/home/EditorialBanner'

export function HomePage() {
  return (
    <>
      {/* Hero — existing, unchanged. */}
      <PageWrapper>
        <section className="flex flex-col items-center py-16 text-center sm:py-24">
          <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium uppercase tracking-wide text-neutral-500">
            Authentic branded decants
          </span>
          <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">
            Discover your signature scent, one capsule at a time.
          </h1>
          <p className="mt-4 max-w-xl text-base text-neutral-500">
            Premium perfume decants in 5ml, 10ml and 30ml — try luxury fragrances without
            committing to a full bottle.
          </p>
          <div className="mt-8 flex gap-3">
            <Link to="/shop">
              <Button size="lg">Shop the collection</Button>
            </Link>
          </div>
        </section>
      </PageWrapper>

      {/* New sections below the hero. Footer is rendered by RootLayout. */}
      <FeaturedProducts />
      <HowItWorks />
      <BrandStrip />
      <EditorialBanner />
    </>
  )
}
