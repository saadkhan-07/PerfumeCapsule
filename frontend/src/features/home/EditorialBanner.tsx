import { useEffect, useState } from 'react'
import { cn } from '../../utils/cn'
import slide1 from '../../assets/Hero1(Valentino).jpg'
import slide2 from '../../assets/Hero2(Tomford).jpg'
import slide3 from '../../assets/Hero3.jpg'

/**
 * Auto-sliding editorial carousel — full-bleed, crossfades (opacity) between
 * three product shots every 3s, pauses on hover, with clickable dot indicators
 * that also reset the timer. Built with plain React state + CSS transitions (no
 * carousel library) to keep the bundle light.
 *
 * Per-slide tuning (from inspecting the actual images):
 *  - `gradient`: Hero1's windowsill and Hero2's white fabric are light in the
 *    bottom-left where the overlay text sits, so they need a stronger dark
 *    gradient than the darker Hero3.
 *  - `position`: with object-cover on a WIDE desktop viewport the default
 *    center-center crop pulls back onto empty wall/fabric, so each image gets a
 *    desktop object-position aimed at where its bottle actually sits. Mobile
 *    keeps center-center (it was already well-composed).
 */
const slides = [
  {
    image: slide1,
    label: 'THE RITUAL',
    heading: 'Decant. Discover. Decide.',
    gradient: 'from-black/70 via-black/20 to-transparent',
    // Valentino bottle sits low in frame → pull the desktop crop downward.
    position: 'md:object-[center_62%]',
  },
  {
    image: slide2,
    label: 'THE COLLECTION',
    heading: 'Every scent, in miniature.',
    gradient: 'from-black/80 via-black/30 to-transparent',
    // Tom Ford bottle is large and centered → keep center.
    position: 'md:object-[center_50%]',
  },
  {
    image: slide3,
    label: 'THE EXPERIENCE',
    heading: 'Try first. Commit later.',
    gradient: 'from-black/60 via-black/10 to-transparent',
    // Tall flat-lay: labels (YSL, "9 pm") sit upper-middle → bias the crop up.
    position: 'md:object-[center_42%]',
  },
]

const AUTO_ADVANCE_MS = 3000

export function EditorialBanner() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setActive((i) => (i + 1) % slides.length), AUTO_ADVANCE_MS)
    return () => clearInterval(id)
    // Re-keying on `active` restarts the 3s timer after a manual dot jump.
  }, [paused, active])

  return (
    <section
      className="relative h-[50vh] w-full overflow-hidden md:h-[75vh]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Editorial highlights"
    >
      {slides.map((slide, i) => (
        <div
          key={i}
          className={cn(
            'absolute inset-0 transition-opacity duration-1000 ease-in-out',
            i === active ? 'opacity-100' : 'opacity-0',
          )}
          aria-hidden={i !== active}
        >
          <img
            src={slide.image}
            alt=""
            className={cn(
              'absolute inset-0 h-full w-full object-cover object-center',
              slide.position,
            )}
          />
          {/* Per-slide dark gradient keeps the white overlay text readable. */}
          <div className={cn('absolute inset-0 bg-gradient-to-t', slide.gradient)} />
          <div className="absolute bottom-0 left-0 p-8 md:p-16">
            <p className="text-xs uppercase tracking-widest text-white/80">{slide.label}</p>
            <p className="mt-2 text-3xl font-bold text-white md:text-5xl">{slide.heading}</p>
          </div>
        </div>
      ))}

      {/* Dot indicators — always visible; click jumps to a slide and resets the timer. */}
      <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2.5">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === active}
            className={cn(
              'h-2 w-2 rounded-full transition-colors',
              i === active ? 'bg-white' : 'bg-white/40 hover:bg-white/70',
            )}
          />
        ))}
      </div>
    </section>
  )
}
