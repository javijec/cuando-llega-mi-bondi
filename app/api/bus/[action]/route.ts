// app/api/bus/[action]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchMuniAPICached } from "@/lib/cache/bus-cache";
import {
  TTL_MAP,
  DEFAULT_TTL,
  STATIC_ACTIONS,
  DYNAMIC_ACTIONS,
} from "@/lib/constants/cache";
import type { APIResponse } from "@/lib/types/bus";

/**
 * ✅ GET - Para datos ESTÁTICOS (líneas, calles, paradas, etc.)
 * Aprovecha Vercel CDN con Cache-Control headers
 *
 * Endpoints:
 * - GET /api/bus/lineas
 * - GET /api/bus/calles?codLinea=501
 * - GET /api/bus/intersecciones?codLinea=501&codCalle=123
 * - GET /api/bus/paradas?codLinea=501&codCalle=123&codInterseccion=456
 * - GET /api/bus/parada-lineas?identificadorParada=XXX&calleDescripcion=YYY&interseccionDescripcion=ZZZ
 * - GET /api/bus/recorrido?codLinea=501&isSublinea=0
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> },
) {
  try {
    const { action } = await params;

    // Validar que sea una acción estática
    if (!STATIC_ACTIONS.includes(action as (typeof STATIC_ACTIONS)[number])) {
      return NextResponse.json(
        {
          error: `La acción "${action}" debe usar POST. Solo se permiten GET para: ${STATIC_ACTIONS.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Extraer parámetros de query string
    const searchParams = request.nextUrl.searchParams;
    const apiParams: Record<string, string> = {};

    searchParams.forEach((value, key) => {
      apiParams[key] = value;
    });

    const ttl = TTL_MAP[action] ?? DEFAULT_TTL;

    // ✅ Llamar a la función cacheada desde lib/cache/
    // El 'use cache' está en el archivo separado, no aquí
    const resultado = await fetchMuniAPICached(action, apiParams);

    // 🔥 Headers que hacen que Vercel CDN cachee la respuesta
    return NextResponse.json<APIResponse<unknown>>(
      { resultado },
      {
        headers: {
          // Cache público para Vercel CDN y navegador
          "Cache-Control": `public, s-maxage=${ttl}, stale-while-revalidate=${ttl * 2}`,
          // Cache específico para Vercel CDN (no afecta al navegador)
          "CDN-Cache-Control": `public, s-maxage=${ttl}`,
          // Para debugging
          "X-Cache-TTL": ttl.toString(),
          "X-Action": action,
        },
      },
    );
  } catch (error) {
    console.error("❌ ERROR API GET:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error en el servidor",
      },
      { status: 500 },
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
  { params }: { params: Promise<{ action: string }> },
) {
  try {
    const { action } = await params;

    // Validar que sea una acción dinámica
    if (!DYNAMIC_ACTIONS.includes(action as (typeof DYNAMIC_ACTIONS)[number])) {
      return NextResponse.json(
        {
          error: `La acción "${action}" debe usar GET. Solo se permite POST para: ${DYNAMIC_ACTIONS.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const body = await request.json();
    const apiParams: Record<string, string> = body.params || {};

    const ttl = TTL_MAP[action] ?? 60;

    // ✅ Llamar a la función cacheada desde lib/cache/
    const resultado = await fetchMuniAPICached(action, apiParams);

    // Cache corto solo en servidor (no en CDN porque es POST)
    return NextResponse.json<APIResponse<unknown>>(
      { resultado },
      {
        headers: {
          // Cache en servidor, pero no tan agresivo
          "Cache-Control": `public, s-maxage=${ttl}, stale-while-revalidate=30`,
          "X-Cache-TTL": ttl.toString(),
          "X-Action": action,
        },
      },
    );
  } catch (error) {
    console.error("❌ ERROR API POST:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error en el servidor",
      },
      { status: 500 },
    );
  }
}
