// lib/services/busService.ts
import type {
  LineasResponse,
  CallesResponse,
  InterseccionesResponse,
  ParadasResponse,
  ArribosResponse,
  RecorridoResponse,
  APIResponse,
} from "@/lib/types/bus";

/**
 * 🔥 Cliente HTTP optimizado con enfoque híbrido:
 * - GET para datos estáticos (aprovecha Vercel CDN)
 * - POST para datos dinámicos (arribos en tiempo real)
 *
 * ⚠️ IMPORTANTE: Este archivo NO usa 'use cache'
 * El cache se maneja en la API Route, no aquí, porque este código
 * puede ser importado desde Client Components.
 */

/**
 * Fetch genérico para endpoints GET (datos estáticos)
 * Construye query string y hace request GET
 */
async function fetchStatic<T>(
  action: string,
  params?: Record<string, string | number>,
): Promise<T> {
  // Construir query string
  const searchParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value.toString());
    });
  }

  const queryString = searchParams.toString();
  const url = `/api/bus/${action}${queryString ? `?${queryString}` : ""}`;

  console.log(`📡 [GET] ${url}`);

  const response = await fetch(url, {
    method: "GET",
    // El navegador cachea automáticamente GET
    // TanStack Query añadirá su propia capa de cache
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      errorData.error || `Error ${response.status}: ${response.statusText}`,
    );
  }

  const data: APIResponse<T> = await response.json();
  return data.resultado as T;
}

/**
 * Fetch genérico para endpoints POST (datos dinámicos)
 * Envía params en el body como JSON
 */
async function fetchDynamic<T>(
  action: string,
  params: Record<string, string | number>,
): Promise<T> {
  const url = `/api/bus/${action}`;

  console.log(`📡 [POST] ${url}`, params);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ params }),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      errorData.error || `Error ${response.status}: ${response.statusText}`,
    );
  }

  const data: APIResponse<T> = await response.json();
  return data.resultado as T;
}

// === MÉTODOS ESPECÍFICOS ===

export const busService = {
  /**
   * 🚌 Obtener todas las líneas disponibles
   * Método: GET (datos casi estáticos, cachea 24h)
   * Endpoint: GET /api/bus/lineas
   */
  async fetchLines(): Promise<LineasResponse> {
    return fetchStatic<LineasResponse>("lineas");
  },

  /**
   * 🛣️ Obtener calles por línea
   * Método: GET (datos casi estáticos, cachea 24h)
   * Endpoint: GET /api/bus/calles?codLinea=XXX
   */
  async fetchStreets(codigoLinea: string): Promise<CallesResponse> {
    return fetchStatic<CallesResponse>("calles", {
      codLinea: codigoLinea,
    });
  },

  /**
   * 🔀 Obtener intersecciones por línea y calle
   * Método: GET (datos casi estáticos, cachea 24h)
   * Endpoint: GET /api/bus/intersecciones?codLinea=XXX&codCalle=YYY
   */
  async fetchIntersections(
    codigoLinea: string,
    codigoCalle: string,
  ): Promise<InterseccionesResponse> {
    return fetchStatic<InterseccionesResponse>("intersecciones", {
      codLinea: codigoLinea,
      codCalle: codigoCalle,
    });
  },

  /**
   * 📍 Obtener paradas por línea, calle e intersección
   * Método: GET (datos casi estáticos, cachea 24h)
   * Endpoint: GET /api/bus/paradas?codLinea=XXX&codCalle=YYY&codInterseccion=ZZZ
   */
  async fetchStops(
    codigoLinea: string,
    codigoCalle: string,
    codigoInterseccion: string,
  ): Promise<ParadasResponse> {
    return fetchStatic<ParadasResponse>("paradas", {
      codLinea: codigoLinea,
      codCalle: codigoCalle,
      codInterseccion: codigoInterseccion,
    });
  },

  /**
   * ⏱️ Obtener arribos de una parada
   * Método: POST (datos en tiempo real, cachea 1min)
   * Endpoint: POST /api/bus/arribos
   */
  async fetchArrivals(
    identificadorParada: string,
    codigoLineaParada: string,
  ): Promise<ArribosResponse> {
    return fetchDynamic<ArribosResponse>("arribos", {
      identificadorParada,
      codigoLineaParada,
    });
  },

  /**
   * 🗺️ Obtener recorrido completo de una línea para mostrar en el mapa
   * Método: GET (datos estáticos, cachea 24h)
   * Endpoint: GET /api/bus/recorrido?codLinea=XXX&isSublinea=0
   */
  async fetchRecorrido(
    codigoLinea: string,
    isSublinea: number = 0,
  ): Promise<RecorridoResponse> {
    return fetchStatic<RecorridoResponse>("recorrido", {
      codLinea: codigoLinea,
      isSublinea,
    });
  },
};
