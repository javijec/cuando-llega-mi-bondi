"use client";

import type { StopLineOption } from "@/lib/hooks/use-stop-line-options";

interface StopLineSelectorProps {
  options: StopLineOption[];
  activeOption: StopLineOption | null;
  selectedKeys: Set<string>;
  isLoading?: boolean;
  onSelect: (option: StopLineOption) => void;
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
      <div className="md:hidden">
        <details className="overflow-hidden rounded-3xl border border-border bg-muted/60">
          <summary className="flex items-center justify-between gap-3 px-4 py-3 text-sm font-bold text-foreground cursor-pointer">
            <span>
              {selectedKeys.size > 0
                ? `${selectedKeys.size} ${selectedKeys.size === 1 ? "línea seleccionada" : "líneas seleccionadas"}`
                : "Elige líneas para comparar"}
            </span>
            <span className="text-muted-foreground">▼</span>
          </summary>
          <div
            className="grid gap-2 p-3 max-h-72 overflow-y-auto"
            role="list"
            aria-label="Líneas disponibles en esta parada"
          >
            {options.map((option) => {
              const optionKey = getOptionKey(option);
              const isSelected = selectedKeys.has(optionKey);
              const isActive =
                activeOption && getOptionKey(activeOption) === optionKey;

              return (
                <button
                  key={optionKey}
                  type="button"
                  onClick={() => onSelect(option)}
                  className={`w-full rounded-2xl border px-3 py-2 text-left transition-all ${
                    isActive
                      ? "border-mdp-amarillo bg-mdp-amarillo text-foreground"
                      : isSelected
                        ? "border-mdp-turquesa bg-mdp-turquesa/15 text-foreground"
                        : "border-border bg-background text-foreground"
                  }`}
                  aria-pressed={isSelected}
                  aria-label={`${option.linea.Descripcion} ${option.parada.AbreviaturaBandera}${isSelected ? ", seleccionada" : ", no seleccionada"}`}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`mt-0.5 h-2.5 w-2.5 rounded-full border shrink-0 ${
                        isActive
                          ? "border-foreground bg-foreground"
                          : isSelected
                            ? "border-mdp-turquesa bg-mdp-turquesa"
                            : "border-muted-foreground/40"
                      }`}
                      aria-hidden="true"
                    />
                    <div>
                      <div className="text-sm font-black leading-none">
                        {option.linea.Descripcion}
                      </div>
                      <div className="mt-0.5 text-xs font-medium opacity-80">
                        {option.parada.AbreviaturaBandera}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </details>
      </div>

      <div
        className="hidden md:flex gap-2 overflow-x-auto pb-1 md:gap-2"
        role="list"
        aria-label="Líneas disponibles en esta parada"
      >
        {options.map((option) => {
          const optionKey = getOptionKey(option);
          const isSelected = selectedKeys.has(optionKey);
          const isActive =
            activeOption && getOptionKey(activeOption) === optionKey;

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
            </div>
          );
        })}
      </div>
    </div>
  );
}
