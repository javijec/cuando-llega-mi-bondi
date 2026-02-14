"use client";

import type { Arribo } from "@/lib/types/bus";
import { Accessibility } from "lucide-react";

interface BusArrivalCardProps {
  arribo: Arribo;
  index: number;
}

function parseArribo(arriboStr: string): { value: string; unit: string } {
  // Handle formats like "5 min. aprox.", "68 min. aprox.", "Sin información", etc.
  const match = arriboStr.match(/(\d+)\s*(min|seg)/i);
  if (match) {
    return { value: match[1], unit: match[2].toLowerCase() === "min" ? "min" : "seg" };
  }
  return { value: arriboStr, unit: "" };
}

function formatGpsTime(dateStr: string): string {
  // Format "05/02/2026 17:40:47" -> "17:40"
  const match = dateStr.match(/(\d{2}:\d{2}):\d{2}$/);
  return match ? match[1] : dateStr;
}

export function BusArrivalCard({ arribo, index }: BusArrivalCardProps) {
  const parsed = parseArribo(arribo.Arribo);
  const gpsTime = formatGpsTime(arribo.UltimaFechaHoraGPS);
  const isAdaptado = arribo.EsAdaptado === "True";

  return (
    <div
      className="bg-secondary/50 border border-border p-5 rounded-3xl flex justify-between items-center group transition-colors hover:border-primary/30"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="bg-primary text-primary-foreground text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
            Coche {arribo.IdentificadorCoche || "---"}
          </span>
          {isAdaptado && (
            <span className="text-primary" title="Unidad adaptada">
              <Accessibility className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
        <p className="text-foreground font-bold text-sm uppercase tracking-tight">
          {arribo.DescripcionBandera || arribo.DescripcionCortaBandera}
        </p>
        <p className="text-muted-foreground text-[10px] font-medium italic">
          GPS: {gpsTime}
          {arribo.DesvioHorario && arribo.DesvioHorario !== "00:00" && (
            <span className="ml-1.5 text-destructive">({arribo.DesvioHorario})</span>
          )}
        </p>
      </div>

      <div className="text-right">
        {parsed.unit ? (
          <>
            <span className="block text-2xl font-black text-primary leading-none">
              {parsed.value}
            </span>
            <span className="text-[9px] text-muted-foreground font-bold uppercase">
              {parsed.unit === "min" ? "Minutos" : "Segundos"}
            </span>
          </>
        ) : (
          <span className="text-sm font-bold text-muted-foreground">{parsed.value}</span>
        )}
      </div>
    </div>
  );
}
