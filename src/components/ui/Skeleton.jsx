import { cn } from '@/lib/utils'

/**
 * Static placeholder block. Deliberately not animated — a pulsing grid is one of
 * the effects this design explicitly rules out.
 */
export default function Skeleton({ className }) {
  return <div className={cn('rounded-[4px] bg-line/70', className)} aria-hidden="true" />
}

/** The portfolio card skeleton, matching ProjectCard's real dimensions. */
export function ProjectCardSkeleton() {
  return (
    <div className="border border-line bg-paper">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="flex flex-col gap-3 p-5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

/** The services list skeleton, matching the alternating rows on /servicii. */
export function ServiceRowSkeleton() {
  return (
    <div className="grid gap-8 border-t border-line pt-10 lg:grid-cols-2 lg:gap-16">
      <Skeleton className="aspect-3/2 w-full" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  )
}
