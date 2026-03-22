export default function Loading() {
  return (
    <div className="min-h-screen pb-16 animate-pulse">
      {/* Cover Banner Skeleton */}
      <div className="h-40 sm:h-56 bg-surface-tertiary w-full" />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
        {/* Channel Info Header Skeleton */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 -mt-12 sm:-mt-16 mb-8 relative z-10">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-surface-primary bg-surface-tertiary shrink-0" />
          
          <div className="flex-1 text-center sm:text-left pt-2 sm:pt-16 space-y-3 w-full sm:w-auto flex flex-col items-center sm:items-start">
            <div className="h-8 bg-surface-tertiary rounded w-48" />
            <div className="h-4 bg-surface-tertiary rounded w-32" />
          </div>
          
          <div className="sm:pt-16 shrink-0">
            <div className="h-10 bg-surface-tertiary rounded-full w-32" />
          </div>
        </div>

        {/* Channel Content Nav Skeleton */}
        <div className="flex items-center gap-6 border-b border-border mb-6">
          <div className="h-10 w-16 bg-surface-tertiary rounded-t" />
          <div className="h-10 w-16 bg-surface-tertiary rounded-t" />
          <div className="h-10 w-20 bg-surface-tertiary rounded-t" />
        </div>

        {/* Video Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="w-full aspect-video bg-surface-tertiary rounded-xl" />
              <div className="flex flex-col gap-2 pt-1">
                <div className="h-4 bg-surface-tertiary rounded w-[90%]" />
                <div className="h-3 bg-surface-tertiary rounded w-[60%]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
