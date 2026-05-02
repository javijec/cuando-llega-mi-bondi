"use client";

import type { StopLineOption } from "@/lib/hooks/use-stop-line-options";

interface StopLineSelectorProps {
  options: StopLineOption[];
  activeOption: StopLineOption | null;
  selectedKeys: Set<string>;
  isLoading?: boolean;
  onSelect: (option: StopLineOption) => void;
  onRemove: (option: StopLineOption) => void;
}

function getOptionKey(option: StopLineOption): string {
  return `${option.linea.CodigoLineaParada}:${option.parada.Codigo}`;
}

export function StopLineSelector({
  options,
  activeOption,
  selectedKeys,
  isLoading = false,
  onSelect,
  onRemove,
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
      <p className="text-[11px] text-muted-foreground mb-3">
        Podés marcar varias líneas para comparar sus arribos al mismo tiempo.
      </p>
      <div
        className="flex gap-1.5 overflow-x-auto pb-1 md:gap-2"
        role="list"
        aria-label="Líneas disponibles en esta parada"
      >
        {options.map((option) => {
          const optionKey = getOptionKey(option);
          const isSelected = selectedKeys.has(getOptionKey(option));
          const isActive =
            activeOption &&
            getOptionKey(activeOption) === getOptionKey(option);

          return (
            <div
              key={optionKey}
              className={`shrink-0 rounded-full border transition-all ${
                isActive
                  ? "border-mdp-amarillo bg-mdp-amarillo text-foreground"
                  : isSelected
                    ? "border-mdp-turquesa bg-mdp-turquesa/15 text-foreground"
                    : "border-border bg-muted/60 text-foreground"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(option)}
                className="px-3 py-1.5 text-left cursor-pointer md:px-4 md:py-2"
                aria-pressed={isSelected}
                aria-label={`${option.linea.Descripcion} ${option.parada.AbreviaturaBandera}${isSelected ? ", seleccionada" : ", no seleccionada"}`}
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 h-2.5 w-2.5 rounded-full border shrink-0 md:h-3 md:w-3 ${
                      isActive
                        ? "border-foreground bg-foreground"
                        : isSelected
                          ? "border-mdp-turquesa bg-mdp-turquesa"
                          : "border-muted-foreground/40"
                    }`}
                    aria-hidden="true"
                  />
                  <div>
                    <div className="text-[13px] font-black leading-none md:text-sm">
                      {option.linea.Descripcion}
                    </div>
                    <div className="mt-0.5 text-[10px] font-medium opacity-80 md:mt-1 md:text-[11px]">
                      {option.parada.AbreviaturaBandera}
                    </div>
                  </div>
                </div>
              </button>

              {isSelected && options.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemove(option)}
                  className="w-full border-t border-black/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide cursor-pointer md:px-3 md:py-1.5 md:text-[10px]"
                  aria-label={`Quitar ${option.linea.Descripcion} de la comparación`}
                >
                  Quitar
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
