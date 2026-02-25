// lib/cache/bus-cache.ts
"use server"

import { cacheLife, cacheTag } from "next/cache"
import { TTL_MAP, DEFAULT_TTL } from "@/lib/constants/cache"

// 🔐 Helper para validar variables de entorno
function getEnvVar(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`❌ Falta variable de entorno: ${key}`)
  }
  return value
}

// 🗺️ Mapeo de acciones simplificadas a nombres de API de la muni
const ACTION_TO_API_MAP: Record<string, string> = {
  lineas: "RecuperarLineaPorCuandoLlega",
  calles: "RecuperarCallesPrincipalPorLinea",
  intersecciones: "RecuperarInterseccionPorLineaYCalle",
  paradas: "RecuperarParadasConBanderaPorLineaCalleEInterseccion",
  recorrido: "RecuperarRecorridoParaMapaAbrevYAmpliPorEntidadYLinea",
  arribos: "RecuperarProximosArribosW",
}

/**
 * ✅ Función con 'use cache' - SOLO corre en el servidor
 * Esta función NUNCA se importa en Client Components
 *
 * @param accion - Tipo de acción (lineas, calles, etc.)
 * @param params - Parámetros para la API de la muni
 * @returns Datos de la API de la muni con metadata de cache
 */
export async function fetchMuniAPICached(
  accion: string,
  params: Record<string, string>,
): Promise<{ data: unknown; _cachedAt: string }> {
  "use cache"

  // ✅ Validar accion primero, antes de configurar el cache
  const accionAPI = ACTION_TO_API_MAP[accion]
  if (!accionAPI) {
    throw new Error(`Acción desconocida: ${accion}`)
  }

  // Aplicar perfil de cache según el tipo de dato
  const ttl = TTL_MAP[accion] ?? DEFAULT_TTL
  if (ttl > 3600) {
    cacheLife({ stale: 86400, revalidate: 86400, expire: 604800 }) // 24h - datos estáticos
  } else {
    cacheLife({ stale: 30, revalidate: 60, expire: 120 }) // 1min - arribos en tiempo real
  }

  // Tag para invalidación manual si es necesario
  cacheTag(`bus-${accion}`)

  // ✅ Timestamp "congelado" - si el cache funciona, este valor no cambia entre requests
  // En Vercel Logs: si ves este log pocas veces → cache funcionando ✅
  //                 si aparece en cada request   → cache NO funciona  ❌
  const cachedAt = new Date().toISOString()
  console.log(`🕐 [CACHE MISS] accion=${accion} | cachedAt=${cachedAt}`)

  // ✅ Env vars dentro de la función para evitar fallos silenciosos en build time
  const API_URL = getEnvVar("MUNI_API_URL")
  const ORIGIN = getEnvVar("MUNI_ORIGIN")
  const REFERER = getEnvVar("MUNI_REFERER")

  // Construir FormData para la API de la muni (usa POST)
  const formData = new URLSearchParams()
  formData.append("accion", accionAPI)

  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, value)
  })

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
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }

  const rawText = await response.text()

  // Intentar parsear JSON
  let cleanJson: unknown
  try {
    cleanJson = JSON.parse(rawText)
  } catch {
    cleanJson = rawText
  }

  console.log(`✅ [CACHE MISS RESOLVED] accion=${accion} | cachedAt=${cachedAt}`)

  // ✅ _cachedAt viene en la respuesta para verificar desde el cliente o logs
  // Si el valor no cambia entre requests → el cache está funcionando
  return { data: cleanJson, _cachedAt: cachedAt }
}