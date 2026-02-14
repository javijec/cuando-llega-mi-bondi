import { useMemo } from "react";
import { useBusStore } from "@/lib/stores/busStore";
import { useLineas, useCalles, useIntersecciones, useParadas } from "@/lib/hooks/useBusQuery";

export function useConsultarBus() {
  const store = useBusStore();
  const { lineaSeleccionada, calleSeleccionada, interseccionSeleccionada, paradaSeleccionada } = store;

  // Queries
  const lineasQuery = useLineas();
  const callesQuery = useCalles(lineaSeleccionada || "");
  const interseccionesQuery = useIntersecciones(lineaSeleccionada || "", calleSeleccionada || "");
  const paradasQuery = useParadas(lineaSeleccionada || "", calleSeleccionada || "", interseccionSeleccionada || "");

  // Transformaciones para Selects
  const options = {
    lineas: useMemo(() => (lineasQuery.data?.lineas || []).map(l => ({ value: l.CodigoLineaParada, label: l.Descripcion })), [lineasQuery.data]),
    calles: useMemo(() => (callesQuery.data?.calles || []).map(c => ({ value: c.Codigo, label: c.Descripcion })), [callesQuery.data]),
    intersecciones: useMemo(() => {
      const items = interseccionesQuery.data?.intersecciones || interseccionesQuery.data?.calles || [];
      return items.map(i => ({ value: i.Codigo, label: i.Descripcion }));
    }, [interseccionesQuery.data]),
    paradas: useMemo(() => (paradasQuery.data?.paradas || []).map(p => ({ value: p.Codigo, label: `${p.Descripcion} (${p.AbreviaturaBandera})` })), [paradasQuery.data]),
  };

  // Información detallada del objeto seleccionado
  const selectedInfo = {
    linea: lineasQuery.data?.lineas?.find(l => l.CodigoLineaParada === lineaSeleccionada),
    calle: callesQuery.data?.calles?.find(c => c.Codigo === calleSeleccionada),
    interseccion: [...(interseccionesQuery.data?.intersecciones || []), ...(interseccionesQuery.data?.calles || [])].find(i => i.Codigo === interseccionSeleccionada),
    parada: paradasQuery.data?.paradas?.find(p => p.Codigo === paradaSeleccionada),
  };

  return {
    store,
    options,
    selectedInfo,
    isLoading: {
      lineas: lineasQuery.isLoading,
      calles: callesQuery.isLoading,
      intersecciones: interseccionesQuery.isLoading,
      paradas: paradasQuery.isLoading,
    }
  };
}