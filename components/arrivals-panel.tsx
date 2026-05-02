"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Loader2, MapPin, RefreshCw, Route } from "lucide-react";
import { ArrivalsRouteMap, ArrivalsRouteMapSkeleton } from "./arrivals-route-map-dynamic";
import { useMultiArribos, useMultiRecorridos } from "@/lib/hooks/useBusQuery";
import { useStopLineOptions } from "@/lib/hooks/use-stop-line-options";
import { useFavoritoToggle } from "@/lib/hooks/useFavoritos";
import { BusArrivalCard } from "./bus-arrival-card";
import { StopLineSelector } from "./stop-line-selector";
import type {
  Arribo,
  Calle,
  Interseccion,
  Linea,
  Parada,
} from "@/lib/types/bus";

interface ArrivalsInfo {
  linea?: Linea;
  calle?: Calle;
  interseccion?: Interseccion;
  parada?: Parada;
}

interface ArrivalsPanelProps {
  info: ArrivalsInfo;
}

function normalizeBranchLabel(value: string | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim().toLocaleLowerCase("es")
}

function getRouteBranchLabel(description: string): string {
  return description.split(";")[1]?.trim() ?? description
}

function getSectionKey(linea: Linea, parada: Parada): string {
  return `${linea.CodigoLineaParada}:${parada.Codigo}`
}

function parseArrivalMinutes(arribo: string): number | null {
  const match = arribo.match(/(\d+)\s*min/i);

  if (match) {
    return Number(match[1]);
  }

  return /arrib/i.test(arribo) ? 0 : null;
}

export function ArrivalsPanel({ info }: ArrivalsPanelProps) {
  const selectionKey = `${info.linea?.CodigoLineaParada ?? "none"}:${info.parada?.Codigo ?? "none"}`;

  return <ArrivalsPanelContent key={selectionKey} info={info} />;
}

