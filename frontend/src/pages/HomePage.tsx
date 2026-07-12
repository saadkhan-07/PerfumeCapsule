import { FeaturedProducts } from '../features/home/FeaturedProducts'
import { HowItWorks } from '../features/home/HowItWorks'
import { BrandStrip } from '../features/home/BrandStrip'
import { EditorialBanner } from '../features/home/EditorialBanner'
import heroBanner from '../assets/hero-banner.png'

export function HomePage() {
  return (
    <>
      {/* Hero — two cleanly separated rendering paths sharing one image import. */}

      {/* MOBILE (below lg): tall, immersive image hero, image only. Height is 48vh
          (not 75vh): at 75vh object-cover only reveals ~33% of this 1.85:1 image
          and clips the outer bottles; 48vh is the tallest crop that keeps all
          three bottles fully in frame (verified against the source). */}
      <section className="relative h-[48vh] w-full overflow-hidden lg:hidden">
        <img
          src={heroBanner}
          alt="Perfume bottles on black marble"
          className="absolute inset-0 h-full w-full object-cover object-[50%_center]"
        />
      </section>

      {/* DESKTOP (lg and up): unchanged — fixed 85vh with object-cover, no overlay. */}
      <section className="relative hidden h-[85vh] w-full overflow-hidden lg:block">
        <img
          src={heroBanner}
          alt="Perfume bottles on black marble"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      </section>

      {/* New sections below the hero. Footer is rendered by RootLayout. */}
      <FeaturedProducts />
      <HowItWorks />
      <BrandStrip />
      <EditorialBanner />
    </>
  )
}
