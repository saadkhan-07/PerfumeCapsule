import heroImage from '../../assets/hero.png'

/**
 * Full-bleed atmospheric banner (edge to edge, no max-width container). The
 * fixed viewport-relative height prevents layout shift while the image loads.
 */
export function EditorialBanner() {
  return (
    <section className="relative h-[50vh] w-full overflow-hidden md:h-[70vh]">
      <img
        src={heroImage}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Dark gradient at the bottom keeps the white overlay text readable
          regardless of the underlying image. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

      <div className="absolute bottom-0 left-0 p-8 md:p-16">
        <p className="text-xs uppercase tracking-widest text-white/80">The Ritual</p>
        <p className="mt-2 text-3xl font-bold text-white md:text-5xl">Decant. Discover. Decide.</p>
      </div>
    </section>
  )
}