function ArrivalsPanelContent({ info }: ArrivalsPanelProps) {
  const { calle, interseccion } = info;
  const [expandedMapKeys, setExpandedMapKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const {
    activeOption,
    selectedOptions,
    selectedKeys,
    stopLineOptions,
    isLoadingStopLines,
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
  const recorridoResults = useMultiRecorridos(
    selectedOptions.map((option) => ({
      codigoLinea: option.linea.CodigoLineaParada,
      isSublinea: 0,
    })),
    {
      enabled: selectedOptions.length > 0,
    },
  );

  const sections = useMemo(() => {
    return selectedOptions
      .map((option, index) => {
        const result = multiArribos.results[index];
        const recorridoResult = recorridoResults[index];
        const arribos = result?.data?.arribos ?? [];
        const nextArrival =
          arribos
            .map((arribo) => parseArrivalMinutes(arribo.Arribo))
            .find((value) => value !== null) ?? Number.POSITIVE_INFINITY;

        const puntosRecorrido =
          recorridoResult?.data?.puntos?.filter(
            (punto) =>
              punto.AbreviaturaBanderaSMP === option.parada.AbreviaturaBandera ||
              normalizeBranchLabel(getRouteBranchLabel(punto.Descripcion)) ===
                normalizeBranchLabel(option.parada.AbreviaturaBandera) ||
              normalizeBranchLabel(getRouteBranchLabel(punto.Descripcion)) ===
                normalizeBranchLabel(option.parada.AbreviaturaAmpliadaBandera),
          ) ?? [];

        return {
          option,
          result,
          recorridoResult,
          arribos,
          nextArrival,
          puntosRecorrido,
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
  }, [multiArribos.results, recorridoResults, selectedOptions]);

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

  function toggleMap(sectionKey: string): void {
    setExpandedMapKeys((currentKeys) => {
      const nextKeys = new Set(currentKeys)

      if (nextKeys.has(sectionKey)) {
        nextKeys.delete(sectionKey)
      } else {
        nextKeys.add(sectionKey)
      }

      return nextKeys
    })
  }

  if (!activeParada) {
    return null;
  }

  return (
    <div className="hidden md:block h-full">
      <div className="flex h-full flex-col rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <div className="mb-5 rounded-[1.75rem] border border-border/80 bg-[linear-gradient(135deg,rgba(20,184,166,0.12),transparent_50%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)] p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-mdp-turquesa">
                Llegadas en vivo
              </p>
              <h2 className="mt-2 text-3xl font-black text-foreground tracking-tight truncate">
                {selectedOptions.length === 1
                  ? activeLinea?.Descripcion
                  : `${selectedOptions.length} lineas en esta parada`}
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-mdp-amarillo px-3 py-1 text-xs font-black uppercase tracking-wide text-foreground">
                  {selectedOptions.length === 1
                    ? activeParada.AbreviaturaBandera
                    : "Comparando lineas"}
                </span>
                <span className="text-sm font-bold text-muted-foreground">
                  {totalArribos} {totalArribos === 1 ? "unidad" : "unidades"}
                </span>
              </div>
              <address className="mt-4 flex items-center gap-2 text-sm font-medium not-italic text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                <div className="flex flex-col">
                  <span className="truncate text-[1rem] text-foreground">
                    {calle?.Descripcion.replace("- MAR DEL PLATA", "")}
                  </span>
                  <span className="text-[.8rem] opacity-70">
                    e/{" "}
                    {interseccion?.Descripcion.replace("- MAR DEL PLATA", "")}
                  </span>
                </div>
              </address>
            </div>
            <div className="grid shrink-0 gap-2 text-right">
              <div className="rounded-2xl border border-border/70 bg-background/70 px-3 py-2">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                  Lineas
                </p>
                <p className="mt-1 text-xl font-black text-foreground">
                  {selectedOptions.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-5 rounded-[1.5rem] border border-border bg-background/60 p-4">
          <StopLineSelector
            options={stopLineOptions}
            activeOption={activeOption}
            selectedKeys={selectedKeys}
            isLoading={isLoadingStopLines}
            onSelect={selectOption}
          />
        </div>

        <div className="flex-1 overflow-y-auto" aria-live="polite">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Proximos arribos
              </h3>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                Ordenados por la llegada más próxima.
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={multiArribos.isFetching}
              aria-label="Actualizar lista de arribos"
              aria-busy={multiArribos.isFetching}
              className="flex items-center gap-2 rounded-xl bg-muted px-4 py-2.5 text-sm font-bold transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${multiArribos.isFetching ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              Actualizar
            </button>
          </div>

          {multiArribos.isLoading && (
            <div
              className="flex flex-col items-center justify-center py-12"
              role="status"
            >
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

          {!multiArribos.isLoading && (
            <div className="grid gap-4 lg:grid-cols-2">
              {sections.map((section) => (
                <section
                  key={getSectionKey(section.option.linea, section.option.parada)}
                  className="rounded-[1.75rem] border border-border bg-background/70 p-4 shadow-sm"
                >
                  {(() => {
                    const sectionKey = getSectionKey(
                      section.option.linea,
                      section.option.parada,
                    )
                    const isMapExpanded = expandedMapKeys.has(sectionKey)

                    return (
                      <>
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="truncate text-lg font-black text-foreground">
                          {section.option.linea.Descripcion}
                        </h4>
                        <span className="rounded-full bg-mdp-amarillo/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-mdp-amarillo">
                          {section.option.parada.AbreviaturaBandera}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-medium text-muted-foreground truncate">
                        {section.arribos.length}{" "}
                        {section.arribos.length === 1
                          ? "unidad en camino"
                          : "unidades en camino"}
                      </p>
                    </div>
                    {section.nextArrival !== Number.POSITIVE_INFINITY && (
                      <div className="rounded-2xl bg-background/80 px-3 py-2 text-right">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                          Proximo
                        </p>
                        <p className="mt-1 text-lg font-black text-foreground">
                          {section.nextArrival === 0
                            ? "Ahora"
                            : `${section.nextArrival} min`}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card/60 px-3 py-2.5">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Route className="h-4 w-4" aria-hidden="true" />
                      <span>Mapa del recorrido de esta línea</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleMap(sectionKey)}
                      className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-sm font-bold text-foreground transition-all active:scale-95"
                      aria-expanded={isMapExpanded}
                    >
                      {isMapExpanded ? "Ocultar mapa" : "Ver mapa"}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${isMapExpanded ? "rotate-180" : ""}`}
                        aria-hidden="true"
                      />
                    </button>
                  </div>

                  {isMapExpanded && (
                    <div className="mb-4">
                      {section.recorridoResult?.isLoading ? (
                        <ArrivalsRouteMapSkeleton />
                      ) : (
                        <ArrivalsRouteMap
                          puntos={section.puntosRecorrido}
                          arribos={section.arribos}
                          parada={{
                            latitud: section.option.parada.LatitudParada ?? null,
                            longitud: section.option.parada.LongitudParada ?? null,
                            bandera: section.option.parada.AbreviaturaBandera ?? "",
                          }}
                        />
                      )}
                    </div>
                  )}

                  {section.result?.error && (
                    <div className="rounded-2xl bg-mdp-rosa/10 px-4 py-3 text-sm font-bold text-mdp-rosa">
                      No pudimos cargar los arribos de esta línea.
                    </div>
                  )}

                  {!section.result?.error && section.result?.isLoading && (
                    <div className="flex items-center gap-2 rounded-2xl bg-muted/40 px-4 py-3 text-sm font-bold text-muted-foreground">
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
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
                      <ul className="space-y-2.5" role="list">
                        {section.arribos.map((arribo, index) => (
                          <li
                            key={`${section.option.linea.CodigoLineaParada}-${arribo.IdentificadorCoche}-${index}`}
                          >
                            <BusArrivalCard
                              arribo={arribo as Arribo}
                              index={index}
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                      </>
                    )
                  })()}
                </section>
              ))}
            </div>
          )}
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
