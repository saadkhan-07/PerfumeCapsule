import { Link } from 'react-router-dom'
import { useSettings } from '../../hooks/useSettings'

export function Footer() {
  const year = new Date().getFullYear()
  const { data: settings } = useSettings()
  const siteName = settings?.siteName ?? 'Perfume Capsules'
  const tagline = settings?.tagline ?? 'Authentic branded decants'

  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="text-sm font-semibold text-neutral-900">
          {siteName}
          <span className="ml-2 font-normal text-neutral-400">{tagline}</span>
        </p>
        <nav className="flex gap-6 text-sm text-neutral-500">
          <Link to="/shop" className="transition-colors hover:text-neutral-900">
            Shop
          </Link>
          <Link to="/cart" className="transition-colors hover:text-neutral-900">
            Cart
          </Link>
          <Link to="/track-order" className="transition-colors hover:text-neutral-900">
            Track your order
          </Link>
          <Link to="/orders" className="transition-colors hover:text-neutral-900">
            Orders
          </Link>
        </nav>
        <p className="text-sm text-neutral-400">© {year} {siteName}</p>
      </div>
    </footer>
  )
}
