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
      className={`p-3 rounded-3xl flex items-center gap-4 border transition-all ${
        isUrgent
          ? "bg-mdp-amarillo/10 border-mdp-amarillo"
          : "bg-card border-border"
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
      aria-label={`${arribo.DescripcionCortaBandera || arribo.DescripcionBandera}, coche ${arribo.IdentificadorCoche}, llega en ${parsed.value} ${parsed.unit}${urgencyLabel}`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">
            Coche {arribo.IdentificadorCoche || "---"}
          </span>
          {isAdaptado && (
            <span
              title="Unidad adaptada para personas con movilidad reducida"
              className="inline-flex items-center gap-1 rounded-full bg-mdp-turquesa/10 px-2 py-1 text-[11px] font-bold text-mdp-turquesa"
            >
              <Accessibility className="w-3 h-3" aria-hidden="true" />
              Adaptado
            </span>
          )}
        </div>
        <h4 className="text-sm font-black text-foreground truncate">
          {arribo.DescripcionCortaBandera || arribo.DescripcionBandera}
        </h4>
        <p className="text-[11px] text-muted-foreground mt-2 font-medium flex items-center gap-1">
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

      <div className="shrink-0 flex flex-col items-end gap-1">
        {parsed.unit ? (
          <>
            <span
              className={`font-black tabular-nums leading-none ${
                isVeryUrgent
                  ? "text-4xl text-red-500"
                  : "text-3xl text-mdp-amarillo"
              }`}
            >
              {parsed.value}
            </span>
            <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-[0.25em]">
              {parsed.unit}
            </span>
          </>
        ) : (
          <span className="text-sm font-bold text-muted-foreground">
            {parsed.value}
          </span>
        )}
      </div>
    </article>
  );
}
