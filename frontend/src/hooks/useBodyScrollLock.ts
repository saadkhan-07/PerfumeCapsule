import { useEffect } from 'react'

// Module-level counter so multiple simultaneous locks (e.g. two drawers) compose
// correctly — body scroll is only restored once every lock has been released.
let lockCount = 0

/** Locks `document.body` scroll while `locked` is true; restores it when released. */
export function useBodyScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return
    lockCount += 1
    document.body.style.overflow = 'hidden'
    return () => {
      lockCount = Math.max(0, lockCount - 1)
      if (lockCount === 0) document.body.style.overflow = ''
    }
  }, [locked])
}
