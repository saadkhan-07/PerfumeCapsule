import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { AnnouncementBar } from './AnnouncementBar'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { useSettings } from '../../hooks/useSettings'

/**
 * App shell shared by every route: navbar on top, routed page in the middle,
 * footer at the bottom, pinned to a full-height flex column.
 */
export function RootLayout() {
  const { data: settings } = useSettings()

  // Apply site name + favicon from SiteSettings at runtime. The static index.html
  // values show immediately (no flash); an admin-set favicon overrides once fetched.
  useEffect(() => {
    if (settings?.siteName) {
      document.title = settings.siteName
    }
    if (settings?.faviconUrl) {
      const link =
        (document.querySelector("link[rel='icon']") as HTMLLinkElement | null) ??
        document.createElement('link')
      link.rel = 'icon'
      link.href = settings.faviconUrl
      document.head.appendChild(link)
    }
  }, [settings])

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-neutral-50 text-neutral-900">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
