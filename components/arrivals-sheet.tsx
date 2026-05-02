"use client";

import { useMemo, useRef } from "react";
import { FocusScope } from "react-aria";
import { Sheet, type SheetRef } from "react-modal-sheet";
import { Loader2, MapPin, RefreshCw, Star, X } from "lucide-react";
import { ArrivalsRouteMap, ArrivalsRouteMapSkeleton } from "./arrivals-route-map-dynamic";
import { useFavoritoToggle } from "@/lib/hooks/useFavoritos";
import { useMultiArribos, useRecorrido } from "@/lib/hooks/useBusQuery";
import { useStopLineOptions } from "@/lib/hooks/use-stop-line-options";
import { BusArrivalCard } from "./bus-arrival-card";
import { StopLineSelector } from "./stop-line-selector";
import type { Calle, Interseccion, Linea, Parada } from "@/lib/types/bus";

const SNAP_POINTS = [0, 0.5, 1];

interface ArrivalsInfo {
  linea?: Linea;
  calle?: Calle;
  interseccion?: Interseccion;
  parada?: Parada;
}

interface ArrivalsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  info: ArrivalsInfo;
}

function normalizeBranchLabel(value: string | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim().toLocaleLowerCase("es")
}

function getRouteBranchLabel(description: string): string {
  return description.split(";")[1]?.trim() ?? description
}

function parseArrivalMinutes(arribo: string): number | null {
  const match = arribo.match(/(\d+)\s*min/i);

  if (match) {
    return Number(match[1]);
  }

  return /arrib/i.test(arribo) ? 0 : null;
}

export function ArrivalsSheet({ isOpen, onClose, info }: ArrivalsSheetProps) {
  const selectionKey = `${info.linea?.CodigoLineaParada ?? "none"}:${info.parada?.Codigo ?? "none"}`;

  return (
    <ArrivalsSheetContent
      key={selectionKey}
      isOpen={isOpen}
      onClose={onClose}
      info={info}
    />
  );
}

