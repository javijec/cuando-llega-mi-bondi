"use client";

import { useRef, useCallback } from "react";
import { Sheet, SheetRef } from "react-modal-sheet";
import { FocusScope } from "react-aria";
import { useTransform } from "motion/react";
import { useArribos, useRefreshArribos } from "@/lib/hooks/useBusQuery";
import { useFavoritoToggle } from "@/lib/hooks/useFavoritos";
import { BusArrivalCard } from "./bus-arrival-card";
import { X, ChevronUp, MapPin, RefreshCw, Loader2, Star } from "lucide-react";
import type { Linea, Calle, Interseccion, Parada } from "@/lib/types/bus";

/**
 * Snap points configuration:
 * - [0] = closed (sheet hidden)
 * - [0.5] = half height (arrivals visible)
 * - [1] = fully expanded
 */
const SNAP_POINTS = [0, 0.5, 1];

/**
 * Sheet ARIA label for accessibility
 */
const SHEET_ARIA_LABEL = "Próximos arribos";

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

  const tweenConfig = {
    ease: [0.32, 0.72, 0, 1] as const,
    duration: 0,
  };

  const {
    data: arribosData,
    isLoading: isLoadingArribos,
    isFetching: isFetchingArribos,
    error: errorArribos,
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

  const paddingBottom = useTransform(() => {
    const y = sheetRef.current?.y.get() ?? 0;
    return Math.max(0, y);
  });

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
      initialSnap={1}
      tweenConfig={tweenConfig}
      dragVelocityThreshold={1500}
      dragCloseThreshold={0.8}
      disableDismiss={true}
      avoidKeyboard={true}
    >
      <Sheet.Container
        role="dialog"
        aria-modal="true"
        aria-label={SHEET_ARIA_LABEL}
        className="rounded-t-3xl! bg-background! border-t! border-border! shadow-2xl!"
      >
        <FocusScope contain restoreFocus>
          <Sheet.Header>
            <div className="px-4 pt-3 pb-2">
              <div className="flex justify-center mb-3">
                <Sheet.DragIndicator />
              </div>

              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-black text-foreground uppercase truncate">
                    {linea?.Descripcion || "Información"}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-black rounded-full uppercase">
                      {parada?.AbreviaturaBandera}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {arribos.length}{" "}
                      {arribos.length === 1 ? "unidad" : "unidades"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Cerrar"
                  className="ml-2 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-2 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <p className="text-sm text-muted-foreground truncate">
                    {calle?.Descripcion}
                  </p>
                </div>
                <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wide ml-5">
                  e {interseccion?.Descripcion}
                </p>
              </div>
            </div>
          </Sheet.Header>

          <Sheet.Content
            disableDrag={(state) => state.scrollPosition !== "top"}
            scrollStyle={{ paddingBottom }}
            className="px-4 pb-safe"
          >
            <div className="pb-24">
              <div className="flex items-center justify-between mb-4 pt-2">
                <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <ChevronUp className="w-4 h-4" />
                  Próximos arribos
                </h4>
                <button
                  onClick={handleRefresh}
                  disabled={refreshArribos.isPending || isFetchingArribos}
                  aria-label="Actualizar arribos"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-50 text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      refreshArribos.isPending || isFetchingArribos
                        ? "animate-spin"
                        : ""
                    }`}
                  />
                  Actualizar
                </button>
              </div>

              {isLoadingArribos && (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-muted-foreground text-sm mt-3 font-bold uppercase tracking-widest">
                    Cargando arribos...
                  </p>
                </div>
              )}

              {errorArribos && (
                <div className="text-center py-8">
                  <p className="text-destructive text-sm font-bold">
                    Error al cargar arribos
                  </p>
                  <button
                    onClick={handleRefresh}
                    className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    Reintentar
                  </button>
                </div>
              )}

              {!isLoadingArribos && !errorArribos && arribos.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm font-medium">
                    No hay unidades en camino
                  </p>
                  <p className="text-muted-foreground/60 text-xs mt-2">
                    Intenta nuevamente en unos minutos
                  </p>
                </div>
              )}

              {!isLoadingArribos && !errorArribos && arribos.length > 0 && (
                <>
                  <div className="space-y-3">
                    {arribos.map((arribo, index) => (
                      <BusArrivalCard
                        key={`${arribo.IdentificadorCoche}-${index}`}
                        arribo={arribo}
                        index={index}
                      />
                    ))}
                  </div>

                  <p className="text-xs text-center text-muted-foreground mt-6">
                    Actualizado: {new Date().toLocaleTimeString()}
                    {isFetchingArribos && (
                      <span className="ml-2 inline-flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Actualizando...
                      </span>
                    )}
                  </p>
                </>
              )}
            </div>
          </Sheet.Content>

          {parada && linea && (
            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-background via-background to-transparent pt-6 pb-6 px-4 border-t border-border">
              <button
                onClick={toggle}
                aria-label={
                  isFavorito ? "Quitar de favoritos" : "Guardar en favoritos"
                }
                aria-pressed={isFavorito}
                className={`w-full py-4 rounded-2xl font-black uppercase text-sm flex items-center justify-center gap-2 transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${
                  isFavorito
                    ? "bg-yellow-500 text-yellow-950 shadow-yellow-500/25"
                    : "bg-card text-foreground border border-border hover:bg-accent"
                }`}
              >
                <Star
                  className={`w-5 h-5 ${isFavorito ? "fill-current" : ""}`}
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
      />
    </Sheet>
  );
}
