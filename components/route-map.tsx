"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import maplibregl, { StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { PuntoRecorrido } from "@/lib/types/bus";

interface RouteMapProps {
  puntos: PuntoRecorrido[];
  color?: string; // override manual del color de la línea de ruta
}

// ─── Paleta MDP (sincronizada con globals.css) ────────────────────────────────

const MDP = {
  // Brand
  amarillo: "#f9cd4a",
  turquesa: "#1d7570",
  turquesaMid: "#24908a",
  turquesaLight: "#289b95",
  rosa: "#c93679",
  rosaDark: "#e05588",
  // Grises azulados (modo oscuro)
  azulNoche: "#0f2d4a",
  azulNocheMid: "#122843",
  azulNocheSec: "#0a2038",
  azulBorde: "#1e3f5c",
  azulBordeSutil: "#183352",
  // Texto
  textoClaro: "#f0f4f8",
  textoClaroMuted: "#8ba4bb",
  textoOscuro: "#0f2d4a",
  textoMuted: "#4a6070",
  // Fondos claro
  bgClaro: "#f7f7f4",
  bgClaroSec: "#ededea",
  bordeClaro: "#d4d4d0",
} as const;

// ─── Source de tiles vectoriales ──────────────────────────────────────────────
//
// OpenFreeMap ofrece tiles en schema OpenMapTiles (OMT) sin API key.
// TileJSON en https://tiles.openfreemap.org/planet resuelve los tile URLs.
//
const OFM_SOURCE = {
  type: "vector" as const,
  url: "https://tiles.openfreemap.org/planet",
};

// ─── ESTILO CLARO — base crema cálida, acentos turquesa ──────────────────────
//
//  Fondo     → #f7f7f4  (--mdp-bg-principal)
//  Agua      → turquesa claro #cde6e5 — identidad de marca
//  Parques   → verde suave derivado del turquesa
//  Calles    → blanco/crema para máximo contraste con la ruta turquesa
//  Etiquetas → azul noche #0f2d4a — máxima legibilidad sobre fondo claro
//
function buildLightStyle(): StyleSpecification {
  return {
    version: 8,
    glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
    sources: { openmaptiles: OFM_SOURCE },
    layers: [
      // ── Fondo ──────────────────────────────────────────────────────────────
      {
        id: "background",
        type: "background",
        paint: { "background-color": MDP.bgClaro },
      },

      // ── Agua ───────────────────────────────────────────────────────────────
      {
        id: "water",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "water",
        paint: { "fill-color": "#c5e0de", "fill-opacity": 1 },
      },
      {
        id: "water-shadow",
        type: "line",
        source: "openmaptiles",
        "source-layer": "water",
        paint: { "line-color": "#a8d4d2", "line-width": 1 },
      },

      // ── Usos de suelo ──────────────────────────────────────────────────────
      {
        id: "landuse-green",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "landuse",
        filter: [
          "in",
          "class",
          "grass",
          "park",
          "forest",
          "cemetery",
          "garden",
          "pitch",
        ],
        paint: { "fill-color": "#daeee4", "fill-opacity": 0.8 },
      },
      {
        id: "landuse-sand",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "landuse",
        filter: ["in", "class", "sand", "beach"],
        paint: { "fill-color": "#f0e9d2" },
      },

      // ── Zonas construidas ─────────────────────────────────────────────────
      {
        id: "building",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "building",
        paint: {
          "fill-color": "#ece5d4",
          "fill-outline-color": MDP.bordeClaro,
          "fill-opacity": 0.9,
        },
      },

      // ── Vías ───────────────────────────────────────────────────────────────
      // Casing (borde) debajo de cada vía
      {
        id: "road-path-casing",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["in", "class", "path", "track"],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": MDP.bgClaroSec, "line-width": 1.5 },
      },
      {
        id: "road-minor-casing",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["in", "class", "minor", "service", "residential"],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": MDP.bordeClaro, "line-width": 3 },
      },
      {
        id: "road-secondary-casing",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["in", "class", "secondary", "tertiary"],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#c8c0a8", "line-width": 5 },
      },
      {
        id: "road-primary-casing",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["in", "class", "primary", "trunk", "motorway"],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#b8af94", "line-width": 7 },
      },
      // Superficie de la vía
      {
        id: "road-path",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["in", "class", "path", "track"],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#e8e2d5",
          "line-width": 1,
          "line-dasharray": [2, 2],
        },
      },
      {
        id: "road-minor",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["in", "class", "minor", "service", "residential"],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#ffffff", "line-width": 2 },
      },
      {
        id: "road-secondary",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["in", "class", "secondary", "tertiary"],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#f0e9d5", "line-width": 3 },
      },
      {
        id: "road-primary",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["in", "class", "primary", "trunk", "motorway"],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#e8dfc5", "line-width": 5 },
      },

      // ── Fronteras ─────────────────────────────────────────────────────────
      {
        id: "boundary",
        type: "line",
        source: "openmaptiles",
        "source-layer": "boundary",
        filter: ["==", "admin_level", 4],
        paint: {
          "line-color": "#c0b898",
          "line-width": 1,
          "line-dasharray": [4, 3],
        },
      },

      // ── Etiquetas de calles ───────────────────────────────────────────────
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
          "text-max-angle": 30,
          "text-padding": 5,
        },
        paint: {
          "text-color": MDP.textoOscuro,
          "text-halo-color": "#ffffff",
          "text-halo-width": 1.5,
        },
      },
    ],
  };
}

