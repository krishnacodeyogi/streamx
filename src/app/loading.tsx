export default function Loading() {
  return (
    <div className="p-4">
      {/* Category filter skeleton */}
      <div className="flex gap-2 py-3 mb-1 border-b border-border overflow-hidden">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-8 w-20 rounded-lg bg-surface-tertiary animate-pulse shrink-0" />
        ))}
      </div>

      {/* Video grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 p-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-video rounded-xl bg-surface-tertiary mb-3" />
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-surface-tertiary shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-surface-tertiary rounded w-full" />
                <div className="h-3.5 bg-surface-tertiary rounded w-4/5" />
                <div className="h-3 bg-surface-tertiary rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
