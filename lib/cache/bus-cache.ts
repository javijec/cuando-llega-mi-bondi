// lib/cache/bus-cache.ts
"use server";

import { cacheLife, cacheTag } from "next/cache";
import { TTL_MAP, DEFAULT_TTL } from "@/lib/constants/cache";

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
