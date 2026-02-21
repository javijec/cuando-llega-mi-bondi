"use client";

import { memo } from "react";
import type { Favorito } from "@/lib/types/bus";
import { Trash2, MapPin, Loader2 } from "lucide-react";
import { useVisibleArribos } from "@/lib/hooks/useFavoritos";
import { cn } from "@/lib/utils";

interface FavoritoCardProps {
  favorito: Favorito;
  onEliminar: (id: string) => void;
  onConsultar: (favorito: Favorito) => void;
  autoRefresh?: boolean;
  index?: number;
  activationDelay?: number;
}

function parseArriboMinutes(arriboStr: string): number | null {
  const match = arriboStr.match(/(\d+)\s*(min|seg)/i);
  if (!match) return null;
  return match[2].toLowerCase() === "seg" ? 0 : parseInt(match[1]);
}

function formatArribo(arriboStr: string) {
  const match = arriboStr.match(/(\d+)\s*(min|seg)/i);
  if (!match) return arriboStr;
  const value = match[1];
  const unit = match[2].toLowerCase();
  return `${value} ${unit === "min" ? "min" : "seg"}`;
}

function getUrgencyColor(minutes: number | null) {
  if (minutes === null) return "text-mdp-amarillo";
  if (minutes <= 2) return "text-red-500";
  if (minutes <= 5) return "text-orange-400";
  return "text-mdp-amarillo";
}

export const FavoritoCard = memo(
  function FavoritoCard({
    favorito,
    onEliminar,
    onConsultar,
    autoRefresh = true,
    index = 0,
    activationDelay,
  }: FavoritoCardProps) {
    const {
      ref,
      isVisibleDebounced,
      hasBeenActivated,
      arribos,
      isLoading,
      isFetching,
      error,
    } = useVisibleArribos(favorito.identificadorParada, favorito.codigoLinea, {
      autoRefresh,
      activationDelay: activationDelay ?? index * 100,
      visibilityDebounce: 150,
    });

    const displayArribos = arribos?.arribos?.slice(0, 3) || [];
    const firstArribo = displayArribos[0];
    const firstMinutes = firstArribo
      ? parseArriboMinutes(firstArribo.Arribo)
      : null;

    return (
      <div
        ref={ref}
        className="
          rounded-2xl p-4
          bg-card border border-border
          shadow-sm
          active:scale-[0.98]
          transition-all duration-150
          w-full
        "
      >
        {/* HEADER */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-black uppercase">{favorito.nombreLinea}</h3>
            <span className="inline-block mt-1 px-2 py-0.5 bg-mdp-amarillo text-[#22436f] text-[10px] font-bold rounded-full uppercase">
              {favorito.bandera || favorito.banderaCompleta}
            </span>
          </div>

          <button
            onClick={() => onEliminar(favorito.id)}
            className="p-2 -m-2 text-muted-foreground hover:text-mdp-rosa transition-colors"
            aria-label="Eliminar favorito"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* UBICACIÓN */}
        <div className="flex items-start gap-2 mb-4 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">{favorito.calle}</p>
            <p className="text-xs opacity-70">e {favorito.interseccion}</p>
          </div>
        </div>

        {/* ESTADOS */}
        {!hasBeenActivated ? (
          <div className="text-center py-4 text-sm text-muted-foreground">
            Deslizá para activar actualizaciones
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-4 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-mdp-amarillo" />
            <p className="text-xs text-muted-foreground">Buscando próximas unidades...</p>
          </div>
        ) : error ? (
          <div className="py-3 text-sm text-mdp-rosa text-center">
            Error al cargar arribos
          </div>
        ) : displayArribos.length === 0 ? (
          <div className="text-center py-4 text-sm text-muted-foreground">
            <p>No hay unidades próximas</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Seguiremos actualizando automáticamente</p>
          </div>
        ) : (
          <>
            {/* PRIMER ARRIBO DESTACADO */}
            <div className="mb-3 p-4 rounded-2xl bg-mdp-amarillo/10 border border-mdp-amarillo/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Próximo</span>
                {isVisibleDebounced && (
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      isFetching ? "bg-mdp-amarillo animate-pulse" : "bg-green-400"
                    )}
                    aria-label={isFetching ? "Actualizando en vivo" : "Datos en vivo"}
                  />
                )}
              </div>
              <div className="flex items-end justify-between">
                <span className="text-sm font-medium truncate mr-2">
                  {firstArribo.DescripcionCortaBandera || firstArribo.DescripcionBandera}
                </span>
                <span className={cn("text-3xl font-black whitespace-nowrap transition-all", getUrgencyColor(firstMinutes))}>
                  {formatArribo(firstArribo.Arribo)}
                </span>
              </div>
            </div>

            {/* ARRIBOS SECUNDARIOS */}
            {displayArribos.slice(1).map((arribo, idx) => (
              <div key={`${arribo.IdentificadorCoche}-${idx}`} className="flex items-center justify-between py-2 text-sm">
                <span className="truncate mr-2 text-muted-foreground">
                  {arribo.DescripcionCortaBandera || arribo.DescripcionBandera}
                </span>
                <span className="font-bold text-mdp-amarillo">{formatArribo(arribo.Arribo)}</span>
              </div>
            ))}
          </>
        )}

        {/* CTA */}
        <button
          onClick={() => onConsultar(favorito)}
          className="
            w-full mt-4 py-2 rounded-xl bg-mdp-turquesa/10 text-mdp-turquesa font-semibold text-sm
            active:scale-[0.98] transition-all
          "
        >
          Ver todos los arribos
        </button>
      </div>
    );
  }
);