// ─── ESTILO OSCURO — base azul noche, acentos turquesa y amarillo ─────────────
//
//  Fondo     → #0f2d4a  (--mdp-bg-principal dark)
//  Agua      → #0a2038  — azul más profundo, sutil diferencia
//  Parques   → #0d2840  — tono intermedio, casi invisible (correcto para UI)
//  Calles    → azules medios #183352 / #1e3f5c — contraste moderado
//  Arteria   → turquesa suave para distinguir vías principales
//  Etiquetas → #8ba4bb  (--muted-foreground dark) — legible sin distraer
//
function buildDarkStyle(): StyleSpecification {
  return {
    version: 8,
    glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
    sources: { openmaptiles: OFM_SOURCE },
    layers: [
      // ── Fondo ──────────────────────────────────────────────────────────────
      {
        id: "background",
        type: "background",
        paint: { "background-color": MDP.azulNoche },
      },

      // ── Agua ───────────────────────────────────────────────────────────────
      {
        id: "water",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "water",
        paint: { "fill-color": MDP.azulNocheSec },
      },
      {
        id: "water-shadow",
        type: "line",
        source: "openmaptiles",
        "source-layer": "water",
        paint: { "line-color": MDP.azulBordeSutil, "line-width": 1 },
      },

      // ── Usos de suelo ──────────────────────────────────────────────────────
      {
        id: "landuse-green",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "landuse",
        filter: [
          "in",
          "class",
          "grass",
          "park",
          "forest",
          "cemetery",
          "garden",
          "pitch",
        ],
        paint: { "fill-color": "#0d2a3e", "fill-opacity": 0.8 },
      },

      // ── Zonas construidas ──────────────────────────────────────────────────
      {
        id: "building",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "building",
        paint: {
          "fill-color": MDP.azulNocheMid,
          "fill-outline-color": MDP.azulBordeSutil,
          "fill-opacity": 0.9,
        },
      },

      // ── Vías ───────────────────────────────────────────────────────────────
      // Casing
      {
        id: "road-minor-casing",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["in", "class", "minor", "service", "residential"],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": MDP.azulNocheSec, "line-width": 3 },
      },
      {
        id: "road-secondary-casing",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["in", "class", "secondary", "tertiary"],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": MDP.azulNocheSec, "line-width": 5 },
      },
      {
        id: "road-primary-casing",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["in", "class", "primary", "trunk", "motorway"],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": MDP.azulNocheSec, "line-width": 8 },
      },
      // Superficie
      {
        id: "road-path",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["in", "class", "path", "track"],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": MDP.azulBordeSutil,
          "line-width": 1,
          "line-dasharray": [2, 2],
        },
      },
      {
        id: "road-minor",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["in", "class", "minor", "service", "residential"],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": MDP.azulBordeSutil, "line-width": 1.5 },
      },
      {
        id: "road-secondary",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["in", "class", "secondary", "tertiary"],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": MDP.azulBorde, "line-width": 2.5 },
      },
      // Arterias principales: turquesa suave para jerarquía visual
      {
        id: "road-primary",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["in", "class", "primary", "trunk", "motorway"],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#1a4d5e", "line-width": 4 },
      },

      // ── Fronteras ─────────────────────────────────────────────────────────
      {
        id: "boundary",
        type: "line",
        source: "openmaptiles",
        "source-layer": "boundary",
        filter: ["==", "admin_level", 4],
        paint: {
          "line-color": MDP.azulBorde,
          "line-width": 1,
          "line-dasharray": [4, 3],
        },
      },

      // ── Etiquetas de calles ───────────────────────────────────────────────
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
          "text-max-angle": 30,
          "text-padding": 5,
        },
        paint: {
          "text-color": MDP.textoClaroMuted,
          "text-halo-color": MDP.azulNocheMid,
          "text-halo-width": 1.5,
        },
      },
    ],
  };
}

