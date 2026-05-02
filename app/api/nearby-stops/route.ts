import { NextRequest, NextResponse } from "next/server";
import { fetchAllRouteStopsCached } from "@/lib/cache/bus-cache";
import type { APIResponse, NearbyStop, NearbyStopsResponse } from "@/lib/types/bus";

const DEFAULT_RADIUS_METERS = 1000
const MAX_RESULTS = 30

function toRadians(value: number): number {
  return (value * Math.PI) / 180
}

function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const earthRadiusMeters = 6371000
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  const startLat = toRadians(lat1)
  const endLat = toRadians(lat2)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(startLat) * Math.cos(endLat) * Math.sin(dLon / 2) ** 2

  return earthRadiusMeters * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = Number(searchParams.get("lat"))
    const lng = Number(searchParams.get("lng"))
    const radius = Number(searchParams.get("radius") ?? DEFAULT_RADIUS_METERS)

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json(
        { error: "Parámetros lat y lng inválidos" },
        { status: 400 },
      )
    }

    const safeRadius =
      Number.isFinite(radius) && radius > 0 ? Math.min(radius, 5000) : DEFAULT_RADIUS_METERS

    const routeStops = await fetchAllRouteStopsCached()

    const nearbyStops = routeStops
      .map((stop) => {
        const distanciaMetros = Math.round(
          calculateDistanceMeters(lat, lng, stop.latitud, stop.longitud),
        )

        return {
          ...stop,
          distanciaMetros,
        } satisfies NearbyStop
      })
      .filter((stop) => stop.distanciaMetros <= safeRadius)
      .sort((a, b) => a.distanciaMetros - b.distanciaMetros)
      .slice(0, MAX_RESULTS)

    return NextResponse.json<APIResponse<NearbyStopsResponse>>(
      { resultado: { paradas: nearbyStops } },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
          "CDN-Cache-Control": "public, s-maxage=3600",
          "X-Nearby-Radius": safeRadius.toString(),
        },
      },
    )
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      error.digest === "NEXT_PRERENDER_INTERRUPTED"
    ) {
      throw error
    }

    console.error("❌ ERROR API NEARBY STOPS:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error en el servidor",
      },
      { status: 500 },
    )
  }
}
