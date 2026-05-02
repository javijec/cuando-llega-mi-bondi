export function NearbyStopsMapSkeleton() {
  return (
    <div className="absolute inset-0 animate-pulse bg-muted">
      <div className="absolute left-4 right-4 top-4 h-28 rounded-3xl bg-background/80" />
      <div className="absolute bottom-6 left-4 right-4 h-48 rounded-3xl bg-background/80 md:left-auto md:w-[360px]" />
    </div>
  )
}
