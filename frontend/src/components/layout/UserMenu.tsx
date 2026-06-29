import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useClickOutside } from '../../hooks/useClickOutside'
import { UserIcon } from '../ui/icons'

/** Desktop account control: a user icon that opens a dropdown, or a Sign In link. */
export function UserMenu() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const logout = useAuthStore((s) => s.logout)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, () => setOpen(false), open)

  if (!isAuthenticated) {
    return (
      <Link to="/login" className="text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900">
        Sign In
      </Link>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-neutral-100"
      >
        <UserIcon className="h-6 w-6" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-44 overflow-hidden rounded-lg border border-neutral-100 bg-white py-1 shadow-lg"
        >
          <Link
            to="/orders"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
          >
            My Orders
          </Link>
          <Link
            to="/wishlist"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
          >
            Wishlist
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              logout()
              setOpen(false)
            }}
            className="block w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
