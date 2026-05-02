"use client";

import { useMemo, useState } from "react";
import { Crosshair, Loader2, MapPin, Navigation, TriangleAlert } from "lucide-react";
import { NearbyStopsMap, NearbyStopsMapSkeleton } from "./nearby-stops-map-dynamic";
import { useCurrentLocation } from "@/lib/hooks/use-current-location";
import { useNearbyStops } from "@/lib/hooks/useBusQuery";

const RADIUS_METERS = 1000

export function NearbyStopsView() {
  const { location, error: locationError, isLoading, requestLocation } =
    useCurrentLocation()

  const nearbyStopsQuery = useNearbyStops(
    location?.latitude ?? null,
    location?.longitude ?? null,
    RADIUS_METERS,
    !!location,
  )

  const stops = useMemo(() => nearbyStopsQuery.data?.paradas ?? [], [nearbyStopsQuery.data])
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null)

  const selectedStop = useMemo(
    () => stops.find((stop) => stop.id === selectedStopId) ?? stops[0] ?? null,
    [selectedStopId, stops],
  )

  const errorMessage =
    locationError ||
    (nearbyStopsQuery.error instanceof Error ? nearbyStopsQuery.error.message : null)

  const statusMessage = isLoading
    ? "Buscando tu ubicación."
    : nearbyStopsQuery.isLoading
      ? "Buscando paradas cercanas."
      : stops.length > 0
        ? `Mostrando ${stops.length} paradas cercanas en un radio de ${RADIUS_METERS} metros.`
        : "Todavía no hay paradas cercanas cargadas."

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      role="region"
      aria-label="Mapa de paradas cercanas"
    >
      {location ? (
        <NearbyStopsMap
          userLocation={location}
          stops={stops}
          selectedStopId={selectedStopId}
          onSelectStop={setSelectedStopId}
        />
      ) : (
        <NearbyStopsMapSkeleton />
      )}

      <div
        className="absolute inset-0 z-10 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.24) 0%, transparent 28%, transparent 62%, rgba(0,0,0,0.34) 100%)",
        }}
      />

      <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {statusMessage}
      </p>

      <section className="absolute left-4 right-4 top-4 z-20 space-y-3 pt-[env(safe-area-inset-top)]">
        <div className="mx-auto max-w-3xl rounded-[28px] border border-white/20 bg-background/90 p-5 shadow-2xl backdrop-blur-md">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-mdp-amarillo">
                Otra opción
              </p>
              <h1 className="mt-2 text-2xl font-black uppercase tracking-tight text-foreground">
                Paradas cercanas
              </h1>
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                Encontrá paradas a 1000 metros de tu ubicación y velas directo en mapa.
              </p>
            </div>

            <button
              type="button"
              onClick={requestLocation}
              disabled={isLoading || nearbyStopsQuery.isFetching}
              className="flex shrink-0 items-center gap-2 rounded-2xl bg-mdp-turquesa px-4 py-3 text-sm font-black text-white transition-all active:scale-95 disabled:opacity-60"
            >
              {isLoading || nearbyStopsQuery.isFetching ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Crosshair className="h-4 w-4" aria-hidden="true" />
              )}
              Ubicarme
            </button>
          </div>

          {errorMessage && (
            <div className="mt-4 flex items-start gap-3 rounded-2xl bg-mdp-rosa/10 px-4 py-3 text-sm font-bold text-mdp-rosa">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>{errorMessage}</p>
            </div>
          )}

          {!errorMessage && location && (
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-bold text-muted-foreground">
              <span className="rounded-full bg-muted px-3 py-1.5">
                Radio: {RADIUS_METERS} m
              </span>
              <span className="rounded-full bg-muted px-3 py-1.5">
                {stops.length} paradas detectadas
              </span>
              {selectedStop && (
                <span className="rounded-full bg-mdp-amarillo/20 px-3 py-1.5 text-foreground">
                  Seleccionada: {selectedStop.nombreLinea}
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="absolute bottom-6 left-4 right-4 z-20">
        <div className="mx-auto max-w-5xl rounded-[30px] border border-white/20 bg-background/92 p-4 shadow-2xl backdrop-blur-md md:grid md:grid-cols-[minmax(0,1fr)_320px] md:gap-4">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
              <Navigation className="h-4 w-4" aria-hidden="true" />
              Mapa activo
            </div>

            {!location && (
              <div className="rounded-2xl bg-muted/50 px-4 py-4 text-sm font-bold text-muted-foreground">
                Tocá <span className="text-foreground">Ubicarme</span> para ver tu punto y las paradas cercanas en el mapa.
              </div>
            )}

            {location && stops.length === 0 && !nearbyStopsQuery.isLoading && !errorMessage && (
              <div className="rounded-2xl bg-muted/50 px-4 py-4 text-sm font-bold text-muted-foreground">
                No encontramos paradas a menos de 1000 metros.
              </div>
            )}

            {stops.length > 0 && (
              <ul className="grid max-h-[32vh] gap-3 overflow-auto pr-1 md:grid-cols-2" role="list">
                {stops.map((stop) => {
                  const isSelected = stop.id === selectedStop?.id

                  return (
                    <li key={stop.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedStopId(stop.id)}
                        className={`w-full rounded-2xl border p-4 text-left transition-all ${
                          isSelected
                            ? "border-mdp-rosa bg-mdp-rosa/10 shadow-md"
                            : "border-border bg-background/70 hover:border-mdp-amarillo/60"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-lg font-black text-foreground">
                              {stop.nombreLinea}
                            </p>
                            <p className="truncate text-sm font-bold text-muted-foreground">
                              {stop.bandera}
                            </p>
                          </div>
                          <span className="rounded-full bg-mdp-amarillo/15 px-3 py-1 text-xs font-black uppercase tracking-wide text-foreground">
                            {stop.distanciaMetros} m
                          </span>
                        </div>
                        <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                          <p>{stop.descripcion}</p>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <aside className="mt-4 rounded-[26px] bg-card p-4 md:mt-0">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
              Detalle
            </p>
            {selectedStop ? (
              <div className="mt-3 space-y-3">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">
                    {selectedStop.nombreLinea}
                  </h2>
                  <p className="text-sm font-bold text-muted-foreground">
                    {selectedStop.bandera}
                  </p>
                </div>
                <div className="rounded-2xl bg-muted/50 p-3">
                  <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                    Distancia
                  </p>
                  <p className="mt-1 text-2xl font-black text-foreground">
                    {selectedStop.distanciaMetros} m
                  </p>
                </div>
                <div className="rounded-2xl bg-muted/50 p-3">
                  <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                    Referencia
                  </p>
                  <p className="mt-1 text-sm font-bold text-foreground">
                    {selectedStop.descripcion}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm font-bold text-muted-foreground">
                Seleccioná una parada del mapa o de la lista para ver detalle.
              </p>
            )}
          </aside>
        </div>
      </section>
    </div>
  )
}
