import { useMemo } from "react";
import { useRecorrido } from "@/lib/hooks/useBusQuery";
import type { Linea, PuntoRecorrido } from "@/lib/types/bus";

const collator = new Intl.Collator("es", { sensitivity: "base" });

export interface Bandera {
  codigo: string;
  descripcion: string;
}

function parsearDescripcion(descripcion: string): string {
  const partes = descripcion.split(";");
  if (partes.length >= 2) {
    return partes[1].trim();
  }
  return descripcion;
}

export function useRecorridos(
  lineas: Linea[],
  lineaSeleccionada: string | null,
  banderaSeleccionada: string | null,
) {
  const recorridoQuery = useRecorrido(lineaSeleccionada ?? "", 0);

  const lineaInfo = useMemo(
    () =>
      lineas.find(
        (l) => l.CodigoLineaParada === lineaSeleccionada,
      ),
    [lineas, lineaSeleccionada],
  );

  const banderasDisponibles = useMemo(() => {
    const puntos = recorridoQuery.data?.puntos ?? [];
    const mapa = new Map<string, string>();

    puntos.forEach((p) => {
      if (!mapa.has(p.AbreviaturaBanderaSMP)) {
        mapa.set(p.AbreviaturaBanderaSMP, parsearDescripcion(p.Descripcion));
      }
    });

    const banderaList: Bandera[] = Array.from(mapa.entries()).map(([codigo, descripcion]) => ({
      codigo,
      descripcion,
    }));

    return banderaList.sort((a, b) => collator.compare(a.descripcion, b.descripcion));
  }, [recorridoQuery.data]);

  const banderaEfectiva = useMemo(() => {
    if (banderaSeleccionada) {
      const encontrada = banderasDisponibles.find((b) => b.codigo === banderaSeleccionada);
      if (encontrada) return encontrada;
    }
    return banderasDisponibles[0] ?? null;
  }, [banderaSeleccionada, banderasDisponibles]);

  const puntosFiltrados: PuntoRecorrido[] = useMemo(() => {
    const todosLosPuntos = recorridoQuery.data?.puntos ?? [];
    
    if (!banderaEfectiva) {
      return [];
    }
    
    return todosLosPuntos.filter(
      (p) => p.AbreviaturaBanderaSMP === banderaEfectiva.codigo
    );
  }, [recorridoQuery.data, banderaEfectiva]);

  return {
    lineaInfo,
    banderaEfectiva,
    banderasDisponibles,
    puntosFiltrados,
    puntosTotales: recorridoQuery.data?.puntos ?? [],
    isLoading: {
      recorrido: recorridoQuery.isLoading,
    },
    error: {
      recorrido: recorridoQuery.error,
    },
  };
}
