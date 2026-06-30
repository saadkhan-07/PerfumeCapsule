import { useState } from 'react'
import { useSettings } from '../../hooks/useSettings'
import { CloseIcon } from '../ui/icons'

// Session-only dismissal (clears when the tab/session closes). sessionStorage,
// not localStorage, so the bar reappears in a fresh session.
const DISMISS_KEY = 'pc-announcement-dismissed'

/**
 * Thin full-width black bar above the navbar showing the single admin-editable
 * SiteSettings.announcementBar message. Renders nothing when the message is
 * empty/null or when dismissed for this session.
 */
export function AnnouncementBar() {
  const { data: settings } = useSettings()
  const message = settings?.announcementBar?.trim()

  const [dismissed, setDismissed] = useState(
    () => typeof window !== 'undefined' && sessionStorage.getItem(DISMISS_KEY) === '1',
  )

  if (!message || dismissed) return null

  const close = () => {
    sessionStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
  }

  return (
    <div className="relative bg-black px-10 py-2 text-center">
      {/* px-10 keeps the centered text clear of the close button on the right,
          including when it wraps to a second line on mobile. */}
      <p className="text-xs tracking-wide text-white sm:text-sm">{message}</p>
      <button
        type="button"
        onClick={close}
        aria-label="Dismiss announcement"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/80 transition-colors hover:text-white"
      >
        <CloseIcon className="h-4 w-4" />
      </button>
    </div>
  )
}
