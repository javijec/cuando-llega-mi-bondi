"use client";

import { memo } from "react";
import type { Favorito } from "@/lib/types/bus";
import { Trash2, MapPin, Loader2, Clock } from "lucide-react";
import { useVisibleArribos } from "@/lib/hooks/useFavoritos";

interface FavoritoCardProps {
  favorito: Favorito;
  onEliminar: (id: string) => void;
  onConsultar: (favorito: Favorito) => void;
  autoRefresh?: boolean;
  index?: number;
  activationDelay?: number;
}

function parseArribo(arriboStr: string): string {
  const match = arriboStr.match(/(\d+)\s*(min|seg)/i);
  if (match) {
    return `${match[1]} ${match[2].toLowerCase() === "min" ? "min" : "seg"}`;
  }
  return arriboStr;
}

/**
 * 🎯 Card de favorito FIXED con control de enabled
 *
 * CAMBIO CLAVE:
 * - enabled se usa para controlar completamente la query
 * - Cuando sale del viewport → enabled = false → NO polling
 * - Debug panel muestra el estado de enabled claramente
 */
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
      isVisible,
      isVisibleDebounced,
      isActivated,
      hasBeenActivated,
      arribos,
      isLoading,
      isFetching,
      error,
      _debug,
    } = useVisibleArribos(favorito.identificadorParada, favorito.codigoLinea, {
      autoRefresh,
      activationDelay: activationDelay ?? index * 100,
      visibilityDebounce: 150,
    });

    const displayArribos = arribos?.arribos?.slice(0, 3) || [];

    return (
      <div
        ref={ref}
        className="bg-card border border-border rounded-3xl p-6 hover:border-primary/30 transition-all group relative"
      >
        {/* 🐛 Debug info mejorado */}
        {process.env.NODE_ENV === "development" && _debug && (
          <div className="absolute top-2 right-2 text-[8px] bg-black/90 text-white px-2 py-1 rounded font-mono z-10">
            <div className="flex flex-col gap-0.5">
              {/* Estados de visibilidad */}
              <div>
                V:{isVisible ? "👁️" : "💤"} | D:{isVisibleDebounced ? "✓" : "✗"}{" "}
                | A:{isActivated ? "🚀" : "⏳"}
              </div>
              {/* Estado de la query */}
              <div className="border-t border-white/20 pt-0.5 mt-0.5">
                <span
                  className={
                    _debug.queryEnabled ? "text-green-400" : "text-red-400"
                  }
                >
                  Q:{_debug.queryEnabled ? "ON" : "OFF"}
                </span>{" "}
                | F:{isFetching ? "🔄" : "💤"}
              </div>
              {/* Explicación */}
              {!_debug.queryEnabled && hasBeenActivated && (
                <div className="text-yellow-300 text-[7px] mt-0.5">
                  ⚠️ Query paused (not visible)
                </div>
              )}
              {_debug.queryEnabled && isFetching && (
                <div className="text-blue-300 text-[7px] mt-0.5">
                  ⚡ Fetching data...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-black text-foreground uppercase">
              {favorito.nombreLinea}
            </h3>
            <span className="inline-block mt-1 px-2 py-0.5 bg-primary text-primary-foreground text-[9px] font-black rounded-full uppercase">
              {favorito.bandera || favorito.banderaCompleta}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onEliminar(favorito.id)}
            className="text-muted-foreground hover:text-destructive transition-colors p-1"
            aria-label="Eliminar favorito"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Location info */}
        <div className="mb-4 space-y-1">
          <div className="flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground font-medium">
              {favorito.calle}
            </p>
          </div>
          <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wide ml-5">
            {"e "}
            {favorito.interseccion}
          </p>
        </div>

        {/* Arrivals */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              Proximos arribos
            </p>
            {/* Indicador de actualización - SOLO si está visible */}
            {isFetching && !isLoading && isVisibleDebounced && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[8px] text-primary">Actualizando</span>
              </div>
            )}
          </div>

          {/* Estados de la card */}
          {!hasBeenActivated ? (
            // Estado 1: Nunca se activó
            <div className="flex items-center justify-center py-4">
              <p className="text-xs text-muted-foreground/60">
                {!isVisible ? "📜 Scroll para cargar" : "⏳ Preparando..."}
              </p>
            </div>
          ) : isLoading ? (
            // Estado 2: Cargando por primera vez
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            </div>
          ) : error ? (
            // Estado 3: Error
            <div className="py-2">
              <p className="text-destructive text-xs mb-1">
                Error al cargar arribos
              </p>
              <button
                onClick={() => window.location.reload()}
                className="text-[10px] text-muted-foreground hover:text-foreground"
              >
                Reintentar
              </button>
            </div>
          ) : displayArribos.length === 0 ? (
            // Estado 4: Sin arribos
            <div className="py-2">
              <p className="text-muted-foreground text-xs">
                Sin unidades en camino
              </p>
              {/* Mostrar si los datos están en caché pero la query está pausada */}
              {!isVisibleDebounced && arribos && (
                <p className="text-[10px] text-muted-foreground/60 mt-1">
                  💾 Datos en caché (query pausada)
                </p>
              )}
            </div>
          ) : (
            // Estado 5: Con arribos
            <div className="space-y-2">
              {displayArribos.map((arribo, idx) => (
                <div
                  key={`${arribo.IdentificadorCoche}-${idx}`}
                  className="flex items-center justify-between p-3 bg-secondary/50 rounded-2xl"
                >
                  <span className="text-sm text-foreground font-medium truncate mr-2">
                    {arribo.DescripcionCortaBandera ||
                      arribo.DescripcionBandera}
                  </span>
                  <span className="text-lg font-black text-primary whitespace-nowrap">
                    {parseArribo(arribo.Arribo)}
                  </span>
                </div>
              ))}

              {/* Indicador de datos en caché */}
              {!isVisibleDebounced && arribos && (
                <div className="text-[10px] text-muted-foreground/60 text-center pt-2">
                  💾 Datos en caché • Polling pausado
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => onConsultar(favorito)}
            className="text-[10px] text-primary hover:text-primary/80 uppercase font-bold transition-colors flex items-center gap-1"
          >
            Ver todos los arribos
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
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.favorito.id === nextProps.favorito.id &&
      prevProps.index === nextProps.index &&
      prevProps.autoRefresh === nextProps.autoRefresh &&
      prevProps.activationDelay === nextProps.activationDelay
    );
  },
);
