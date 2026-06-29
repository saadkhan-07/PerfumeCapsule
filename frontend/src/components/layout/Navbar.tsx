import { Link, NavLink } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useCartStore, selectCartCount } from '../../store/cartStore'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors hover:text-neutral-900 ${
    isActive ? 'text-neutral-900' : 'text-neutral-500'
  }`

export function Navbar() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const cartCount = useCartStore(selectCartCount)

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link to="/" className="text-lg font-semibold tracking-tight text-neutral-900">
          Perfume<span className="text-neutral-400">Capsules</span>
        </Link>

        {/* Primary nav */}
        <div className="flex items-center gap-6">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/shop" className={navLinkClass}>
            Shop
          </NavLink>
          {isAuthenticated && user?.role === 'user' && (
            <NavLink to="/wishlist" className={navLinkClass}>
              Wishlist
            </NavLink>
          )}
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
          )}

          {/* Cart */}
          <Link
            to="/cart"
            className="relative text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900"
            aria-label={`Cart, ${cartCount} items`}
          >
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-neutral-900 px-1 text-[10px] font-semibold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Auth menu */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-neutral-500 sm:inline">{user?.name}</span>
              <button
                type="button"
                onClick={logout}
                className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
