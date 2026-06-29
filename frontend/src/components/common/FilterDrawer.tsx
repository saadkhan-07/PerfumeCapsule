import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { CloseIcon } from '../ui/icons'
import { Button } from '../ui/Button'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'

interface FilterDrawerProps {
  open: boolean
  onClose: () => void
  onClearAll: () => void
  children: ReactNode
}

/**
 * Filter drawer used at every breakpoint: slides in from the LEFT over the page
 * content (300px desktop, 85vw/max-320px mobile) with a dark overlay.
 *
 * When closed it is fully inert — translated off-screen AND visibility:hidden +
 * pointer-events:none — so a horizontal swipe can never reveal or tap it.
 */
export function FilterDrawer({ open, onClose, onClearAll, children }: FilterDrawerProps) {
  useBodyScrollLock(open)

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 transition-[visibility] duration-300',
        open ? 'visible' : 'invisible pointer-events-none',
      )}
      aria-hidden={!open}
    >
      {/* Overlay */}
      <div
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-black/50 transition-opacity duration-300',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      {/* Panel — solid white, full height, scrollable */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        className={cn(
          'absolute left-0 top-0 flex h-full w-[85vw] max-w-[320px] flex-col bg-white shadow-xl transition-transform duration-300 ease-out lg:w-[300px] lg:max-w-[300px]',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-neutral-900">Filters</h2>
          <button type="button" onClick={onClose} aria-label="Close filters" className="text-neutral-500">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>

        <div className="flex gap-3 border-t border-neutral-100 p-4">
          <Button variant="outline" fullWidth onClick={onClearAll}>
            Clear all
          </Button>
          <Button fullWidth onClick={onClose}>
            Show results
          </Button>
        </div>
      </div>
    </div>
  )
}
