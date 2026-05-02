import { NextRequest, NextResponse } from "next/server";
import { findLinesByStop } from "@/lib/cache/bus-cache";
import type { APIResponse, ParadaLineasResponse } from "@/lib/types/bus";
import { TTL_MAP, DEFAULT_TTL } from "@/lib/constants/cache";

export async function GET(request: NextRequest) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const identificadorParada = searchParams.get("identificadorParada") ?? "";
    const calleDescripcion = searchParams.get("calleDescripcion") ?? "";
    const interseccionDescripcion =
      searchParams.get("interseccionDescripcion") ?? "";

    if (!identificadorParada || !calleDescripcion || !interseccionDescripcion) {
      return NextResponse.json(
        {
          error:
            "Faltan parámetros requeridos: identificadorParada, calleDescripcion e interseccionDescripcion",
        },
        { status: 400 },
      );
    }

    const resultado = await findLinesByStop({
      identificadorParada,
      calleDescripcion,
      interseccionDescripcion,
    });

    const ttl = TTL_MAP["parada-lineas"] ?? DEFAULT_TTL;

    const payload: ParadaLineasResponse = {
      CodigoEstado: 0,
      MensajeEstado: "ok",
      lineas: resultado,
    };

    return NextResponse.json<APIResponse<ParadaLineasResponse>>(
      { resultado: payload },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${ttl}, stale-while-revalidate=${ttl * 2}`,
          "CDN-Cache-Control": `public, s-maxage=${ttl}`,
          "X-Cache-TTL": ttl.toString(),
          "X-Action": "parada-lineas",
        },
      },
    );
  } catch (error) {
    console.error("❌ ERROR API GET parada-lineas:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error en el servidor",
      },
      { status: 500 },
    );
  }
}
