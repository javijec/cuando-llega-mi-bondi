"use client";

import { useMemo } from "react";
import { Loader2, MapPin, RefreshCw } from "lucide-react";
import { useMultiArribos } from "@/lib/hooks/useBusQuery";
import { useStopLineOptions } from "@/lib/hooks/use-stop-line-options";
import { useFavoritoToggle } from "@/lib/hooks/useFavoritos";
import { BusArrivalCard } from "./bus-arrival-card";
import { StopLineSelector } from "./stop-line-selector";
import type { Arribo, Calle, Interseccion, Linea, Parada } from "@/lib/types/bus";

interface ArrivalsInfo {
  linea?: Linea;
  calle?: Calle;
  interseccion?: Interseccion;
  parada?: Parada;
}

interface ArrivalsPanelProps {
  info: ArrivalsInfo;
}

function parseArrivalMinutes(arribo: string): number | null {
  const match = arribo.match(/(\d+)\s*min/i);

  if (match) {
    return Number(match[1]);
  }

  return /arrib/i.test(arribo) ? 0 : null;
}

export function ArrivalsPanel({ info }: ArrivalsPanelProps) {
  const { calle, interseccion } = info;
  const {
    activeOption,
    selectedOptions,
    selectedKeys,
    stopLineOptions,
    isLoadingStopLines,
    removeOption,
    selectOption,
  } = useStopLineOptions(info);

  const multiArribos = useMultiArribos(
    selectedOptions.map((option) => ({
      identificadorParada: option.parada.Identificador,
      codigoLineaParada: option.linea.CodigoLineaParada,
    })),
    {
      enabled: selectedOptions.length > 0,
    },
  );

  const sections = useMemo(() => {
    return selectedOptions
      .map((option, index) => {
        const result = multiArribos.results[index];
        const arribos = result?.data?.arribos ?? [];
        const nextArrival =
          arribos
            .map((arribo) => parseArrivalMinutes(arribo.Arribo))
            .find((value) => value !== null) ?? Number.POSITIVE_INFINITY;

        return {
          option,
          result,
          arribos,
          nextArrival,
        };
      })
      .sort((a, b) => {
        if (a.nextArrival !== b.nextArrival) {
          return a.nextArrival - b.nextArrival;
        }

        return a.option.linea.Descripcion.localeCompare(
          b.option.linea.Descripcion,
          "es",
        );
      });
  }, [multiArribos.results, selectedOptions]);

  const activeLinea = activeOption?.linea;
  const activeParada = activeOption?.parada;
  const totalArribos = sections.reduce(
    (total, section) => total + section.arribos.length,
    0,
  );

  const { isFavorito, toggle, label } = useFavoritoToggle(
    activeParada?.Identificador || "",
    activeLinea?.CodigoLineaParada || "",
    {
      nombreLinea: activeLinea?.Descripcion || "",
      bandera: activeParada?.AbreviaturaBandera || "",
      codigoParada: activeParada?.Codigo || "",
      banderaCompleta: activeParada?.AbreviaturaAmpliadaBandera || "",
      descripcionParada: activeParada?.Descripcion || "",
      calle: calle?.Descripcion || "",
      interseccion: interseccion?.Descripcion || "",
    },
  );

  async function handleRefresh(): Promise<void> {
    await Promise.all(
      sections.map((section) => section.result?.refetch?.()).filter(Boolean),
    );
  }

  if (!activeParada) {
    return null;
  }

  return (
    <div className="hidden md:block h-full">
      <div className="bg-card border border-border rounded-3xl p-6 h-full flex flex-col">
        <div className="border-b border-border pb-4 mb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight truncate">
                {selectedOptions.length === 1
                  ? activeLinea?.Descripcion
                  : `${selectedOptions.length} lineas en esta parada`}
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="px-3 py-1 bg-mdp-amarillo text-foreground text-xs font-black rounded-full uppercase tracking-wide">
                  {selectedOptions.length === 1
                    ? activeParada.AbreviaturaBandera
                    : "Comparando lineas"}
                </span>
                <span className="text-sm font-bold text-muted-foreground">
                  {totalArribos} {totalArribos === 1 ? "unidad" : "unidades"}
                </span>
              </div>
              <address className="flex items-center gap-2 mt-3 text-sm text-muted-foreground font-medium not-italic">
                <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
                <div className="flex flex-col">
                  <span className="text-[1rem] truncate">
                    {calle?.Descripcion.replace("- MAR DEL PLATA", "")}
                  </span>
                  <span className="text-[.8rem] opacity-50">
                    e/ {interseccion?.Descripcion.replace("- MAR DEL PLATA", "")}
                  </span>
                </div>
              </address>
            </div>
          </div>
        </div>

        <StopLineSelector
          options={stopLineOptions}
          activeOption={activeOption}
          selectedKeys={selectedKeys}
          isLoading={isLoadingStopLines}
          onSelect={selectOption}
          onRemove={removeOption}
        />

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Proximos arribos
          </h3>
          <button
            onClick={handleRefresh}
            disabled={multiArribos.isFetching}
            aria-label="Actualizar lista de arribos"
            aria-busy={multiArribos.isFetching}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted text-sm font-bold transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${multiArribos.isFetching ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            Actualizar
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4" aria-live="polite">
          {multiArribos.isLoading && (
            <div className="flex flex-col items-center justify-center py-12" role="status">
              <Loader2
                className="w-10 h-10 text-mdp-amarillo animate-spin"
                aria-hidden="true"
              />
              <p className="text-muted-foreground text-base font-bold mt-4">
                Cargando arribos...
              </p>
            </div>
          )}

          {!multiArribos.isLoading && sections.length === 0 && (
            <div className="text-center py-10" role="status">
              <MapPin
                className="w-14 h-14 mx-auto text-muted-foreground/40 mb-4"
                aria-hidden="true"
              />
              <p className="text-muted-foreground text-base font-bold">
                No hay lineas seleccionadas
              </p>
            </div>
          )}

          {!multiArribos.isLoading &&
            sections.map((section) => (
              <section
                key={`${section.option.linea.CodigoLineaParada}:${section.option.parada.Codigo}`}
                className="rounded-2xl border border-border bg-background/60 p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-black text-foreground">
                        {section.option.linea.Descripcion}
                      </h4>
                      <span className="rounded-full bg-mdp-amarillo px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-foreground">
                        {section.option.parada.AbreviaturaBandera}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                      {section.arribos.length}{" "}
                      {section.arribos.length === 1 ? "unidad en camino" : "unidades en camino"}
                    </p>
                  </div>
                </div>

                {section.result?.error && (
                  <div className="rounded-2xl bg-mdp-rosa/10 px-4 py-3 text-sm font-bold text-mdp-rosa">
                    No pudimos cargar los arribos de esta línea.
                  </div>
                )}

                {!section.result?.error && section.result?.isLoading && (
                  <div className="flex items-center gap-2 rounded-2xl bg-muted/40 px-4 py-3 text-sm font-bold text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Cargando esta línea...
                  </div>
                )}

                {!section.result?.error &&
                  !section.result?.isLoading &&
                  section.arribos.length === 0 && (
                    <div className="rounded-2xl bg-muted/40 px-4 py-3 text-sm font-bold text-muted-foreground">
                      No hay unidades en camino para esta línea.
                    </div>
                  )}

                {!section.result?.error &&
                  !section.result?.isLoading &&
                  section.arribos.length > 0 && (
                    <ul className="space-y-3" role="list">
                      {section.arribos.map((arribo, index) => (
                        <li key={`${section.option.linea.CodigoLineaParada}-${arribo.IdentificadorCoche}-${index}`}>
                          <BusArrivalCard arribo={arribo as Arribo} index={index} />
                        </li>
                      ))}
                    </ul>
                  )}
              </section>
            ))}
        </div>

        {selectedOptions.length === 1 && activeParada && activeLinea && (
          <div className="border-t border-border pt-4 mt-4">
            <button
              onClick={toggle}
              aria-label={
                isFavorito
                  ? `Quitar ${activeLinea.Descripcion} de favoritos`
                  : `Guardar ${activeLinea.Descripcion} en favoritos`
              }
              aria-pressed={isFavorito}
              className={`w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all active:scale-[0.98] cursor-pointer ${
                isFavorito ? "btn-mdp-amarillo" : "btn-mdp-turquesa"
              }`}
            >
              <span
                className={`w-5 h-5 ${isFavorito ? "text-foreground" : "text-white"}`}
                style={{ background: isFavorito ? "currentColor" : "none" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={isFavorito ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </span>
              {label}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