// ─── Colores de la ruta según tema ────────────────────────────────────────────
//
//  Ruta   → turquesa MDP (sobre fondo crema / azul noche — ambos contrastes ✓)
//  Inicio → rosa MDP
//  Fin    → amarillo MDP — siempre el destino
//  Halo   → blanco en claro / azul noche en oscuro (separa la línea del callejero)
//
function isDarkMode(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getThemeColors(dark: boolean, colorOverride?: string) {
  return {
    style: dark ? buildDarkStyle() : buildLightStyle(),
    route: colorOverride ?? (dark ? "#ffffff" : MDP.turquesa),
    routeBorder: dark ? MDP.azulNoche : "#ffffff",
    colorInicio: dark ? MDP.rosaDark : MDP.rosa,
    colorFin: MDP.amarillo,
    pointStroke: dark ? "#0f2d4a" : MDP.azulNoche,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

export function RouteMap({ puntos, color }: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Dibujar / actualizar recorrido
  const drawRoute = useCallback(() => {
    const m = map.current;
    if (!m || !m.isStyleLoaded()) return;

    const dark = isDarkMode();
    const { route, routeBorder, colorInicio, colorFin, pointStroke } =
      getThemeColors(dark, color);

    // Limpiar capas y fuentes anteriores
    ["route-line-border", "route-line", "route-points"].forEach((id) => {
      if (m.getLayer(id)) m.removeLayer(id);
    });
    ["route", "stops"].forEach((id) => {
      if (m.getSource(id)) m.removeSource(id);
    });

    if (puntos.length === 0) return;

    const coordinates = puntos.map((p) => [p.Longitud, p.Latitud]);
    const paradas = puntos.filter((p) => p.IsPuntoPaso);

    m.addSource("route", {
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

    if (paradas.length > 0) {
      m.addSource("stops", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: paradas.map((p, i, arr) => ({
            type: "Feature" as const,
            properties: {
              tipo:
                i === 0
                  ? "inicio"
                  : i === arr.length - 1
                    ? "fin"
                    : "intermedio",
              descripcion: p.Descripcion,
            },
            geometry: {
              type: "Point" as const,
              coordinates: [p.Longitud, p.Latitud] as [number, number],
            },
          })),
        },
      });

      m.addLayer({
        id: "route-points",
        type: "circle",
        source: "stops",
        paint: {
          "circle-radius": [
            "case",
            ["==", ["get", "tipo"], "fin"],
            10, // destino (amarillo) un poco más grande
            8,
          ],
          "circle-color": [
            "case",
            ["==", ["get", "tipo"], "inicio"],
            colorInicio, // rosa MDP
            ["==", ["get", "tipo"], "fin"],
            colorFin, // amarillo MDP
            "transparent",
          ],
          "circle-stroke-width": [
            "case",
            ["==", ["get", "tipo"], "intermedio"],
            0,
            2,
          ],
          "circle-stroke-color": [
            "case",
            ["==", ["get", "tipo"], "intermedio"],
            "transparent",
            pointStroke,
          ],
        },
      });
    }

    // Halo para separar la ruta del callejero
    m.addLayer({
      id: "route-line-border",
      type: "line",
      source: "route",
      layout: { "line-join": "round", "line-cap": "round" },
      paint: {
        "line-color": routeBorder,
        "line-width": 9,
        "line-opacity": 0.45,
      },
    });

    // Línea principal
    m.addLayer({
      id: "route-line",
      type: "line",
      source: "route",
      layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": route, "line-width": 5, "line-opacity": 1 },
    });

    const bounds = new maplibregl.LngLatBounds();
    coordinates.forEach((c) => bounds.extend(c as [number, number]));
    m.fitBounds(bounds, { padding: 80, maxZoom: 16 });
  }, [puntos, color]);

  // Inicializar mapa (una sola vez)
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const { style } = getThemeColors(isDarkMode(), color);

    const newMap = new maplibregl.Map({
      container: mapContainer.current,
      style,
      center: [-57.5536, -38.0088],
      zoom: 13,
      minZoom: 11,
      maxZoom: 18,
      scrollZoom: true,
    });

    newMap.on("load", () => setIsMapLoaded(true));

    map.current = newMap;
    return () => {
      newMap.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cambio de tema: swap completo del estilo
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      const m = map.current;
      if (!m) return;
      const { style } = getThemeColors(e.matches, color);
      m.setStyle(style);
      m.once("style.load", () => drawRoute());
    };

    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, [color, drawRoute]);

  // Dibujar cuando el mapa carga o cambian los puntos
  useEffect(() => {
    if (!isMapLoaded) return;
    const m = map.current!;
    if (m.isStyleLoaded()) {
      drawRoute();
    } else {
      let raf: number;
      const check = () => {
        if (m.isStyleLoaded()) drawRoute();
        else raf = requestAnimationFrame(check);
      };
      check();
      return () => cancelAnimationFrame(raf);
    }
  }, [puntos, isMapLoaded, drawRoute]);

  return (
    <div className="absolute inset-0 w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {!isMapLoaded && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2 bg-card/90 px-6 py-4 rounded-2xl shadow-lg">
            <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground font-medium">
              Iniciando mapa...
            </span>
          </div>
        </div>
      )}

      {puntos.length === 0 && isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-card/90 px-6 py-4 rounded-2xl shadow-lg">
            <p className="text-muted-foreground text-center">
              Selecciona una línea para ver su recorrido
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
