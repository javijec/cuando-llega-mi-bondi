"use client";

import type { Arribo } from "@/lib/types/bus";
import { Accessibility, Clock } from "lucide-react";

interface BusArrivalCardProps {
  arribo: Arribo;
  index: number;
}

function parseArribo(arriboStr: string): { value: string; unit: string } {
  const match = arriboStr.match(/(\d+)\s*(min|seg)/i);
  if (match) {
    return {
      value: match[1],
      unit: match[2].toLowerCase() === "min" ? "min" : "seg",
    };
  }
  return { value: arriboStr, unit: "" };
}

function formatGpsTime(dateStr: string): string {
  const match = dateStr.match(/(\d{2}:\d{2}):\d{2}$/);
  return match ? match[1] : dateStr;
}

export function BusArrivalCard({ arribo, index }: BusArrivalCardProps) {
  const parsed = parseArribo(arribo.Arribo);
  const gpsTime = formatGpsTime(arribo.UltimaFechaHoraGPS);
  const isAdaptado = arribo.EsAdaptado === "True";
  const minutes = parsed.unit ? parseInt(parsed.value) : null;
  const isUrgent = minutes !== null && minutes <= 5;
  const isVeryUrgent = minutes !== null && minutes <= 2;

  const urgencyLabel = isVeryUrgent
    ? " - llega muy pronto"
    : isUrgent
      ? " - llega pronto"
      : "";

  return (
    <article
      className={`p-4 rounded-2xl flex justify-between items-center transition-all ${
        isUrgent
          ? "bg-mdp-amarillo/15 border-2 border-mdp-amarillo"
          : "bg-card border border-border"
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
      aria-label={`${arribo.DescripcionCortaBandera || arribo.DescripcionBandera}, coche ${arribo.IdentificadorCoche}, llega en ${parsed.value} ${parsed.unit}${urgencyLabel}`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
            Coche {arribo.IdentificadorCoche || "---"}
          </span>
          {isAdaptado && (
            <span
              title="Unidad adaptada para personas con movilidad reducida"
              className="inline-flex items-center gap-1 text-xs text-mdp-turquesa font-bold"
            >
              <Accessibility className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="sr-only">Unidad adaptada</span>
              Adaptado
            </span>
          )}
        </div>
        <h4 className="text-base font-bold text-foreground truncate">
          {arribo.DescripcionCortaBandera || arribo.DescripcionBandera}
        </h4>
        <p className="text-xs text-muted-foreground mt-1 font-medium flex items-center gap-1">
          <Clock className="w-3 h-3" aria-hidden="true" />
          <span>
            GPS {gpsTime}
            {arribo.DesvioHorario && arribo.DesvioHorario !== "00:00" && (
              <span
                className="text-mdp-rosa ml-1 font-bold"
                aria-label={`desvío de ${arribo.DesvioHorario}`}
              >
                ({arribo.DesvioHorario})
              </span>
            )}
          </span>
        </p>
      </div>

      <div
        className={`text-right shrink-0 ml-4 pl-4 ${
          isVeryUrgent ? "border-l-2 border-red-400" : "border-l border-border"
        }`}
        aria-hidden="true"
      >
        {parsed.unit ? (
          <div className="flex flex-col items-end">
            <span
              className={`font-black tabular-nums leading-none ${
                isVeryUrgent
                  ? "text-4xl text-red-500"
                  : "text-3xl text-mdp-amarillo"
              }`}
            >
              {parsed.value}
            </span>
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wide mt-0.5">
              {parsed.unit}
            </span>
          </div>
        ) : (
          <span className="text-base font-bold text-muted-foreground">
            {parsed.value}
          </span>
        )}
      </div>
    </article>
  );
}
