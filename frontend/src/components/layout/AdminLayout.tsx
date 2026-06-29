import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '../../utils/cn'

const NAV = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/brands', label: 'Brands', end: false },
  { to: '/admin/categories', label: 'Categories', end: false },
  { to: '/admin/products', label: 'Products', end: false },
  { to: '/admin/orders', label: 'Orders', end: false },
  { to: '/admin/settings', label: 'Settings', end: false },
]

/** Admin shell: sidebar nav (left on desktop, horizontal scroll on mobile) + outlet. */
export function AdminLayout() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 md:flex-row lg:px-8">
      <aside className="md:w-52 md:flex-shrink-0">
        <nav className="flex gap-1 overflow-x-auto md:flex-col">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  )
}
