export default function Loading() {
  return (
    <div className="min-h-screen p-4 pb-16">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Left: Player + Info Skeleton */}
          <div className="flex-1 min-w-0">
            {/* Player Skeleton */}
            <div className="w-full aspect-video bg-surface-tertiary rounded-xl animate-pulse"></div>
            
            {/* Info Skeleton */}
            <div className="mt-4 space-y-4 animate-pulse">
              <div className="h-6 w-3/4 bg-surface-tertiary rounded"></div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-tertiary"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-surface-tertiary rounded"></div>
                    <div className="h-3 w-20 bg-surface-tertiary rounded"></div>
                  </div>
                  <div className="ml-4 h-9 w-24 bg-surface-tertiary rounded-full"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-9 w-28 bg-surface-tertiary rounded-full"></div>
                  <div className="h-9 w-20 bg-surface-tertiary rounded-full"></div>
                  <div className="h-9 w-9 bg-surface-tertiary rounded-full"></div>
                </div>
              </div>
              <div className="h-24 w-full bg-surface-tertiary rounded-xl"></div>
            </div>
          </div>

          {/* Right: Related Videos Skeleton */}
          <div className="xl:w-96 shrink-0 flex flex-col gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex gap-2 animate-pulse">
                <div className="w-40 aspect-video bg-surface-tertiary rounded-xl shrink-0"></div>
                <div className="flex flex-col gap-2 flex-1 pt-1">
                  <div className="h-4 bg-surface-tertiary rounded w-[90%]"></div>
                  <div className="h-3 bg-surface-tertiary rounded w-[60%]"></div>
                  <div className="h-3 bg-surface-tertiary rounded w-[40%] mt-2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
