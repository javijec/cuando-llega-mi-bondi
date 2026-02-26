import { Suspense } from "react";
import { FavoritosView } from "./favoritos-view";

function FavoritosSkeleton() {
  return (
    <div className="px-4 py-6 max-w-md mx-auto">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-8 w-24 bg-muted animate-pulse rounded-xl" />
      </div>

      {/* Cards skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-border rounded-3xl p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-2">
                <div className="h-6 w-32 bg-muted animate-pulse rounded" />
                <div className="h-4 w-16 bg-muted animate-pulse rounded-full" />
              </div>
              <div className="h-8 w-8 bg-muted animate-pulse rounded" />
            </div>

            {/* Location */}
            <div className="mb-4 space-y-2">
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
              <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
            </div>

            {/* Arrivals */}
            <div className="border-t border-border pt-4 space-y-2">
              <div className="h-12 bg-muted animate-pulse rounded-2xl" />
              <div className="h-12 bg-muted animate-pulse rounded-2xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FavoritosViewWithSuspense() {
  return (
    <Suspense fallback={<FavoritosSkeleton />}>
      <FavoritosView />
    </Suspense>
  );
}
