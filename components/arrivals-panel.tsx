"use client";

import { useCallback } from "react";
import { useArribos, useRefreshArribos } from "@/lib/hooks/useBusQuery";
import { useFavoritoToggle } from "@/lib/hooks/useFavoritos";
import { BusArrivalCard } from "./bus-arrival-card";
import { RefreshCw, Loader2, MapPin } from "lucide-react";
import type { Linea, Calle, Interseccion, Parada } from "@/lib/types/bus";

interface ArrivalsInfo {
  linea?: Linea;
  calle?: Calle;
  interseccion?: Interseccion;
  parada?: Parada;
}

interface ArrivalsPanelProps {
  info: ArrivalsInfo;
}

export function ArrivalsPanel({ info }: ArrivalsPanelProps) {
  const { parada, linea, calle, interseccion } = info;

  const {
    data: arribosData,
    isLoading,
    isFetching,
    error,
  } = useArribos(parada?.Identificador || "", linea?.CodigoLineaParada || "", {
    enabled: !!parada && !!linea,
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

  if (!parada || !linea) {
    return null;
  }

  return (
    <div className="hidden md:block h-full">
      <div className="bg-card border border-border rounded-3xl p-6 h-full flex flex-col">
        <div className="border-b border-border pb-4 mb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight truncate">
                {linea?.Descripcion}
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="px-3 py-1 bg-mdp-amarillo text-foreground text-xs font-black rounded-full uppercase tracking-wide">
                  {parada?.AbreviaturaBandera}
                </span>
                <span className="text-sm font-bold text-muted-foreground">
                  {arribos.length}{" "}
                  {arribos.length === 1 ? "unidad" : "unidades"}
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
                    {interseccion?.Descripcion.replace("- MAR DEL PLATA", "")}
                  </span>
                </div>
              </address>
            </div>
          </div>
        </div>

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
                refreshArribos.isPending || isFetching ? "animate-spin" : ""
              }`}
              aria-hidden="true"
            />
            Actualizar
          </button>
        </div>

        <div
          className="flex-1 overflow-y-auto"
          aria-live="polite"
          aria-atomic="true"
        >
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

        <div className="border-t border-border pt-4 mt-4">
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
      </div>
    </div>
  );
}
