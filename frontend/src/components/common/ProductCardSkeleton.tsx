import { Skeleton } from '../ui/Skeleton'

/** Borderless skeleton matching the new card: tall 3:4 image + two text lines. */
export function ProductCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[3/4] w-full rounded-lg" />
      <div className="mt-3 space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}
