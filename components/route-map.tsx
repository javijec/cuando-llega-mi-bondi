"use client";

import { useState, useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { PuntoRecorrido } from "@/lib/types/bus";

interface RouteMapProps {
  puntos: PuntoRecorrido[];
  isLoading?: boolean;
  color?: string;
}

export function RouteMap({
  puntos,
  isLoading,
  color = "#1d7570",
}: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const newMap = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: [
              "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
          },
        ],
      },
      center: [-57.5536, -38.0088],
      zoom: 13,
      minZoom: 11,
      maxZoom: 18,
      scrollZoom: true,
    });

    newMap.on("load", () => {
      setIsMapLoaded(true);
    });

    map.current = newMap;

    return () => {
      newMap.remove();
      map.current = null;
    };
  }, []);

  // Actualizar recorrido cuando cambian los puntos
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    const currentMap = map.current;

    const updateRoute = () => {
      // Verificar que el estilo esté completamente cargado
      if (!currentMap.isStyleLoaded()) {
        return;
      }

      // Limpiar capas y fuentes anteriores
      if (currentMap.getLayer("route-line")) {
        currentMap.removeLayer("route-line");
      }
      if (currentMap.getLayer("route-points")) {
        currentMap.removeLayer("route-points");
      }
      if (currentMap.getSource("route")) {
        currentMap.removeSource("route");
      }
      if (currentMap.getSource("stops")) {
        currentMap.removeSource("stops");
      }

      if (puntos.length === 0) return;

      // Preparar coordenadas para la línea del recorrido
      const coordinates = puntos.map((p) => [p.Longitud, p.Latitud]);

      // Filtrar solo las paradas (IsPuntoPaso = true)
      const paradas = puntos.filter((p) => p.IsPuntoPaso);

      // Agregar fuente de la línea
      currentMap.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: coordinates as [number, number][],
          },
        },
      });

      // Agregar fuente de paradas
      currentMap.addSource("stops", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: paradas.map((p) => ({
            type: "Feature",
            properties: {
              description: p.Descripcion,
              bandera: p.AbreviaturaBanderaSMP,
            },
            geometry: {
              type: "Point",
              coordinates: [p.Longitud, p.Latitud],
            },
          })),
        },
      });

      // Agregar capa de la línea
      currentMap.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": color,
          "line-width": 5,
          "line-opacity": 0.9,
        },
      });

      // Agregar capa de paradas
      currentMap.addLayer({
        id: "route-points",
        type: "circle",
        source: "stops",
        paint: {
          "circle-radius": 7,
          "circle-color": color,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      // Ajustar el mapa para mostrar todo el recorrido
      const bounds = new maplibregl.LngLatBounds();
      coordinates.forEach((coord) => {
        bounds.extend(coord as [number, number]);
      });
      currentMap.fitBounds(bounds, {
        padding: 80,
        maxZoom: 16,
      });

      // Agregar popups al hacer click en paradas
      currentMap.on("click", "route-points", (e) => {
        if (!e.features || e.features.length === 0) return;

        const feature = e.features[0];
        const coordinates = feature.geometry as GeoJSON.Point;
        const { description, bandera } = feature.properties as {
          description: string;
          bandera: string;
        };

        new maplibregl.Popup()
          .setLngLat(coordinates.coordinates as [number, number])
          .setHTML(
            `<div style="padding: 12px; min-width: 150px;">
              <strong style="font-size: 15px; color: ${color}; display: block; margin-bottom: 4px;">${bandera}</strong>
              <p style="margin: 0; font-size: 13px; color: #666;">${description}</p>
            </div>`,
          )
          .addTo(currentMap);
      });

      // Cambiar cursor al pasar sobre paradas
      currentMap.on("mouseenter", "route-points", () => {
        currentMap.getCanvas().style.cursor = "pointer";
      });

      currentMap.on("mouseleave", "route-points", () => {
        currentMap.getCanvas().style.cursor = "";
      });
    };

    // Si el estilo no está cargado, esperar al evento style.load
    if (currentMap.isStyleLoaded()) {
      updateRoute();
    } else {
      // Usar requestAnimationFrame para reintentar hasta que el estilo esté listo
      let animationFrameId: number;

      const checkAndUpdate = () => {
        if (currentMap.isStyleLoaded()) {
          updateRoute();
        } else {
          animationFrameId = requestAnimationFrame(checkAndUpdate);
        }
      };

      checkAndUpdate();

      // Cleanup: cancelar el animation frame si el componente se desmonta
      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    }
  }, [puntos, isMapLoaded, color]);

  return (
    <div className="absolute inset-0 w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {(isLoading || !isMapLoaded) && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2 bg-white/90 px-6 py-4 rounded-2xl shadow-lg">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground font-medium">
              {isLoading ? "Cargando recorrido..." : "Iniciando mapa..."}
            </span>
          </div>
        </div>
      )}

      {puntos.length === 0 && !isLoading && isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 px-6 py-4 rounded-2xl shadow-lg">
            <p className="text-muted-foreground text-center">
              Selecciona una línea para ver su recorrido
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
