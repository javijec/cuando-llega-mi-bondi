"use client";

import { Suspense } from "react";
import { ConsultarView } from "./consultar-view";
import { CustomSelectSkeleton } from "./custom-select-skeleton";

function ConsultarSkeleton() {
  return (
    <div className="px-4 py-6 max-w-md mx-auto">
      <div className="space-y-4">
        <CustomSelectSkeleton label="Línea" />
        <CustomSelectSkeleton label="Calle" />
        <CustomSelectSkeleton label="Intersección" />
        <CustomSelectSkeleton label="Parada" />
      </div>

      <div className="w-full mt-6 py-5 rounded-2xl bg-muted animate-pulse" />
    </div>
  );
}

export function ConsultarViewWithSuspense() {
  return (
    <Suspense fallback={<ConsultarSkeleton />}>
      <ConsultarView />
    </Suspense>
  );
}
