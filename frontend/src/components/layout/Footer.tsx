import { Link } from 'react-router-dom'
import { useSettings } from '../../hooks/useSettings'
import logo from '../../assets/Logo.png'

/** Column heading — small, uppercase, wide-tracked, muted. */
const headingClass = 'text-xs uppercase tracking-widest text-gray-400'
/** Nav/link within a column — quiet grey that darkens to black on hover. */
const linkClass = 'text-sm text-gray-600 transition-colors hover:text-black'

/* Outline social icons (inline SVG — no icon dependency, matches the minimal aesthetic). */
type IconProps = { className?: string }

function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden>
      <path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V9H6.5v3H9v9h3v-9h2.5l.5-3H12V6.5a.5.5 0 0 1 .5-.5H15V3Z" />
    </svg>
  )
}

function TikTokIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5" />
      <path d="M14 4a4.5 4.5 0 0 0 4.5 4.5" />
    </svg>
  )
}

export function Footer() {
  const year = new Date().getFullYear()
  const { data: settings } = useSettings()
  const siteName = settings?.siteName ?? 'Perfume Capsules'

  const socials = [
    { url: settings?.instagramUrl, label: 'Instagram', Icon: InstagramIcon },
    { url: settings?.facebookUrl, label: 'Facebook', Icon: FacebookIcon },
    { url: settings?.tiktokUrl, label: 'TikTok', Icon: TikTokIcon },
  ].filter((s): s is { url: string; label: string; Icon: typeof InstagramIcon } => Boolean(s.url))

  return (
    <footer className="border-t border-gray-200 bg-white">
      {/* ── Main columns ─────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-y-10 lg:grid lg:grid-cols-4 lg:gap-x-16 lg:gap-y-0">
          {/* COLUMN 1 — BRAND */}
          <div>
            <Link to="/" className="inline-flex items-center">
              <img
                src={logo}
                alt={siteName}
                className="h-12 md:h-16 w-auto object-contain"
                style={{
                  mixBlendMode: 'multiply',
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  borderRadius: 0,
                  boxShadow: 'none',
                }}
              />
            </Link>
            <p className="mt-4 text-sm text-gray-500">Authentic branded decants.</p>
            {socials.length > 0 && (
              <div className="mt-5 flex gap-4">
                {socials.map(({ url, label, Icon }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="text-gray-500 transition-colors hover:text-black"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* COLUMN 2 — SHOP */}
          <div>
            <h3 className={headingClass}>Shop</h3>
            <nav className="mt-4 flex flex-col gap-y-3">
              <Link to="/shop" className={linkClass}>
                Shop
              </Link>
              <Link to="/cart" className={linkClass}>
                Cart
              </Link>
              <Link to="/wishlist" className={linkClass}>
                Wishlist
              </Link>
            </nav>
          </div>

          {/* COLUMN 3 — ORDERS */}
          <div>
            <h3 className={headingClass}>Orders</h3>
            <nav className="mt-4 flex flex-col gap-y-3">
              <Link to="/track-order" className={linkClass}>
                Track your order
              </Link>
              <Link to="/orders" className={linkClass}>
                My Orders
              </Link>
            </nav>
          </div>

          {/* COLUMN 4 — CONTACT (SiteSettings-driven; null lines are hidden) */}
          <div>
            <h3 className={headingClass}>Contact</h3>
            <div className="mt-4 flex flex-col gap-y-3">
              {settings?.contactEmail && (
                <a href={`mailto:${settings.contactEmail}`} className={linkClass}>
                  {settings.contactEmail}
                </a>
              )}
              {settings?.contactPhone && (
                <p className="text-sm text-gray-600">{settings.contactPhone}</p>
              )}
              {settings?.city && <p className="text-sm text-gray-600">{settings.city}</p>}
              <p className="text-sm text-gray-600">Order via WhatsApp</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────────────────────── */}
      <div className="border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-xs text-gray-400">
            © {year} {siteName}
          </p>
        </div>
      </div>
    </footer>
  )
}
