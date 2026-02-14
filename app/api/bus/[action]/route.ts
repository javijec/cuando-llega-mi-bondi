// app/api/bus/[action]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cacheLife, cacheTag } from 'next/cache';
import type { APIResponse } from '@/lib/types/bus';

// 🔐 Helper para validar variables de entorno
function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Falta variable de entorno: ${key}`);
  }
  return value;
}

// Variables de entorno validadas
const API_URL = getEnvVar('MUNI_API_URL');
const ORIGIN = getEnvVar('MUNI_ORIGIN');
const REFERER = getEnvVar('MUNI_REFERER');

// ⏱️ TTL por tipo de acción (en segundos)
const TTL_MAP: Record<string, number> = {
  lineas: 86400,         // 24 horas - casi estático
  calles: 86400,         // 24 horas - casi estático
  intersecciones: 86400, // 24 horas - casi estático
  paradas: 86400,        // 24 horas - casi estático
  recorrido: 86400,      // 24 horas - estático
  arribos: 60,           // 1 minuto - dinámico
};

// 🗺️ Mapeo de acciones simplificadas a nombres de API de la muni
const ACTION_TO_API_MAP: Record<string, string> = {
  lineas: 'RecuperarLineaPorCuandoLlega',
  calles: 'RecuperarCallesPrincipalPorLinea',
  intersecciones: 'RecuperarInterseccionPorLineaYCalle',
  paradas: 'RecuperarParadasConBanderaPorLineaCalleEInterseccion',
  recorrido: 'RecuperarRecorridoParaMapaAbrevYAmpliPorEntidadYLinea',
  arribos: 'RecuperarProximosArribosW',
};

// 📝 Validación de acciones
const STATIC_ACTIONS = ['lineas', 'calles', 'intersecciones', 'paradas', 'recorrido'];
const DYNAMIC_ACTIONS = ['arribos'];

/**
 * ✅ Función con 'use cache' - SOLO corre en el servidor
 * Esta función NUNCA se importa en Client Components
 * 
 * @param accion - Tipo de acción (lineas, calles, etc.)
 * @param params - Parámetros para la API de la muni
 * @param ttl - Time to live para el cache
 * @returns Datos de la API de la muni
 */
async function fetchMuniAPI(
  accion: string,
  params: Record<string, string>,
  ttl: number
) {
  'use cache'
  
  // Aplicar perfil de cache según el tipo de dato
  if (ttl > 3600) {
    cacheLife('static'); // Usa el perfil 'static' del next.config.ts (24h)
  } else {
    cacheLife('realtime'); // Usa el perfil 'realtime' del next.config.ts (1min)
  }
  
  // Tag para invalidación manual si es necesario
  cacheTag(`bus-${accion}`);
  
  const accionAPI = ACTION_TO_API_MAP[accion];
  
  if (!accionAPI) {
    throw new Error(`Acción desconocida: ${accion}`);
  }

  // Construir FormData para la API de la muni (usa POST)
  const formData = new URLSearchParams();
  formData.append('accion', accionAPI);

  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, value);
  });

  console.log(`🌐 [MUNI API CALL] ${accionAPI} - ${new Date().toISOString()}`);
  console.log(`📊 Params:`, params);

  // 🚀 Fetch a la API de la muni
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'User-Agent': 'Mozilla/5.0',
      Origin: ORIGIN,
      Referer: REFERER,
    },
    body: formData,
    // ✨ CACHE NATIVO DE NEXT.JS (capa adicional a 'use cache')
    next: {
      revalidate: ttl > 0 ? ttl : false,
      tags: [`muni-${accion}`],
    },
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

  console.log(`✅ [MUNI SUCCESS] ${accionAPI}`);

  return cleanJson;
}

/**
 * ✅ GET - Para datos ESTÁTICOS (líneas, calles, paradas, etc.)
 * Aprovecha Vercel CDN con Cache-Control headers
 * 
 * Endpoints:
 * - GET /api/bus/lineas
 * - GET /api/bus/calles?codLinea=501
 * - GET /api/bus/intersecciones?codLinea=501&codCalle=123
 * - GET /api/bus/paradas?codLinea=501&codCalle=123&codInterseccion=456
 * - GET /api/bus/recorrido?codLinea=501&isSublinea=0
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  try {
    const { action } = await params;

    // Validar que sea una acción estática
    if (!STATIC_ACTIONS.includes(action)) {
      return NextResponse.json(
        { 
          error: `La acción "${action}" debe usar POST. Solo se permiten GET para: ${STATIC_ACTIONS.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Extraer parámetros de query string
    const searchParams = request.nextUrl.searchParams;
    const apiParams: Record<string, string> = {};
    
    searchParams.forEach((value, key) => {
      apiParams[key] = value;
    });

    const ttl = TTL_MAP[action] ?? 86400;

    // ✅ Llamar a la función con 'use cache'
    // Esta función SOLO corre en el servidor
    const resultado = await fetchMuniAPI(action, apiParams, ttl);

    // 🔥 Headers que hacen que Vercel CDN cachee la respuesta
    return NextResponse.json<APIResponse<unknown>>(
      { resultado },
      {
        headers: {
          // Cache público para Vercel CDN y navegador
          'Cache-Control': `public, s-maxage=${ttl}, stale-while-revalidate=${ttl * 2}`,
          // Cache específico para Vercel CDN (no afecta al navegador)
          'CDN-Cache-Control': `public, s-maxage=${ttl}`,
          // Para debugging
          'X-Cache-TTL': ttl.toString(),
          'X-Action': action,
        },
      }
    );
  } catch (error) {
    console.error('❌ ERROR API GET:', error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error en el servidor' },
      { status: 500 }
    );
  }
}

/**
 * ⚡ POST - Para datos DINÁMICOS (arribos en tiempo real)
 * No se cachea en CDN (POST no es cacheable en CDN), pero sí en servidor
 * 
 * Endpoint:
 * - POST /api/bus/arribos
 *   Body: { "params": { "identificadorParada": "123", "codigoLineaParada": "501" } }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }>}
) {
  try {
    const { action } = await params;

    // Validar que sea una acción dinámica
    if (!DYNAMIC_ACTIONS.includes(action)) {
      return NextResponse.json(
        { 
          error: `La acción "${action}" debe usar GET. Solo se permite POST para: ${DYNAMIC_ACTIONS.join(', ')}` 
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const apiParams: Record<string, string> = body.params || {};

    const ttl = TTL_MAP[action] ?? 60;

    // ✅ Llamar a la función con 'use cache'
    const resultado = await fetchMuniAPI(action, apiParams, ttl);

    // Cache corto solo en servidor (no en CDN porque es POST)
    return NextResponse.json<APIResponse<unknown>>(
      { resultado },
      {
        headers: {
          // Cache en servidor, pero no tan agresivo
          'Cache-Control': `public, s-maxage=${ttl}, stale-while-revalidate=30`,
          'X-Cache-TTL': ttl.toString(),
          'X-Action': action,
        },
      }
    );
  } catch (error) {
    console.error('❌ ERROR API POST:', error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error en el servidor' },
      { status: 500 }
    );
  }
}