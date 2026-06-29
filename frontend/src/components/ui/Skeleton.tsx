import { cn } from '../../utils/cn'

/** Base shimmer block for loading states. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-neutral-200', className)} />
}
