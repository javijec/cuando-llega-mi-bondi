// app/api/revalidate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

/**
 * 🔄 Endpoint para revalidar el caché de Next.js
 *
 * Uso:
 * POST /api/revalidate
 * Body: { "tag": "bus-lineas" }
 *
 * O para múltiples tags:
 * POST /api/revalidate
 * Body: { "tags": ["bus-lineas", "bus-calles"] }
 *
 * Tags disponibles:
 * - bus-lineas
 * - bus-calles
 * - bus-intersecciones
 * - bus-paradas
 * - bus-recorrido
 * - bus-arribos
 */

export async function POST(request: NextRequest) {
  try {
    // Validar API key si está configurada (opcional pero recomendado)
    const apiKey = request.headers.get("x-api-key");
    const expectedApiKey = process.env.REVALIDATE_API_KEY;

    if (expectedApiKey && apiKey !== expectedApiKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Revalidar un solo tag
    if (body.tag) {
      revalidateTag(body.tag, "max");
      console.log(`✅ [REVALIDATE] Tag: ${body.tag}`);

      return NextResponse.json({
        success: true,
        message: `Tag '${body.tag}' revalidated`,
        timestamp: new Date().toISOString(),
      });
    }

    // Revalidar múltiples tags
    if (body.tags && Array.isArray(body.tags)) {
      body.tags.forEach((tag: string) => {
        revalidateTag(tag, "max");
        console.log(`✅ [REVALIDATE] Tag: ${tag}`);
      });

      return NextResponse.json({
        success: true,
        message: `${body.tags.length} tags revalidated`,
        tags: body.tags,
        timestamp: new Date().toISOString(),
      });
    }

    // Revalidar todos los tags de bus (opción "all")
    if (body.all === true) {
      const allTags = [
        "bus-lineas",
        "bus-calles",
        "bus-intersecciones",
        "bus-paradas",
        "bus-recorrido",
        "bus-arribos",
      ];
      allTags.forEach((tag) => {
        revalidateTag(tag, "max");
        console.log(`✅ [REVALIDATE] Tag: ${tag}`);
      });

      return NextResponse.json({
        success: true,
        message: "All bus tags revalidated",
        tags: allTags,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      {
        error: 'Invalid request. Provide "tag", "tags", or "all: true"',
        example: {
          single: { tag: "bus-lineas" },
          multiple: { tags: ["bus-lineas", "bus-calles"] },
          all: { all: true },
        },
      },
      { status: 400 },
    );
  } catch (error) {
    console.error("❌ [REVALIDATE ERROR]:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Error revalidating cache",
      },
      { status: 500 },
    );
  }
}

/**
 * GET - Status del endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Revalidation endpoint active",
    usage: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "optional - set REVALIDATE_API_KEY env var",
      },
      body: {
        single: { tag: "bus-lineas" },
        multiple: { tags: ["bus-lineas", "bus-calles"] },
        all: { all: true },
      },
    },
  });
}
