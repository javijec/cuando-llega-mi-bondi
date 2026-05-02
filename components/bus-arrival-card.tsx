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
      className={`flex items-center gap-4 rounded-[1.5rem] border px-4 py-3 transition-all ${
        isUrgent
          ? "border-mdp-amarillo/60 bg-mdp-amarillo/8"
          : "border-border bg-card/70"
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
      aria-label={`${arribo.DescripcionCortaBandera || arribo.DescripcionBandera}, coche ${arribo.IdentificadorCoche}, llega en ${parsed.value} ${parsed.unit}${urgencyLabel}`}
    >
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
            Coche {arribo.IdentificadorCoche || "---"}
          </span>
          {isAdaptado && (
            <span
              title="Unidad adaptada para personas con movilidad reducida"
              className="inline-flex items-center gap-1 rounded-full bg-mdp-turquesa/10 px-2 py-1 text-[10px] font-bold text-mdp-turquesa"
            >
              <Accessibility className="w-3 h-3" aria-hidden="true" />
              Adaptado
            </span>
          )}
        </div>
        <h4 className="truncate text-sm font-black text-foreground">
          {arribo.DescripcionCortaBandera || arribo.DescripcionBandera}
        </h4>
        <p className="mt-2 flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
          <Clock className="h-3 w-3" aria-hidden="true" />
          <span>
            GPS {gpsTime}
            {arribo.DesvioHorario && arribo.DesvioHorario !== "00:00" && (
              <span
                className="ml-1 font-bold text-mdp-rosa"
                aria-label={`desvío de ${arribo.DesvioHorario}`}
              >
                ({arribo.DesvioHorario})
              </span>
            )}
          </span>
        </p>
      </div>

      <div className="shrink-0 rounded-2xl bg-background/70 px-3 py-2 text-right">
        {parsed.unit ? (
          <>
            <span
              className={`block font-black tabular-nums leading-none ${
                isVeryUrgent
                  ? "text-3xl text-red-500"
                  : "text-[2rem] text-mdp-amarillo"
              }`}
            >
              {parsed.value}
            </span>
            <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
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
