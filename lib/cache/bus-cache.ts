// lib/cache/bus-cache.ts
"use server";

import { cacheLife, cacheTag } from "next/cache";
import { TTL_MAP, DEFAULT_TTL } from "@/lib/constants/cache";
import type {
  Calle,
  CallesResponse,
  Interseccion,
  InterseccionesResponse,
  Linea,
  LineasResponse,
  NearbyStop,
  Parada,
  ParadaLineaRelacion,
  ParadasResponse,
  PuntoRecorrido,
  RecorridoResponse,
} from "@/lib/types/bus";

// 🔐 Helper para validar variables de entorno
function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Falta variable de entorno: ${key}`);
  }
  return value;
}

// Variables de entorno validadas
const API_URL = getEnvVar("MUNI_API_URL");
const ORIGIN = getEnvVar("MUNI_ORIGIN");
const REFERER = getEnvVar("MUNI_REFERER");
const ARRIBOS_BLOCK_WINDOW_MS = 60_000
const ARRIBOS_STALE_WINDOW_MS = 2 * 60_000

type CachedArribosEntry = {
  data: unknown
  expiresAt: number
}

class UpstreamAPIError extends Error {
  status: number
  retryAfter: number | null

  constructor(message: string, status: number, retryAfter: number | null = null) {
    super(message)
    this.name = "UpstreamAPIError"
    this.status = status
    this.retryAfter = retryAfter
  }
}

const arrivalsBlockedUntil = new Map<string, number>()
const arrivalsStaleCache = new Map<string, CachedArribosEntry>()

// 🗺️ Mapeo de acciones simplificadas a nombres de API de la muni
const ACTION_TO_API_MAP: Record<string, string> = {
  lineas: "RecuperarLineaPorCuandoLlega",
  calles: "RecuperarCallesPrincipalPorLinea",
  intersecciones: "RecuperarInterseccionPorLineaYCalle",
  paradas: "RecuperarParadasConBanderaPorLineaCalleEInterseccion",
  recorrido: "RecuperarRecorridoParaMapaAbrevYAmpliPorEntidadYLinea",
  arribos: "RecuperarProximosArribosW",
};

function buildArribosCacheKey(params: Record<string, string>): string {
  return Object.entries(params)
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, value]) => `${key}:${value}`)
    .join("|")
}

function getCachedArribos(key: string): unknown | null {
  const cached = arrivalsStaleCache.get(key)

  if (!cached) {
    return null
  }

  if (cached.expiresAt <= Date.now()) {
    arrivalsStaleCache.delete(key)
    return null
  }

  return cached.data
}

function setCachedArribos(key: string, data: unknown): void {
  arrivalsStaleCache.set(key, {
    data,
    expiresAt: Date.now() + ARRIBOS_STALE_WINDOW_MS,
  })
}

/**
 * ✅ Función con 'use cache' - SOLO corre en el servidor
 * Esta función NUNCA se importa en Client Components
 *
 * @param accion - Tipo de acción (lineas, calles, etc.)
 * @param params - Parámetros para la API de la muni
 * @returns Datos de la API de la muni
 */
export async function fetchMuniAPICached(
  accion: string,
  params: Record<string, string>,
) {
  "use cache";

  const ttl = TTL_MAP[accion] ?? DEFAULT_TTL;

  // Aplicar perfil de cache según el tipo de dato
  if (ttl > 3600) {
    cacheLife("static"); // Usa el perfil 'static' del next.config.ts (24h)
  } else {
    cacheLife("realtime"); // Usa el perfil 'realtime' del next.config.ts (1min)
  }

  // Tag para invalidación manual si es necesario
  cacheTag(`bus-${accion}`);

  if (accion === "parada-lineas") {
    const stopParams = params as unknown as FindLinesByStopParams;
    return await findLinesByStop(stopParams);
  }

  const accionAPI = ACTION_TO_API_MAP[accion];

  if (!accionAPI) {
    throw new Error(`Acción desconocida: ${accion}`);
  }

  // Construir FormData para la API de la muni (usa POST)
  const formData = new URLSearchParams();
  formData.append("accion", accionAPI);

  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, value);
  });

  const isArribos = accion === "arribos"
  const arribosCacheKey = isArribos ? buildArribosCacheKey(params) : null

  if (isArribos && arribosCacheKey) {
    const blockedUntil = arrivalsBlockedUntil.get(arribosCacheKey) ?? 0

    if (blockedUntil > Date.now()) {
      const cached = getCachedArribos(arribosCacheKey)

      if (cached) {
        return cached
      }

      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((blockedUntil - Date.now()) / 1000),
      )

      throw new UpstreamAPIError(
        "La API bloqueó temporalmente consultas repetidas. Esperá un momento y reintentá.",
        403,
        retryAfterSeconds,
      )
    }
  }

  if (process.env.NODE_ENV === "development") {
    console.log(
      `🌐 [MUNI API CALL] ${accionAPI} - ${new Date().toISOString()}`,
    );
    console.log(`📊 Params:`, params);
  }

  // 🚀 Fetch a la API de la muni
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Accept: "application/json, text/javascript, */*; q=0.01",
      "Accept-Language": "es-AR,es;q=0.9",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "X-Requested-With": "XMLHttpRequest",
      Origin: ORIGIN,
      Referer: REFERER,
      Host: new URL(API_URL).host,
      "Sec-Fetch-Site": "same-site",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Dest": "empty",
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    console.error(
      `❌ MUNI API HTTP ${response.status} ${response.statusText}: ${errorText}`,
    );

    if (isArribos && arribosCacheKey && response.status === 403) {
      arrivalsBlockedUntil.set(arribosCacheKey, Date.now() + ARRIBOS_BLOCK_WINDOW_MS)

      const cached = getCachedArribos(arribosCacheKey)
      if (cached) {
        return cached
      }

      throw new UpstreamAPIError(
        "La API bloqueó temporalmente consultas repetidas. Esperá un minuto y reintentá.",
        403,
        Math.ceil(ARRIBOS_BLOCK_WINDOW_MS / 1000),
      )
    }

    throw new UpstreamAPIError(
      `API error: ${response.status} ${response.statusText}`,
      response.status,
    )
  }

  const rawText = await response.text();

  // Intentar parsear JSON
  let cleanJson;
  try {
    cleanJson = JSON.parse(rawText);
  } catch {
    cleanJson = rawText;
  }

  if (process.env.NODE_ENV === "development") {
    console.log(`✅ [MUNI SUCCESS] ${accionAPI}`);
  }

  if (isArribos && arribosCacheKey) {
    arrivalsBlockedUntil.delete(arribosCacheKey)
    setCachedArribos(arribosCacheKey, cleanJson)
  }

  return cleanJson;
}

const stripCity = (value: string): string =>
  value.replace(" - MAR DEL PLATA", "");
const normalizeText = (value: string): string =>
  stripCity(value).trim().toLocaleLowerCase("es");

function getIntersectionItems(
  response: InterseccionesResponse,
): Interseccion[] {
  return [...(response.intersecciones ?? []), ...(response.calles ?? [])];
}

function parseRouteStopDescription(description: string): string {
  const parts = description.split(";").map((part) => part.trim()).filter(Boolean)

  return parts[2] ?? parts[1] ?? description
}

async function mapWithConcurrencyLimit<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex++;
      results[currentIndex] = await mapper(items[currentIndex]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker()),
  );

  return results;
}

interface FindLinesByStopParams {
  identificadorParada: string;
  calleDescripcion: string;
  interseccionDescripcion: string;
}

async function findMatchingStopForLine(
  linea: Linea,
  identificadorParada: string,
  normalizedCalle: string,
  normalizedInterseccion: string,
): Promise<ParadaLineaRelacion | null> {
  const calles = (await fetchMuniAPICached("calles", {
    codLinea: linea.CodigoLineaParada,
  })) as CallesResponse;

  const calle = calles.calles?.find(
    (item: Calle) => normalizeText(item.Descripcion) === normalizedCalle,
  );

  if (!calle) {
    return null;
  }

  const intersecciones = (await fetchMuniAPICached("intersecciones", {
    codLinea: linea.CodigoLineaParada,
    codCalle: calle.Codigo,
  })) as InterseccionesResponse;

  const interseccion = getIntersectionItems(intersecciones).find(
    (item) => normalizeText(item.Descripcion) === normalizedInterseccion,
  );

  if (!interseccion) {
    return null;
  }

  const paradas = (await fetchMuniAPICached("paradas", {
    codLinea: linea.CodigoLineaParada,
    codCalle: calle.Codigo,
    codInterseccion: interseccion.Codigo,
  })) as ParadasResponse;

  const parada = paradas.paradas?.find(
    (item: Parada) => item.Identificador === identificadorParada,
  );

  if (!parada) {
    return null;
  }

  return { linea, parada };
}

export async function findLinesByStop({
  identificadorParada,
  calleDescripcion,
  interseccionDescripcion,
}: FindLinesByStopParams): Promise<ParadaLineaRelacion[]> {
  "use cache";

  cacheLife("static");
  cacheTag("bus-parada-lineas");

  if (!identificadorParada || !calleDescripcion || !interseccionDescripcion) {
    return [];
  }

  const normalizedCalle = normalizeText(calleDescripcion);
  const normalizedInterseccion = normalizeText(interseccionDescripcion);

  const lineas = (await fetchMuniAPICached("lineas", {})) as LineasResponse;

  const matches = await mapWithConcurrencyLimit(
    lineas.lineas ?? [],
    4,
    async (linea) =>
      findMatchingStopForLine(
        linea,
        identificadorParada,
        normalizedCalle,
        normalizedInterseccion,
      ),
  );

  return matches.filter(
    (match): match is ParadaLineaRelacion => match !== null,
  );
}

export async function fetchAllRouteStopsCached(): Promise<Omit<NearbyStop, "distanciaMetros">[]> {
  "use cache";

  cacheLife("static");
  cacheTag("bus-nearby-stops");

  const lineas = (await fetchMuniAPICached("lineas", {})) as LineasResponse;

  const routeStopsByKey = new Map<string, Omit<NearbyStop, "distanciaMetros">>()

  await mapWithConcurrencyLimit(lineas.lineas ?? [], 4, async (linea) => {
    const recorrido = (await fetchMuniAPICached("recorrido", {
      codLinea: linea.CodigoLineaParada,
      isSublinea: "0",
    })) as RecorridoResponse

    ;(recorrido.puntos ?? [])
      .filter((punto: PuntoRecorrido) => punto.IsPuntoPaso)
      .forEach((punto) => {
        const key = [
          linea.CodigoLineaParada,
          punto.AbreviaturaBanderaSMP,
          punto.Latitud.toFixed(6),
          punto.Longitud.toFixed(6),
        ].join(":")

        if (routeStopsByKey.has(key)) {
          return
        }

        routeStopsByKey.set(key, {
          id: key,
          codigoLineaParada: linea.CodigoLineaParada,
          nombreLinea: linea.Descripcion,
          bandera: punto.AbreviaturaBanderaSMP,
          descripcion: parseRouteStopDescription(punto.Descripcion),
          latitud: punto.Latitud,
          longitud: punto.Longitud,
        })
      })
  })

  return Array.from(routeStopsByKey.values())
}
