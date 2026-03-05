"use client";

import { useRef, useCallback } from "react";
import { Sheet, SheetRef } from "react-modal-sheet";
import { FocusScope } from "react-aria";
import { useArribos, useRefreshArribos } from "@/lib/hooks/useBusQuery";
import { useFavoritoToggle } from "@/lib/hooks/useFavoritos";
import { BusArrivalCard } from "./bus-arrival-card";
import { X, RefreshCw, Loader2, Star, MapPin } from "lucide-react";
import type { Linea, Calle, Interseccion, Parada } from "@/lib/types/bus";

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

export function ArrivalsSheet({ isOpen, onClose, info }: ArrivalsSheetProps) {
  const sheetRef = useRef<SheetRef>(null);
  const { parada, linea, calle, interseccion } = info;

  const {
    data: arribosData,
    isLoading,
    isFetching,
    error,
  } = useArribos(parada?.Identificador || "", linea?.CodigoLineaParada || "", {
    enabled: isOpen && !!parada && !!linea,
  });

  const refreshArribos = useRefreshArribos();

  const { isFavorito, toggle, label } = useFavoritoToggle(
    parada?.Identificador || "",
    linea?.CodigoLineaParada || "",
    {
      nombreLinea: linea?.Descripcion || "",
      bandera: parada?.AbreviaturaBandera || "",
      codigoParada: parada?.Codigo || "",
      banderaCompleta: parada?.AbreviaturaAmpliadaBandera || "",
      descripcionParada: parada?.Descripcion || "",
      calle: calle?.Descripcion || "",
      interseccion: interseccion?.Descripcion || "",
    },
  );

  const arribos = arribosData?.arribos || [];

  const handleRefresh = useCallback(() => {
    if (parada && linea) {
      refreshArribos.mutate({
        identificadorParada: parada.Identificador,
        codigoLineaParada: linea.CodigoLineaParada,
      });
    }
  }, [parada, linea, refreshArribos]);

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
                    {linea?.Descripcion}
                  </h2>
                  <p id="sheet-description" className="sr-only">
                    Información de arribos para la parada {calle?.Descripcion} e{" "}
                    {interseccion?.Descripcion}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span
                      className="px-3 py-1 bg-mdp-amarillo text-primary-foreground text-xs font-black rounded-full uppercase tracking-wide"
                    >
                      {parada?.AbreviaturaBandera}
                    </span>
                    <span
                      className="text-sm font-bold text-muted-foreground"
                      aria-live="polite" // anuncia cambios cuando arriban nuevas unidades
                      aria-atomic="true"
                    >
                      <span
                        aria-label={`${arribos.length} ${arribos.length === 1 ? "unidad en camino" : "unidades en camino"}`}
                      >
                        {arribos.length}{" "}
                        {arribos.length === 1 ? "unidad" : "unidades"}
                      </span>
                    </span>
                  </div>
                  <address className="flex items-center gap-2 mt-3 text-sm text-muted-foreground font-medium not-italic">
                    <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <div className="flex flex-col ">
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Próximos arribos
                </h3>
                <button
                  onClick={handleRefresh}
                  disabled={refreshArribos.isPending || isFetching}
                  aria-label="Actualizar lista de arribos"
                  aria-busy={refreshArribos.isPending || isFetching}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted text-sm font-bold transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${
                      refreshArribos.isPending || isFetching
                        ? "animate-spin"
                        : ""
                    }`}
                    aria-hidden="true"
                  />
                  Actualizar
                </button>
              </div>

              <div aria-live="polite" aria-atomic="true">
                {isLoading && (
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

                {error && (
                  <div className="text-center py-10" role="alert">
                    <p className="text-mdp-rosa text-lg font-black mb-3">
                      Error al cargar
                    </p>
                    <button
                      onClick={handleRefresh}
                      className="btn-mdp-amarillo px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer"
                    >
                      Reintentar
                    </button>
                  </div>
                )}

                {!isLoading && !error && arribos.length === 0 && (
                  <div className="text-center py-10" role="status">
                    <MapPin
                      className="w-14 h-14 mx-auto text-muted-foreground/40 mb-4"
                      aria-hidden="true"
                    />
                    <p className="text-muted-foreground text-base font-bold">
                      No hay unidades en camino
                    </p>
                  </div>
                )}

                {!isLoading && !error && arribos.length > 0 && (
                  <ul
                    className="space-y-3"
                    role="list"
                    aria-label="Lista de próximos arribos"
                  >
                    {arribos.map((arribo, index) => (
                      <li key={arribo.IdentificadorCoche}>
                        <BusArrivalCard arribo={arribo} index={index} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Sheet.Content>

          {parada && linea && (
            <div className="absolute bottom-0 left-0 right-0 bg-background border-t border-border px-5 py-4">
              <button
                onClick={toggle}
                aria-label={
                  isFavorito
                    ? `Quitar ${linea?.Descripcion} de favoritos`
                    : `Guardar ${linea?.Descripcion} en favoritos`
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
