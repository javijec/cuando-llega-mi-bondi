export function RecorridosViewSkeleton() {
  return (
    <section className="flex flex-col h-[calc(100vh-80px)] max-w-md mx-auto px-4 py-4">
      {/* Header skeleton */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-muted rounded animate-pulse" />
          <div className="h-8 w-40 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-4 w-48 bg-muted rounded animate-pulse" />
      </div>

      {/* Select skeleton */}
      <div className="bg-muted rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-muted-foreground/20 rounded-full animate-pulse" />
          <div className="flex-1">
            <div className="h-3 w-16 bg-muted-foreground/20 rounded mb-2 animate-pulse" />
            <div className="h-6 w-32 bg-muted-foreground/20 rounded animate-pulse" />
          </div>
          <div className="w-5 h-5 bg-muted-foreground/20 rounded animate-pulse" />
        </div>
      </div>

      {/* Map skeleton */}
      <div className="flex-1 bg-muted rounded-xl animate-pulse min-h-[400px]" />
    </section>
  );
}
