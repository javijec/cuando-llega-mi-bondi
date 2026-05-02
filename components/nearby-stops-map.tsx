"use client";

import { useEffect, useRef } from "react";
import maplibregl, { type LngLatBoundsLike, type StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { NearbyStop } from "@/lib/types/bus";

interface NearbyStopsMapProps {
  userLocation: {
    latitude: number;
    longitude: number;
  } | null;
  stops: NearbyStop[];
  selectedStopId: string | null;
  onSelectStop: (stopId: string) => void;
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
        id: "landuse",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "landuse",
        paint: { "fill-color": isDark ? "#102941" : "#daeee4", "fill-opacity": 0.7 },
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

export function NearbyStopsMap({
  userLocation,
  stops,
  selectedStopId,
  onSelectStop,
}: NearbyStopsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const userMarkerRef = useRef<maplibregl.Marker | null>(null)
  const stopMarkersRef = useRef<maplibregl.Marker[]>([])

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

    mapRef.current = map

    return () => {
      stopMarkersRef.current.forEach((marker) => marker.remove())
      userMarkerRef.current?.remove()
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !userLocation) {
      return
    }

    userMarkerRef.current?.remove()

    const element = document.createElement("div")
    element.className =
      "h-5 w-5 rounded-full border-4 border-white bg-mdp-turquesa shadow-[0_0_0_8px_rgba(29,117,112,0.18)]"

    userMarkerRef.current = new maplibregl.Marker({ element })
      .setLngLat([userLocation.longitude, userLocation.latitude])
      .addTo(map)
  }, [userLocation])

  useEffect(() => {
    const map = mapRef.current
    if (!map) {
      return
    }

    stopMarkersRef.current.forEach((marker) => marker.remove())
    stopMarkersRef.current = []

    stops.forEach((stop) => {
      const element = document.createElement("button")
      const isSelected = stop.id === selectedStopId
      element.type = "button"
      element.className = isSelected
        ? "h-11 min-w-[48px] rounded-full border-2 border-white bg-mdp-rosa px-3 text-[11px] font-black text-white shadow-lg"
        : "h-10 min-w-[44px] rounded-full border-2 border-white bg-mdp-amarillo px-3 text-[11px] font-black text-foreground shadow-lg"
      element.textContent = stop.nombreLinea
      element.setAttribute("aria-label", `${stop.nombreLinea}, ${stop.distanciaMetros} metros`)
      element.addEventListener("click", () => onSelectStop(stop.id))

      const marker = new maplibregl.Marker({ element })
        .setLngLat([stop.longitud, stop.latitud])
        .addTo(map)

      stopMarkersRef.current.push(marker)
    })
  }, [onSelectStop, selectedStopId, stops])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !userLocation) {
      return
    }

    if (stops.length === 0) {
      map.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 15,
        essential: true,
      })
      return
    }

    const selectedStop = stops.find((stop) => stop.id === selectedStopId) ?? stops[0]

    const bounds = new maplibregl.LngLatBounds(
      [userLocation.longitude, userLocation.latitude],
      [userLocation.longitude, userLocation.latitude],
    )

    bounds.extend([selectedStop.longitud, selectedStop.latitud])

    map.fitBounds(bounds as LngLatBoundsLike, {
      padding: { top: 160, right: 80, bottom: 220, left: 80 },
      maxZoom: 16,
      duration: 800,
    })
  }, [selectedStopId, stops, userLocation])

  return <div ref={containerRef} className="absolute inset-0 h-full w-full" />
}
