export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="skeleton-shimmer h-56 w-full" />
      <div className="flex flex-col gap-3 p-5">
        <div className="skeleton-shimmer h-5 w-3/4" />
        <div className="flex gap-3">
          <div className="skeleton-shimmer h-4 w-20" />
          <div className="skeleton-shimmer h-4 w-14" />
          <div className="skeleton-shimmer h-4 w-24" />
        </div>
        <div className="skeleton-shimmer h-4 w-full" />
        <div className="skeleton-shimmer h-4 w-5/6" />
        <div className="flex items-center justify-between pt-1">
          <div className="skeleton-shimmer h-6 w-28" />
          <div className="skeleton-shimmer h-9 w-28 rounded-md" />
        </div>
      </div>
    </div>
  )
}

export function TicketSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <div className="skeleton-shimmer h-5 w-40" />
          <div className="skeleton-shimmer h-4 w-24" />
        </div>
        <div className="skeleton-shimmer h-6 w-20 rounded-full" />
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex justify-between">
          <div className="skeleton-shimmer h-4 w-28" />
          <div className="skeleton-shimmer h-4 w-24" />
        </div>
        <div className="flex justify-between">
          <div className="skeleton-shimmer h-4 w-20" />
          <div className="skeleton-shimmer h-4 w-32" />
        </div>
        <div className="skeleton-shimmer mt-2 h-10 w-full rounded-lg" />
      </div>
    </div>
  )
}

export function TransactionSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="skeleton-shimmer h-10 w-10 rounded-lg" />
        <div className="flex flex-col gap-2">
          <div className="skeleton-shimmer h-4 w-32" />
          <div className="skeleton-shimmer h-3 w-44" />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end gap-1">
          <div className="skeleton-shimmer h-3 w-14" />
          <div className="skeleton-shimmer h-4 w-24" />
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="skeleton-shimmer h-3 w-10" />
          <div className="skeleton-shimmer h-4 w-16" />
        </div>
      </div>
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div className="skeleton-shimmer h-10 w-10 rounded-lg" />
        <div className="skeleton-shimmer h-5 w-16 rounded-full" />
      </div>
      <div className="mt-3 flex flex-col gap-1.5">
        <div className="skeleton-shimmer h-7 w-32" />
        <div className="skeleton-shimmer h-4 w-24" />
      </div>
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex flex-col gap-2">
        <div className="skeleton-shimmer h-5 w-40" />
        <div className="skeleton-shimmer h-4 w-64" />
      </div>
      <div className="skeleton-shimmer h-[300px] w-full rounded-lg" />
    </div>
  )
}
