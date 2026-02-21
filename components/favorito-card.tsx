"use client";

import { memo } from "react";
import type { Favorito } from "@/lib/types/bus";
import { Trash2, MapPin, Loader2, ChevronRight } from "lucide-react";
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

function getUrgencyLabel(minutes: number | null): string {
  if (minutes === null) return "";
  if (minutes <= 2) return " - llega muy pronto";
  if (minutes <= 5) return " - llega pronto";
  return "";
}

export const FavoritoCard = memo(function FavoritoCard({
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

  const displayArribos = arribos?.arribos?.slice(0, 2) || [];
  const firstArribo = displayArribos[0];
  const firstMinutes = firstArribo
    ? parseArriboMinutes(firstArribo.Arribo)
    : null;
  const cardId = `favorito-${favorito.id}`;
  const arriboId = `${cardId}-arribo`;

  return (
    <article
      ref={ref}
      className="bg-card rounded-2xl p-4 border border-border active:scale-[0.98] transition-all cursor-pointer"
      aria-labelledby={`${cardId}-title`}
    >
      <header className="flex items-start justify-between mb-3">
        <div className="min-w-0">
          <h3
            id={`${cardId}-title`}
            className="text-xl font-black text-foreground uppercase tracking-tight"
          >
            {favorito.nombreLinea}
          </h3>
          <span className="inline-block mt-1.5 px-3 py-1 bg-mdp-amarillo/20 text-foreground text-xs font-bold rounded-full uppercase tracking-wide">
            {favorito.bandera || favorito.banderaCompleta}
          </span>
        </div>
        <button
          onClick={() => onEliminar(favorito.id)}
          className="p-2 -m-2 text-muted-foreground hover:text-mdp-rosa active:scale-90 transition-all shrink-0 cursor-pointer"
          aria-label={`Eliminar favorito ${favorito.nombreLinea}`}
        >
          <Trash2 className="w-5 h-5" aria-hidden="true" />
        </button>
      </header>

      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-medium">
        <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span className="truncate">
          {favorito.calle} e {favorito.interseccion}
        </span>
      </div>

      <div id={arriboId} aria-live="polite" aria-atomic="true">
        {!hasBeenActivated ? (
          <p className="text-sm text-muted-foreground text-center py-4 font-medium">
            Deslizá para ver arribos
          </p>
        ) : isLoading ? (
          <div className="flex items-center justify-center gap-2 py-4">
            <Loader2
              className="w-5 h-5 animate-spin text-muted-foreground"
              aria-hidden="true"
            />
            <span className="text-sm text-muted-foreground font-medium">
              Cargando...
            </span>
          </div>
        ) : error ? (
          <p
            className="text-sm text-mdp-rosa text-center py-4 font-bold"
            role="alert"
          >
            Error al cargar los arribos
          </p>
        ) : displayArribos.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 font-medium">
            Sin unidades próximas
          </p>
        ) : (
          <div className="space-y-3">
            <div
              className="flex items-center justify-between p-4 rounded-xl bg-mdp-amarillo/10 border border-mdp-amarillo/30"
              aria-label={`Próximo arribo: ${formatArribo(firstArribo.Arribo)}${getUrgencyLabel(firstMinutes)}`}
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">
                  Próximo
                </span>
                {isVisibleDebounced && (
                  <span
                    className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
                    aria-label={
                      isFetching ? "Actualizando datos" : "Datos en vivo"
                    }
                  >
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full",
                        isFetching
                          ? "bg-mdp-amarillo animate-pulse"
                          : "bg-green-500",
                      )}
                      aria-hidden="true"
                    />
                    {isFetching ? "Actualizando" : "En vivo"}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-4xl font-black tabular-nums",
                  getUrgencyColor(firstMinutes),
                )}
                aria-label={formatArribo(firstArribo.Arribo)}
              >
                {formatArribo(firstArribo.Arribo)}
              </span>
            </div>
            {displayArribos[1] && (
              <div
                className="flex items-center justify-between px-4 py-3 bg-muted/30 rounded-xl"
                aria-label={`Siguiente arribo: ${formatArribo(displayArribos[1].Arribo)}`}
              >
                <span className="text-sm font-medium text-muted-foreground">
                  Siguiente
                </span>
                <span className="text-xl font-bold text-foreground tabular-nums">
                  {formatArribo(displayArribos[1].Arribo)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <button
        onClick={() => onConsultar(favorito)}
        className="w-full mt-4 py-3 rounded-xl bg-muted/50 text-foreground text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
        aria-label={`Ver todos los arribos de ${favorito.nombreLinea}`}
      >
        Ver todos los arribos
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
      </button>
    </article>
  );
});
