"use client";

import { useMemo, useRef } from "react";
import { FocusScope } from "react-aria";
import { Sheet, type SheetRef } from "react-modal-sheet";
import { Loader2, MapPin, RefreshCw, Star, X } from "lucide-react";
import { useFavoritoToggle } from "@/lib/hooks/useFavoritos";
import { useMultiArribos } from "@/lib/hooks/useBusQuery";
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
        className="rounded-t-3xl! bg-background! border-t! border-border! shadow-2xl!"
      >
        <FocusScope contain restoreFocus>
          <Sheet.Header>
            <div className="px-5 pt-4 pb-3">
              <div className="flex justify-center mb-3">
                <Sheet.DragIndicator aria-hidden="true" />
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h2
                    id="sheet-title"
                    className="text-2xl font-black text-foreground uppercase tracking-tight truncate"
                  >
                    {selectedOptions.length === 1
                      ? activeLinea?.Descripcion
                      : `${selectedOptions.length} lineas en esta parada`}
                  </h2>
                  <p id="sheet-description" className="sr-only">
                    Información de arribos para la parada {calle?.Descripcion} e{" "}
                    {interseccion?.Descripcion}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="px-3 py-1 bg-mdp-amarillo text-primary-foreground text-xs font-black rounded-full uppercase tracking-wide">
                      {selectedOptions.length === 1
                        ? activeParada?.AbreviaturaBandera
                        : "Comparando lineas"}
                    </span>
                    <span className="text-sm font-bold text-muted-foreground">
                      {totalArribos}{" "}
                      {totalArribos === 1 ? "unidad" : "unidades"}
                    </span>
                  </div>
                  <address className="flex items-center gap-2 mt-3 text-sm text-muted-foreground font-medium not-italic">
                    <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <div className="flex flex-col">
                      <span className="text-[1rem] truncate">
                        {calle?.Descripcion.replace("- MAR DEL PLATA", "")}
                      </span>
                      <span className="text-[.8rem] opacity-50">
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
            <div className="pb-24">
              <StopLineSelector
                options={stopLineOptions}
                activeOption={activeOption}
                selectedKeys={selectedKeys}
                isLoading={isLoadingStopLines}
                onSelect={selectOption}
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
                        className="rounded-3xl border border-border bg-background/70 p-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-3 mb-4">
                          <div className="min-w-0">
                            <h4 className="text-lg font-black text-foreground truncate">
                              {section.option.linea.Descripcion}
                            </h4>
                            <p className="mt-1 text-xs text-muted-foreground truncate">
                              {section.arribos.length}{" "}
                              {section.arribos.length === 1
                                ? "unidad en camino"
                                : "unidades en camino"}
                            </p>
                          </div>
                          <span className="rounded-full bg-mdp-amarillo/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-mdp-amarillo">
                            {section.option.parada.AbreviaturaBandera}
                          </span>
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
                            <ul className="space-y-3" role="list">
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