function ArrivalsSheetContent({ isOpen, onClose, info }: ArrivalsSheetProps) {
  const sheetRef = useRef<SheetRef>(null);
  const { calle, interseccion } = info;
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
      enabled: isOpen && selectedOptions.length > 0,
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
  const activeSection = sections.find(
    (section) =>
      section.option.linea.CodigoLineaParada === activeLinea?.CodigoLineaParada &&
      section.option.parada.Codigo === activeParada?.Codigo,
  ) ?? sections[0] ?? null
  const totalArribos = sections.reduce(
    (total, section) => total + section.arribos.length,
    0,
  );
  const recorridoQuery = useRecorrido(activeLinea?.CodigoLineaParada || "", 0)
  const puntosRecorrido = !activeParada?.AbreviaturaBandera
    ? []
    : (recorridoQuery.data?.puntos ?? []).filter(
        (punto) =>
          punto.AbreviaturaBanderaSMP === activeParada.AbreviaturaBandera ||
          normalizeBranchLabel(getRouteBranchLabel(punto.Descripcion)) ===
            normalizeBranchLabel(activeParada.AbreviaturaBandera) ||
          normalizeBranchLabel(getRouteBranchLabel(punto.Descripcion)) ===
            normalizeBranchLabel(activeParada.AbreviaturaAmpliadaBandera),
      )

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

  return (
    <Sheet
      ref={sheetRef}
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={SNAP_POINTS}
      initialSnap={2}
      tweenConfig={{ ease: [0.32, 0.72, 0, 1] as const, duration: 0 }}
      dragVelocityThreshold={1500}
      dragCloseThreshold={0.8}
      avoidKeyboard={true}
    >
      <Sheet.Container
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        aria-describedby="sheet-description"
        className="rounded-t-[2rem]! bg-background! border-t! border-border! shadow-2xl!"
      >
        <FocusScope contain restoreFocus>
          <Sheet.Header>
            <div className="border-b border-border/80 bg-[linear-gradient(135deg,rgba(20,184,166,0.12),transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)] px-5 pt-4 pb-4">
              <div className="flex justify-center mb-3">
                <Sheet.DragIndicator aria-hidden="true" />
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-mdp-turquesa">
                    Llegadas en vivo
                  </p>
                  <h2
                    id="sheet-title"
                    className="mt-2 text-2xl font-black text-foreground uppercase tracking-tight truncate"
                  >
                    {selectedOptions.length === 1
                      ? activeLinea?.Descripcion
                      : `${selectedOptions.length} lineas en esta parada`}
                  </h2>
                  <p id="sheet-description" className="sr-only">
                    Información de arribos para la parada {calle?.Descripcion} e{" "}
                    {interseccion?.Descripcion}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-mdp-amarillo px-3 py-1 text-xs font-black uppercase tracking-wide text-primary-foreground">
                      {selectedOptions.length === 1
                        ? activeParada?.AbreviaturaBandera
                        : "Comparando lineas"}
                    </span>
                    <span className="text-sm font-bold text-muted-foreground">
                      {totalArribos}{" "}
                      {totalArribos === 1 ? "unidad" : "unidades"}
                    </span>
                  </div>
                  <address className="mt-4 flex items-center gap-2 text-sm font-medium not-italic text-muted-foreground">
                    <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <div className="flex flex-col">
                      <span className="truncate text-[1rem] text-foreground">
                        {calle?.Descripcion.replace("- MAR DEL PLATA", "")}
                      </span>
                      <span className="text-[.8rem] opacity-70">
                        e/{" "}
                        {interseccion?.Descripcion.replace(
                          "- MAR DEL PLATA",
                          "",
                        )}
                      </span>
                    </div>
                  </address>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Cerrar panel de arribos"
                  className="p-2 rounded-full bg-muted hover:bg-muted/80 active:scale-90 transition-all shrink-0 cursor-pointer"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </Sheet.Header>

          <Sheet.Content
            disableDrag={(state) => state.scrollPosition !== "top"}
            className="px-5 pb-safe"
          >
            <div className="space-y-4 pb-24 pt-4">
              <div className="rounded-[1.5rem] border border-border bg-background/60 p-4">
                <StopLineSelector
                  options={stopLineOptions}
                  activeOption={activeOption}
                  selectedKeys={selectedKeys}
                  isLoading={isLoadingStopLines}
                  onSelect={selectOption}
                />
              </div>

              <div className="rounded-[1.5rem] border border-border bg-background/60 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Mapa del recorrido
                  </h3>
                  <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    Colectivos en tiempo real
                  </span>
                </div>

                {recorridoQuery.isLoading ? (
                  <ArrivalsRouteMapSkeleton />
                ) : (
                  <ArrivalsRouteMap
                    puntos={puntosRecorrido}
                    arribos={activeSection?.arribos ?? []}
                    parada={{
                      latitud: activeParada?.LatitudParada ?? null,
                      longitud: activeParada?.LongitudParada ?? null,
                      bandera: activeParada?.AbreviaturaBandera ?? "",
                    }}
                  />
                )}
              </div>

              <div className="rounded-[1.5rem] border border-border bg-background/60 p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Proximos arribos
                    </h3>
                    <p className="mt-1 text-sm font-medium text-muted-foreground">
                      Todas las líneas elegidas, ordenadas por cercanía.
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
                      className={`w-4 h-4 ${multiArribos.isFetching ? "animate-spin" : ""}`}
                      aria-hidden="true"
                    />
                    Actualizar
                  </button>
                </div>

                <div className="space-y-4" aria-live="polite">
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

                  {!multiArribos.isLoading && (
                    <div className="grid gap-4">
                      {sections.map((section) => (
                        <section
                          key={`${section.option.linea.CodigoLineaParada}:${section.option.parada.Codigo}`}
                          className="rounded-[1.5rem] border border-border bg-background/70 p-4 shadow-sm"
                        >
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

                          {section.result?.error && (
                            <div className="rounded-2xl bg-mdp-rosa/10 px-4 py-3 text-sm font-bold text-mdp-rosa">
                              No pudimos cargar los arribos de esta línea.
                            </div>
                          )}

                          {!section.result?.error &&
                            section.result?.isLoading && (
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
                                      arribo={arribo}
                                      index={index}
                                    />
                                  </li>
                                ))}
                              </ul>
                            )}
                        </section>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Sheet.Content>

          {selectedOptions.length === 1 && activeParada && activeLinea && (
            <div className="absolute bottom-0 left-0 right-0 bg-background border-t border-border px-5 py-4">
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
                <Star
                  className={`w-5 h-5 ${isFavorito ? "fill-current" : ""}`}
                  aria-hidden="true"
                />
                {label}
              </button>
            </div>
          )}
        </FocusScope>
      </Sheet.Container>

      <Sheet.Backdrop
        onTap={onClose}
        className="backdrop-blur-sm"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
        aria-hidden="true"
      />
    </Sheet>
  );
}
