"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { type LngLatBoundsLike, type StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Arribo, PuntoRecorrido } from "@/lib/types/bus";

interface ArrivalsRouteMapProps {
  puntos: PuntoRecorrido[];
  arribos: Arribo[];
  parada: {
    latitud: number | null;
    longitud: number | null;
    bandera: string;
  } | null;
}

const OFM_SOURCE = {
  type: "vector" as const,
  url: "https://tiles.openfreemap.org/planet",
}

function buildStyle(isDark: boolean): StyleSpecification {
  return {
    version: 8,
    glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
    sources: { openmaptiles: OFM_SOURCE },
    layers: [
      {
        id: "background",
        type: "background",
        paint: { "background-color": isDark ? "#0f2d4a" : "#f7f7f4" },
      },
      {
        id: "water",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "water",
        paint: { "fill-color": isDark ? "#0a2038" : "#c5e0de" },
      },
      {
        id: "roads",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        paint: {
          "line-color": isDark ? "#1e3f5c" : "#ffffff",
          "line-width": 2,
        },
      },
      {
        id: "road-label",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "transportation_name",
        layout: {
          "text-field": ["coalesce", ["get", "name:es"], ["get", "name"]],
          "text-font": ["Noto Sans Regular"],
          "text-size": 11,
          "symbol-placement": "line",
        },
        paint: {
          "text-color": isDark ? "#8ba4bb" : "#0f2d4a",
          "text-halo-color": isDark ? "#0f2d4a" : "#ffffff",
          "text-halo-width": 1.25,
        },
      },
    ],
  }
}

function isDarkMode(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

function toNumber(value: string): number | null {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function getVehicleCoordinates(arribos: Arribo[]): Array<{
  id: string;
  latitude: number;
  longitude: number;
  label: string;
}> {
  return arribos
    .map((arribo, index) => {
      const latitude = toNumber(arribo.Latitud)
      const longitude = toNumber(arribo.Longitud)

      if (latitude === null || longitude === null) {
        return null
      }

      return {
        id: `${arribo.IdentificadorCoche || "bus"}-${index}`,
        latitude,
        longitude,
        label: arribo.IdentificadorCoche || arribo.DescripcionCortaBandera || "Bus",
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
}

export function ArrivalsRouteMap({
  puntos,
  arribos,
  parada,
}: ArrivalsRouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const busMarkersRef = useRef<maplibregl.Marker[]>([])
  const stopMarkerRef = useRef<maplibregl.Marker | null>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  const vehicleCoordinates = useMemo(() => getVehicleCoordinates(arribos), [arribos])
  const stopCoordinates =
    parada?.latitud !== null &&
    parada?.latitud !== undefined &&
    parada?.longitud !== null &&
    parada?.longitud !== undefined
      ? {
          latitude: parada.latitud,
          longitude: parada.longitud,
        }
      : (() => {
          const firstArrival = arribos[0]
          if (!firstArrival) {
            return null
          }

          const latitude = toNumber(firstArrival.LatitudParada)
          const longitude = toNumber(firstArrival.LongitudParada)

          if (latitude === null || longitude === null) {
            return null
          }

          return { latitude, longitude }
        })()

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: buildStyle(isDarkMode()),
      center: [-57.5536, -38.0088],
      zoom: 13,
      minZoom: 11,
      maxZoom: 18,
    })

    map.on("load", () => setIsMapLoaded(true))
    mapRef.current = map

    return () => {
      busMarkersRef.current.forEach((marker) => marker.remove())
      stopMarkerRef.current?.remove()
      map.remove()
      mapRef.current = null
      setIsMapLoaded(false)
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !isMapLoaded) {
      return
    }

    if (map.getLayer("arrivals-route-line")) {
      map.removeLayer("arrivals-route-line")
    }
    if (map.getSource("arrivals-route")) {
      map.removeSource("arrivals-route")
    }

    if (puntos.length > 1) {
      map.addSource("arrivals-route", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: puntos.map((punto) => [punto.Longitud, punto.Latitud]),
          },
          properties: {},
        },
      })

      map.addLayer({
        id: "arrivals-route-line",
        type: "line",
        source: "arrivals-route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#1d7570",
          "line-width": 5,
          "line-opacity": 0.9,
        },
      })
    }
  }, [isMapLoaded, puntos])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !isMapLoaded) {
      return
    }

    stopMarkerRef.current?.remove()
    stopMarkerRef.current = null

    if (!stopCoordinates) {
      return
    }

    const element = document.createElement("div")
    element.className =
      "rounded-full border-2 border-white bg-mdp-rosa px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white shadow-lg"
    element.textContent = parada?.bandera || "Parada"

    stopMarkerRef.current = new maplibregl.Marker({ element })
      .setLngLat([stopCoordinates.longitude, stopCoordinates.latitude])
      .addTo(map)
  }, [isMapLoaded, parada?.bandera, stopCoordinates])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !isMapLoaded) {
      return
    }

    busMarkersRef.current.forEach((marker) => marker.remove())
    busMarkersRef.current = []

    vehicleCoordinates.forEach((vehicle) => {
      const element = document.createElement("div")
      element.className =
        "flex h-9 min-w-[40px] items-center justify-center rounded-full border-2 border-white bg-mdp-amarillo px-2 text-[10px] font-black text-foreground shadow-lg"
      element.textContent = vehicle.label

      const marker = new maplibregl.Marker({ element })
        .setLngLat([vehicle.longitude, vehicle.latitude])
        .addTo(map)

      busMarkersRef.current.push(marker)
    })
  }, [isMapLoaded, vehicleCoordinates])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !isMapLoaded) {
      return
    }

    const bounds = new maplibregl.LngLatBounds()
    let hasPoints = false

    puntos.forEach((punto) => {
      bounds.extend([punto.Longitud, punto.Latitud])
      hasPoints = true
    })

    vehicleCoordinates.forEach((vehicle) => {
      bounds.extend([vehicle.longitude, vehicle.latitude])
      hasPoints = true
    })

    if (stopCoordinates) {
      bounds.extend([stopCoordinates.longitude, stopCoordinates.latitude])
      hasPoints = true
    }

    if (!hasPoints) {
      return
    }

    map.fitBounds(bounds as LngLatBoundsLike, {
      padding: { top: 50, right: 50, bottom: 50, left: 50 },
      maxZoom: 15.5,
      duration: 700,
    })
  }, [isMapLoaded, puntos, stopCoordinates, vehicleCoordinates])

  return <div ref={containerRef} className="h-64 w-full rounded-3xl" />
}
