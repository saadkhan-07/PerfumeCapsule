import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useCartStore, selectCartCount } from '../../store/cartStore'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import { cn } from '../../utils/cn'
import { BagIcon, CloseIcon } from '../ui/icons'
import { UserMenu } from './UserMenu'
import logo from '../../assets/Logo.png'

const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors hover:text-neutral-900 ${
    isActive ? 'text-neutral-900' : 'text-neutral-500'
  }`

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-md px-2 py-3 text-base font-medium',
    isActive ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-700',
  )

/** Shopping-bag icon with a count badge. */
function BagLink({ count, onClick }: { count: number; onClick?: () => void }) {
  return (
    <Link
      to="/cart"
      onClick={onClick}
      aria-label={`Cart, ${count} items`}
      className="relative flex h-9 w-9 items-center justify-center text-neutral-700 transition-colors hover:text-neutral-900"
    >
      <BagIcon className="h-6 w-6" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-neutral-900 px-1 text-[10px] font-semibold text-white">
          {count}
        </span>
      )}
    </Link>
  )
}

export function Navbar() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const cartCount = useCartStore(selectCartCount)
  const [menuOpen, setMenuOpen] = useState(false)

  const close = () => setMenuOpen(false)
  useBodyScrollLock(menuOpen)

  // Both the desktop nav and the mobile drawer render from this single list, so
  // adding here places the link in both, with identical styling + close behavior.
  // Track Order is public (guests need it most), so it is not auth-gated.
  const links = [
    { to: '/', label: 'Home', end: true },
    { to: '/shop', label: 'Shop', end: false },
    ...(isAuthenticated && user?.role === 'user'
      ? [{ to: '/wishlist', label: 'Wishlist', end: false }]
      : []),
    { to: '/track-order', label: 'Track Order', end: false },
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin', end: false }] : []),
  ]

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" onClick={close} className="flex items-center">
            <img
              src={logo}
              alt="Perfume Capsules"
              className="h-8 md:h-10 w-auto object-contain"
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

          {/* Desktop */}
          <div className="hidden items-center gap-6 md:flex">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={desktopLinkClass}>
                {l.label}
              </NavLink>
            ))}
            <BagLink count={cartCount} />
            <UserMenu />
          </div>

          {/* Mobile: bag + hamburger */}
          <div className="flex items-center gap-1 md:hidden">
            <BagLink count={cartCount} />
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-md text-2xl leading-none text-neutral-700 hover:bg-neutral-100"
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              ☰
            </button>
          </div>
        </nav>
      </header>

      {/*
        Mobile drawer — rendered OUTSIDE the header. The header uses backdrop-blur,
        and a backdrop-filter ancestor would make this fixed element resolve against
        the header box (breaking full-height / opacity). As a sibling it covers the
        viewport with a solid white panel.
      */}
      <div
        className={cn(
          'fixed inset-0 z-50 transition-[visibility] duration-300 md:hidden',
          menuOpen ? 'visible' : 'invisible pointer-events-none',
        )}
        aria-hidden={!menuOpen}
      >
        <div
          onClick={close}
          className={cn(
            'absolute inset-0 bg-black/50 transition-opacity duration-300',
            menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={cn(
            'absolute right-0 top-0 flex h-full w-72 max-w-[85vw] flex-col bg-white shadow-xl transition-transform duration-300 ease-out',
            menuOpen ? 'translate-x-0' : 'translate-x-full',
          )}
        >
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
            <img
              src={logo}
              alt="Perfume Capsules"
              className="h-8 w-auto object-contain"
              style={{
                mixBlendMode: 'multiply',
                background: 'transparent',
                border: 'none',
                padding: 0,
                borderRadius: 0,
                boxShadow: 'none',
              }}
            />
            <button type="button" onClick={close} aria-label="Close menu" className="text-neutral-500">
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-1 flex-col px-4 py-3">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} onClick={close} className={mobileLinkClass}>
                {l.label}
              </NavLink>
            ))}
            <Link
              to="/cart"
              onClick={close}
              className="flex items-center justify-between rounded-md px-2 py-3 text-base font-medium text-neutral-700"
            >
              <span className="flex items-center gap-2">
                <BagIcon className="h-5 w-5" /> Cart
              </span>
              {cartCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-900 px-1 text-xs font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          <div className="border-t border-neutral-100 p-4">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  logout()
                  close()
                }}
                className="w-full rounded-md border border-neutral-300 px-3 py-2.5 text-sm font-medium text-neutral-700"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                onClick={close}
                className="block w-full rounded-md bg-neutral-900 px-3 py-2.5 text-center text-sm font-medium text-white"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
