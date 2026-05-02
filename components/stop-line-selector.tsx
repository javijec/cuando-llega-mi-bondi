"use client";

import type { StopLineOption } from "@/lib/hooks/use-stop-line-options";

interface StopLineSelectorProps {
  options: StopLineOption[];
  activeOption: StopLineOption | null;
  isLoading?: boolean;
  onSelect: (option: StopLineOption) => void;
}

function getOptionKey(option: StopLineOption): string {
  return `${option.linea.CodigoLineaParada}:${option.parada.Codigo}`;
}

export function StopLineSelector({
  options,
  activeOption,
  isLoading = false,
  onSelect,
}: StopLineSelectorProps) {
  if (isLoading) {
    return (
      <div className="mb-4" aria-live="polite" aria-busy="true">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
          Buscando otras líneas en esta parada
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-10 w-28 shrink-0 rounded-full bg-muted animate-pulse"
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    );
  }

  if (options.length <= 1) {
    return null;
  }

  return (
    <div className="mb-4">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
        También pasan por esta parada
      </p>
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        role="list"
        aria-label="Líneas disponibles en esta parada"
      >
        {options.map((option) => {
          const isActive =
            activeOption &&
            getOptionKey(activeOption) === getOptionKey(option);

          return (
            <button
              key={getOptionKey(option)}
              type="button"
              onClick={() => onSelect(option)}
              className={`shrink-0 rounded-full border px-4 py-2 text-left transition-all cursor-pointer ${
                isActive
                  ? "border-mdp-amarillo bg-mdp-amarillo text-foreground"
                  : "border-border bg-muted/60 text-foreground"
              }`}
              aria-pressed={isActive}
            >
              <div className="text-sm font-black leading-none">
                {option.linea.Descripcion}
              </div>
              <div className="text-[11px] font-medium opacity-80 mt-1">
                {option.parada.AbreviaturaBandera}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
