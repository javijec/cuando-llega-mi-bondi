"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

// Dynamic import para ArrivalsSheet - reduce el bundle inicial
// Este componente solo se carga cuando se necesita
const ArrivalsSheetDynamic = dynamic(
  () =>
    import("./arrivals-sheet").then((mod) => ({ default: mod.ArrivalsSheet })),
  {
    ssr: false,
    loading: () => (
      <div></div>
    ),
  },
);

// Re-exportar con el mismo interface para compatibilidad
type ArrivalsSheetProps = ComponentProps<typeof ArrivalsSheetDynamic>;

export function ArrivalsSheet(props: ArrivalsSheetProps) {
  return <ArrivalsSheetDynamic {...props} />;
}
