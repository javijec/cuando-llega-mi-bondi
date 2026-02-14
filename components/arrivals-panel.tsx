"use client";

import { useArribos, useRefreshArribos } from "@/lib/hooks/useBusQuery";
import { useFavoritoToggle } from "@/lib/hooks/useFavoritos";
import { BusArrivalCard } from "./bus-arrival-card";
import { Loader2, RefreshCw, Star, MapPin } from "lucide-react";
import type { Parada } from "@/lib/types/bus";

interface ArrivalsPanelProps {
  parada: Parada;
  codigoLinea: string;
  nombreLinea: string;
  calleNombre: string;
  interseccionNombre: string;
  onVerRecorrido: () => void;
}

export function ArrivalsPanel({
  parada,
  codigoLinea,
  nombreLinea,
  calleNombre,
  interseccionNombre,
  onVerRecorrido,
}: ArrivalsPanelProps) {
  const {
    data,
    isLoading,
    isFetching,
    error,
  } = useArribos(parada.Identificador, codigoLinea);

  const refreshArribos = useRefreshArribos();

  const { isFavorito, toggle, label } = useFavoritoToggle(
    parada.Identificador,
    codigoLinea,
    {
      nombreLinea,
      bandera: parada.AbreviaturaBandera,
      codigoParada: parada.Codigo,
      banderaCompleta: parada.AbreviaturaAmpliadaBandera,
      descripcionParada: parada.Descripcion,
      calle: calleNombre,
      interseccion: interseccionNombre,
    }
  );

  const arribos = data?.arribos || [];

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto mt-6 p-8 bg-card rounded-[2.5rem] border border-border shadow-2xl animate-in fade-in duration-500">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">
            Buscando unidades...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto mt-6 p-8 bg-card rounded-[2.5rem] border border-destructive/30 shadow-2xl animate-in fade-in duration-500">
        <p className="text-destructive text-sm text-center font-bold">
          Error al consultar arribos
        </p>
        <p className="text-muted-foreground text-xs text-center mt-2">
          {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto mt-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Arrival card container */}
      <div className="p-6 bg-card rounded-[2.5rem] border border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-2 mb-4">
          <h3 className="text-primary text-[10px] font-black uppercase tracking-widest">
            Unidades en camino
          </h3>
          <div className="flex items-center gap-3">
            {/* Refresh button */}
            <button
              type="button"
              onClick={() =>
                refreshArribos.mutate({
                  identificadorParada: parada.Identificador,
                  codigoLineaParada: codigoLinea,
                })
              }
              disabled={refreshArribos.isPending || isFetching}
              className="text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
              aria-label="Actualizar arribos"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`}
              />
            </button>
            {/* GPS indicator */}
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              GPS
            </span>
          </div>
        </div>

        {/* Parada info */}
        <div className="px-2 mb-4 flex items-start gap-2">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-muted-foreground text-xs">
            {parada.Descripcion}
          </p>
        </div>

        {/* Arrivals list */}
        {arribos.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm font-bold">
              Sin unidades en camino
            </p>
            <p className="text-muted-foreground/60 text-xs mt-1">
              Intenta de nuevo en unos minutos
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {arribos.map((arribo, index) => (
              <BusArrivalCard
                key={`${arribo.IdentificadorCoche}-${index}`}
                arribo={arribo}
                index={index}
              />
            ))}
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-border px-1">
          <button
            type="button"
            onClick={onVerRecorrido}
            className="text-[10px] text-primary uppercase font-bold hover:text-primary/80 transition-colors flex items-center gap-1"
          >
            Ver Recorrido
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={toggle}
            className="flex items-center gap-1.5 text-[10px] uppercase font-bold transition-colors group"
            aria-label={label}
          >
            <Star
              className={`w-4 h-4 transition-all ${
                isFavorito
                  ? "fill-primary text-primary"
                  : "text-muted-foreground group-hover:text-primary"
              }`}
            />
            <span
              className={
                isFavorito
                  ? "text-primary"
                  : "text-muted-foreground group-hover:text-primary"
              }
            >
              {isFavorito ? "Guardado" : "Guardar"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
