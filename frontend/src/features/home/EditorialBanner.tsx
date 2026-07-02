import { useEffect, useState } from 'react'
import { cn } from '../../utils/cn'
import slide1 from '../../assets/Hero1(Valentino).jpg'
import slide2 from '../../assets/Hero2(Tomford).jpg'
import slide3 from '../../assets/Hero3.jpg'
import slide4 from '../../assets/sauvage elixir Hero image.jpg'

/**
 * Auto-sliding editorial carousel — crossfades (opacity) between three product
 * shots every 3s, pauses on hover, with clickable dot indicators that also reset
 * the timer. Built with plain React state + CSS transitions (no carousel
 * library) to keep the bundle light.
 *
 * Two layouts driven by ONE piece of carousel state (`active`/`paused` + a
 * single interval), so the active slide stays in sync across viewports:
 *  - Below `lg`: full-bleed image with overlay text and bottom-center dots
 *    (unchanged — this path was already well-composed on mobile/tablet).
 *  - `lg` and up: a split layout — black text panel (left, 45%) + image panel
 *    (right, 55%). The narrower image panel is much closer to the source photos'
 *    portrait aspect ratio, so `object-cover` crops minimally and the bottle
 *    stays well-composed instead of being over-zoomed by a full-width strip.
 *
 * Per-slide tuning (from inspecting the actual images):
 *  - `gradient`: Hero1's windowsill and Hero2's white fabric are light in the
 *    bottom-left where the overlay text sits, so they need a stronger dark
 *    gradient than the darker Hero3.
 *  - `position`: with object-cover on a WIDE (below-lg) viewport the default
 *    center-center crop pulls back onto empty wall/fabric, so each image gets a
 *    `md:` object-position aimed at where its bottle actually sits. Mobile
 *    keeps center-center.
 *  - `desktopPosition`: the `lg` image panel is tall/near-square and crops the
 *    portrait sources vertically, so the default is `center bottom` to keep each
 *    bottle's BASE in frame. Slides where a low crop composes worse override it.
 */
const slides = [
  {
    image: slide2,
    label: 'THE COLLECTION',
    heading: 'Every scent, in miniature.',
    gradient: 'from-black/80 via-black/30 to-transparent',
    // Tom Ford bottle is large and centered → keep center.
    position: 'md:object-[center_50%]',
    // Landscape shot: the tall panel only crops horizontally, so the base stays
    // visible; center bottom is safe.
    desktopPosition: 'object-bottom',
  },
  {
    image: slide1,
    label: 'THE RITUAL',
    heading: 'Decant. Discover. Decide.',
    gradient: 'from-black/70 via-black/20 to-transparent',
    // Valentino bottle sits low in frame → pull the desktop crop downward.
    position: 'md:object-[center_62%]',
    // Portrait shot cropped by the tall panel: bias slightly below center so the
    // base clears the bottom edge (nudges the bottle up in frame) without
    // cutting the cap off the top.
    desktopPosition: 'object-[center_64%]',
  },
  {
    image: slide3,
    label: 'THE EXPERIENCE',
    heading: 'Try first. Commit later.',
    gradient: 'from-black/60 via-black/10 to-transparent',
    // Tall flat-lay: labels (YSL, "9 pm") sit upper-middle → bias the crop up.
    position: 'md:object-[center_42%]',
    // Flat-lay of laid-down bottles (no upright base): center bottom would crop
    // off the top bottle + labels, so this slide composes better centered.
    desktopPosition: 'object-center',
  },
  {
    image: slide4,
    label: 'THE SIGNATURE',
    heading: 'Icons, by the decant.',
    // Bottle sits on light bedding where the overlay text lands → strong gradient.
    gradient: 'from-black/80 via-black/30 to-transparent',
    // Portrait flat-lay: bottle sits lower-center → bias the crop down to it.
    position: 'md:object-[center_58%]',
    // Tall panel crops vertically: bias below center so the Sauvage bottle +
    // label stay framed rather than empty bedding up top.
    desktopPosition: 'object-[center_58%]',
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
      {/* ── MOBILE / TABLET (below lg) — full-bleed, unchanged ────────────── */}
      <div className="lg:hidden">
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
      </div>

      {/* ── DESKTOP (lg and up) — split layout: black text panel + image ──── */}
      <div className="hidden h-full w-full lg:flex">
        {/* LEFT: black text panel (~45%). Text crossfades per slide. */}
        <div className="relative w-[45%] bg-black">
          {slides.map((slide, i) => (
            <div
              key={i}
              className={cn(
                'absolute inset-0 flex flex-col justify-center p-16 transition-opacity duration-1000 ease-in-out',
                // Only the active layer receives clicks so its dots stay usable.
                i === active ? 'opacity-100' : 'pointer-events-none opacity-0',
              )}
              aria-hidden={i !== active}
            >
              <p className="text-xs uppercase tracking-widest text-white/60">{slide.label}</p>
              <p className="mt-2 text-4xl font-bold leading-tight text-white xl:text-5xl">
                {slide.heading}
              </p>
              {/* Dots live in the text panel on desktop, left-aligned below the heading. */}
              <div className="mt-8 flex gap-2.5">
                {slides.map((_, j) => (
                  <button
                    key={j}
                    type="button"
                    onClick={() => setActive(j)}
                    aria-label={`Go to slide ${j + 1}`}
                    aria-current={j === active}
                    className={cn(
                      'h-2 w-2 rounded-full transition-colors',
                      j === active ? 'bg-white' : 'bg-white/40 hover:bg-white/70',
                    )}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT: image panel (~55%). Narrow enough that object-cover crops minimally. */}
        <div className="relative w-[55%]">
          {slides.map((slide, i) => (
            <img
              key={i}
              src={slide.image}
              alt=""
              className={cn(
                'absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out',
                // Per-slide desktop crop; defaults to center bottom so bottle bases stay in frame.
                slide.desktopPosition ?? 'object-bottom',
                i === active ? 'opacity-100' : 'opacity-0',
              )}
              aria-hidden={i !== active}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
