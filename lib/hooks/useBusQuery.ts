import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { busService } from "@/lib/services/busService";
import type {
  LineasResponse,
  CallesResponse,
  InterseccionesResponse,
  ParadasResponse,
  ParadaLineasResponse,
  ArribosResponse,
  RecorridoResponse,
} from "@/lib/types/bus";

const retryDelay = (attemptIndex: number): number =>
  Math.min(1000 * 2 ** attemptIndex, 30000);

const STATIC_QUERY_OPTIONS = {
  staleTime: 24 * 60 * 60 * 1000,
  gcTime: 7 * 24 * 60 * 60 * 1000,
} as const;

const STATIC_QUERY_KEYS = ["lineas", "calles", "intersecciones", "paradas", "recorrido"] as const;

// === QUERIES ESTÁTICAS ===

export function useLineas() {
  return useQuery<LineasResponse>({
    queryKey: ["lineas"],
    queryFn: () => busService.fetchLines(),
    retry: 3,
    retryDelay,
    ...STATIC_QUERY_OPTIONS,
  });
}

export function useCalles(codigoLinea: string) {
  return useQuery<CallesResponse>({
    queryKey: ["calles", codigoLinea],
    queryFn: () => busService.fetchStreets(codigoLinea),
    enabled: !!codigoLinea,
    ...STATIC_QUERY_OPTIONS,
  });
}

export function useIntersecciones(codigoLinea: string, codigoCalle: string) {
  return useQuery<InterseccionesResponse>({
    queryKey: ["intersecciones", codigoLinea, codigoCalle],
    queryFn: () => busService.fetchIntersections(codigoLinea, codigoCalle),
    enabled: !!codigoLinea && !!codigoCalle,
    ...STATIC_QUERY_OPTIONS,
  });
}

export function useParadas(codigoLinea: string, codigoCalle: string, codigoInterseccion: string) {
  return useQuery<ParadasResponse>({
    queryKey: ["paradas", codigoLinea, codigoCalle, codigoInterseccion],
    queryFn: () => busService.fetchStops(codigoLinea, codigoCalle, codigoInterseccion),
    enabled: !!codigoLinea && !!codigoCalle && !!codigoInterseccion,
    ...STATIC_QUERY_OPTIONS,
  });
}

export function useRecorrido(codigoLinea: string, isSublinea: number = 0) {
  return useQuery<RecorridoResponse>({
    queryKey: ["recorrido", codigoLinea, isSublinea],
    queryFn: () => busService.fetchRecorrido(codigoLinea, isSublinea),
    enabled: !!codigoLinea,
    ...STATIC_QUERY_OPTIONS,
  });
}

export function useParadaLineas(
  identificadorParada: string,
  calleDescripcion: string,
  interseccionDescripcion: string,
  enabled: boolean = true,
) {
  return useQuery<ParadaLineasResponse>({
    queryKey: [
      "parada-lineas",
      identificadorParada,
      calleDescripcion,
      interseccionDescripcion,
    ],
    queryFn: () =>
      busService.fetchStopLines(
        identificadorParada,
        calleDescripcion,
        interseccionDescripcion,
      ),
    enabled:
      enabled &&
      !!identificadorParada &&
      !!calleDescripcion &&
      !!interseccionDescripcion,
    ...STATIC_QUERY_OPTIONS,
  });
}

// === QUERIES DINÁMICAS ===

export function useArribos(
  identificadorParada: string,
  codigoLineaParada: string,
  options?: {
    enabled?: boolean;
    enableAutoRefresh?: boolean;
    refetchInterval?: number;
  },
) {
  const enabled = options?.enabled ?? true;
  const enableAutoRefresh = options?.enableAutoRefresh ?? true;
  const refetchInterval = options?.refetchInterval ?? 60_000;

  const queryEnabled = enabled && !!identificadorParada && !!codigoLineaParada;

  return useQuery<ArribosResponse>({
    queryKey: ["arribos", identificadorParada, codigoLineaParada],
    queryFn: () => busService.fetchArrivals(identificadorParada, codigoLineaParada),
    enabled: queryEnabled,
    staleTime: 30_000,
    gcTime: 2 * 60_000,
    refetchInterval: queryEnabled && enableAutoRefresh ? refetchInterval : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 2,
    retryDelay,
  });
}

// === MUTATIONS / HELPERS DE CACHÉ ===

export function useRefreshArribos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ identificadorParada, codigoLineaParada }: {
      identificadorParada: string;
      codigoLineaParada: string;
    }) =>
      queryClient.refetchQueries({
        queryKey: ["arribos", identificadorParada, codigoLineaParada],
      }),
  });
}

export function useInvalidateStaticData() {
  const queryClient = useQueryClient();

  return () =>
    queryClient.invalidateQueries({
      predicate: (query) =>
        STATIC_QUERY_KEYS.includes(query.queryKey[0] as typeof STATIC_QUERY_KEYS[number]),
    });
}
