"use client";

import { useState, useRef } from "react";
import { MapPin } from "lucide-react";
import { RouteMap, RouteMapSkeleton } from "./route-map-dynamic";
import { LineSearchDropdown } from "./line-search-dropdown";
import { BranchPills, BranchPillsSkeleton } from "./branch-pills";
import { useRecorridos, type Bandera } from "@/lib/hooks/use-recorridos";
import type { Linea } from "@/lib/types/bus";

interface RecorridosViewProps {
  lineas: Linea[];
}

export function RecorridosView({ lineas }: RecorridosViewProps) {
  const [lineaSeleccionada, setLineaSeleccionada] = useState<string | null>(
    null,
  );
  const [banderaSeleccionada, setBanderaSeleccionada] = useState<string | null>(
    null,
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    lineaInfo,
    banderasDisponibles,
    banderaEfectiva,
    puntosFiltrados,
    isLoading,
  } = useRecorridos(lineas, lineaSeleccionada, banderaSeleccionada);

  const handleLineaChange = (value: string) => {
    setLineaSeleccionada(value || null);
    setBanderaSeleccionada(null);
  };

  const handleBanderaChange = (branch: Bandera) => {
    setBanderaSeleccionada(branch.codigo);
  };


  const statusMessage = isLoading.recorrido
    ? "Cargando recorrido…"
    : lineaInfo
      ? `Mostrando recorrido de línea ${lineaInfo.CodigoLineaParada}: ${lineaInfo.Descripcion}${banderaEfectiva ? `, ramal ${banderaEfectiva.descripcion}` : ""}.`
      : "Ninguna línea seleccionada. Usá el buscador para elegir una línea y ver su recorrido en el mapa.";

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      role="region"
      aria-label="Mapa de recorridos de colectivos"
    >
      {isLoading.recorrido ? (
        <RouteMapSkeleton />
      ) : (
        <RouteMap
          puntos={puntosFiltrados}
          color="#1d7570"
          aria-label={
            lineaInfo
              ? `Mapa mostrando recorrido de línea ${lineaInfo.CodigoLineaParada}`
              : "Mapa de recorridos"
          }
        />
      )}

      <div
        className="absolute inset-0 z-10 pointer-events-none dark:hidden"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, transparent 30%, transparent 65%, rgba(0,0,0,0.22) 100%)",
        }}
      />

      <div
        className="absolute inset-0 z-10 pointer-events-none hidden dark:block"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 30%, transparent 65%, rgba(0,0,0,0.4) 100%)",
        }}
      />

      <p
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {statusMessage}
      </p>

      <div
        ref={dropdownRef}
        className="absolute top-4 left-4 right-4 z-20 pt-[env(safe-area-inset-top)] space-y-3 recorridos-top-controls"
        role="group"
        aria-label="Selección de línea y ramal"
      >
        <LineSearchDropdown
          lineas={lineas}
          selectedLinea={lineaSeleccionada}
          onSelectLinea={handleLineaChange}
          placeholder="Buscar línea…"
          aria-label="Buscar y seleccionar línea de colectivo"
        />

        {lineaSeleccionada && !isLoading.recorrido && (
          <BranchPills
            branches={banderasDisponibles}
            selectedBranch={banderaEfectiva}
            onSelectBranch={handleBanderaChange}
            aria-label="Seleccionar ramal"
          />
        )}

        {lineaSeleccionada && isLoading.recorrido && <BranchPillsSkeleton />}

      </div>

      {!lineaSeleccionada && (
        <div
          className="absolute bottom-6 left-4 right-4 z-20"
          aria-hidden="true"
        >
          <p className="text-center text-xs text-white dark:text-white/80 pb-1 select-none drop-shadow-sm">
            <MapPin
              className="inline w-3 h-3 mr-1 opacity-80"
              aria-hidden="true"
            />
            Elegí una línea para ver su recorrido en el mapa
          </p>
        </div>
      )}
    </div>
  );
}
