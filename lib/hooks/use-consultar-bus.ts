import { useMemo } from "react";
import { useBusStore } from "@/lib/stores/busStore";
import {
  useLineas,
  useCalles,
  useIntersecciones,
  useParadas,
} from "@/lib/hooks/useBusQuery";
import type { Linea, Calle, Interseccion, Parada } from "@/lib/types/bus";

const collator = new Intl.Collator("es", { sensitivity: "base" });
const stripCity = (str: string) => str.replace(" - MAR DEL PLATA", "");

interface Option {
  value: string;
  label: string;
}

const toOptions = <T>(
  items: T[],
  getValue: (item: T) => string,
  getLabel: (item: T) => string,
  getSortKey: (item: T) => string = getLabel,
): Option[] =>
  items
    .slice()
    .sort((a, b) => collator.compare(getSortKey(a), getSortKey(b)))
    .map((item) => ({ value: getValue(item), label: getLabel(item) }));

export function useConsultarBus() {
  const lineaSeleccionada = useBusStore((state) => state.lineaSeleccionada);
  const calleSeleccionada = useBusStore((state) => state.calleSeleccionada);
  const interseccionSeleccionada = useBusStore((state) => state.interseccionSeleccionada);
  const paradaSeleccionada = useBusStore((state) => state.paradaSeleccionada);

  const setLinea = useBusStore((state) => state.setLinea);
  const setCalle = useBusStore((state) => state.setCalle);
  const setInterseccion = useBusStore((state) => state.setInterseccion);
  const setParada = useBusStore((state) => state.setParada);

  const lineasQuery = useLineas();
  const callesQuery = useCalles(lineaSeleccionada ?? "");
  const interseccionesQuery = useIntersecciones(lineaSeleccionada ?? "", calleSeleccionada ?? "");
  const paradasQuery = useParadas(lineaSeleccionada ?? "", calleSeleccionada ?? "", interseccionSeleccionada ?? "");

  // Array unificado — compartido entre options.intersecciones y selectedInfo
  const interseccionesItems = useMemo<Interseccion[]>(
    () => [
      ...(interseccionesQuery.data?.intersecciones ?? []),
      ...(interseccionesQuery.data?.calles ?? []),
    ],
    [interseccionesQuery.data],
  );

  const options = {
    lineas: useMemo(
      () => toOptions<Linea>(
        lineasQuery.data?.lineas ?? [],
        (l) => l.CodigoLineaParada,
        (l) => l.Descripcion,
      ),
      [lineasQuery.data],
    ),
    calles: useMemo(
      () => toOptions<Calle>(
        callesQuery.data?.calles ?? [],
        (c) => c.Codigo,
        (c) => stripCity(c.Descripcion),
      ),
      [callesQuery.data],
    ),
    intersecciones: useMemo(
      () => toOptions<Interseccion>(
        interseccionesItems,
        (i) => i.Codigo,
        (i) => stripCity(i.Descripcion),
      ),
      [interseccionesItems],
    ),
    paradas: useMemo(
      () => toOptions<Parada>(
        paradasQuery.data?.paradas ?? [],
        (p) => p.Codigo,
        (p) => p.AbreviaturaBandera,
      ),
      [paradasQuery.data],
    ),
  };

  const selectedInfo = useMemo(() => ({
    linea: lineasQuery.data?.lineas?.find((l) => l.CodigoLineaParada === lineaSeleccionada),
    calle: callesQuery.data?.calles?.find((c) => c.Codigo === calleSeleccionada),
    interseccion: interseccionesItems.find((i) => i.Codigo === interseccionSeleccionada),
    parada: paradasQuery.data?.paradas?.find((p) => p.Codigo === paradaSeleccionada),
  }), [
    lineasQuery.data, lineaSeleccionada,
    callesQuery.data, calleSeleccionada,
    interseccionesItems, interseccionSeleccionada,
    paradasQuery.data, paradaSeleccionada,
  ]);

  return {
    actions: { setLinea, setCalle, setInterseccion, setParada },
    state: { lineaSeleccionada, calleSeleccionada, interseccionSeleccionada, paradaSeleccionada },
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