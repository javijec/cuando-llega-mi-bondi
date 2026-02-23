import { useMemo } from "react";
import { useBusStore } from "@/lib/stores/busStore";
import {
  useLineas,
  useCalles,
  useIntersecciones,
  useParadas,
} from "@/lib/hooks/useBusQuery";

export function useConsultarBus() {
  // ✅ Usar selectores atómicos para evitar re-renders innecesarios
  // Cada selector solo se suscribe a su campo específico
  const lineaSeleccionada = useBusStore((state) => state.lineaSeleccionada);
  const calleSeleccionada = useBusStore((state) => state.calleSeleccionada);
  const interseccionSeleccionada = useBusStore(
    (state) => state.interseccionSeleccionada,
  );
  const paradaSeleccionada = useBusStore((state) => state.paradaSeleccionada);

  // Obtener actions del store (estables, no causan re-renders)
  const setLinea = useBusStore((state) => state.setLinea);
  const setCalle = useBusStore((state) => state.setCalle);
  const setInterseccion = useBusStore((state) => state.setInterseccion);
  const setParada = useBusStore((state) => state.setParada);

  // Queries
  const lineasQuery = useLineas();
  const callesQuery = useCalles(lineaSeleccionada || "");
  const interseccionesQuery = useIntersecciones(
    lineaSeleccionada || "",
    calleSeleccionada || "",
  );
  const paradasQuery = useParadas(
    lineaSeleccionada || "",
    calleSeleccionada || "",
    interseccionSeleccionada || "",
  );

  // Transformaciones para Selects
  const options = {
    lineas: useMemo(
      () =>
        (lineasQuery.data?.lineas || [])
          .slice()
          .sort((a, b) =>
            a.Descripcion.localeCompare(b.Descripcion, "es", {
              sensitivity: "base",
            }),
          )
          .map((l) => ({
            value: l.CodigoLineaParada,
            label: l.Descripcion,
          })),
      [lineasQuery.data],
    ),

    calles: useMemo(
      () =>
        (callesQuery.data?.calles || [])
          .slice()
          .sort((a, b) =>
            a.Descripcion.localeCompare(b.Descripcion, "es", {
              sensitivity: "base",
            }),
          )
          .map((c) => ({
            value: c.Codigo,
            label: c.Descripcion.replace(" - MAR DEL PLATA", ""),
          })),
      [callesQuery.data],
    ),

    intersecciones: useMemo(() => {
      const items =
        interseccionesQuery.data?.intersecciones ||
        interseccionesQuery.data?.calles ||
        [];

      return items
        .slice()
        .sort((a, b) =>
          a.Descripcion.localeCompare(b.Descripcion, "es", {
            sensitivity: "base",
          }),
        )
        .map((i) => ({
          value: i.Codigo,
          label: i.Descripcion.replace(" - MAR DEL PLATA", ""),
        }));
    }, [interseccionesQuery.data]),

    paradas: useMemo(
      () =>
        (paradasQuery.data?.paradas || [])
          .slice()
          .sort((a, b) =>
            a.AbreviaturaBandera.localeCompare(b.AbreviaturaBandera, "es", {
              sensitivity: "base",
            }),
          )
          .map((p) => ({
            value: p.Codigo,
            label: p.AbreviaturaBandera,
          })),
      [paradasQuery.data],
    ),
  };
  const selectedInfo = useMemo(() => {
    return {
      linea: lineasQuery.data?.lineas?.find(
        (l) => l.CodigoLineaParada === lineaSeleccionada,
      ),
      calle: callesQuery.data?.calles?.find(
        (c) => c.Codigo === calleSeleccionada,
      ),
      interseccion: [
        ...(interseccionesQuery.data?.intersecciones || []),
        ...(interseccionesQuery.data?.calles || []),
      ].find((i) => i.Codigo === interseccionSeleccionada),
      parada: paradasQuery.data?.paradas?.find(
        (p) => p.Codigo === paradaSeleccionada,
      ),
    };
  }, [
    lineasQuery.data,
    lineaSeleccionada,
    callesQuery.data,
    calleSeleccionada,
    interseccionesQuery.data,
    interseccionSeleccionada,
    paradasQuery.data,
    paradaSeleccionada,
  ]);

  return {
    // ✅ Exportar actions individualmente en lugar del store completo
    actions: {
      setLinea,
      setCalle,
      setInterseccion,
      setParada,
    },
    // Exportar estado individualmente para mayor control
    state: {
      lineaSeleccionada,
      calleSeleccionada,
      interseccionSeleccionada,
      paradaSeleccionada,
    },
    options,
    selectedInfo,
    isLoading: {
      lineas: lineasQuery.isLoading,
      calles: callesQuery.isLoading,
      intersecciones: interseccionesQuery.isLoading,
      paradas: paradasQuery.isLoading,
    },
  };
}
