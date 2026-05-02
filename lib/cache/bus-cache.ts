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
  Parada,
  ParadaLineaRelacion,
  ParadasResponse,
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

// 🗺️ Mapeo de acciones simplificadas a nombres de API de la muni
const ACTION_TO_API_MAP: Record<string, string> = {
  lineas: "RecuperarLineaPorCuandoLlega",
  calles: "RecuperarCallesPrincipalPorLinea",
  intersecciones: "RecuperarInterseccionPorLineaYCalle",
  paradas: "RecuperarParadasConBanderaPorLineaCalleEInterseccion",
  recorrido: "RecuperarRecorridoParaMapaAbrevYAmpliPorEntidadYLinea",
  arribos: "RecuperarProximosArribosW",
};

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
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "User-Agent": "Mozilla/5.0",
      Origin: ORIGIN,
      Referer: REFERER,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
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

  return cleanJson;
}

const stripCity = (value: string): string => value.replace(" - MAR DEL PLATA", "");
const normalizeText = (value: string): string =>
  stripCity(value).trim().toLocaleLowerCase("es");

function getIntersectionItems(
  response: InterseccionesResponse,
): Interseccion[] {
  return [...(response.intersecciones ?? []), ...(response.calles ?? [])];
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

  return matches.filter((match): match is ParadaLineaRelacion => match !== null);
}
