// lib/hooks/useBusQuery.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { busService } from "@/lib/services/busService";
import type {
  LineasResponse,
  CallesResponse,
  InterseccionesResponse,
  ParadasResponse,
  ArribosResponse,
  RecorridoResponse,
} from "@/lib/types/bus";

/**
 * 🎯 Hooks de TanStack Query para manejo de datos de colectivos
 */

/**
 * Exponential backoff for retry delays
 * @param attemptIndex - Current retry attempt (0-indexed)
 * @returns Delay in milliseconds
 */
const retryDelay = (attemptIndex: number): number =>
  Math.min(1000 * 2 ** attemptIndex, 30000);

// === QUERIES ESTÁTICAS (con cache largo) ===

export function useLineas() {
  return useQuery<LineasResponse>({
    queryKey: ["lineas"],
    queryFn: () => busService.fetchLines(),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
    retry: 3,
    retryDelay,
  });
}

export function useCalles(codigoLinea: string) {
  return useQuery<CallesResponse>({
    queryKey: ["calles", codigoLinea],
    queryFn: () => busService.fetchStreets(codigoLinea),
    enabled: !!codigoLinea,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
  });
}

export function useIntersecciones(codigoLinea: string, codigoCalle: string) {
  return useQuery<InterseccionesResponse>({
    queryKey: ["intersecciones", codigoLinea, codigoCalle],
    queryFn: () => busService.fetchIntersections(codigoLinea, codigoCalle),
    enabled: !!codigoLinea && !!codigoCalle,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
  });
}

export function useParadas(
  codigoLinea: string,
  codigoCalle: string,
  codigoInterseccion: string,
) {
  return useQuery<ParadasResponse>({
    queryKey: ["paradas", codigoLinea, codigoCalle, codigoInterseccion],
    queryFn: () =>
      busService.fetchStops(codigoLinea, codigoCalle, codigoInterseccion),
    enabled: !!codigoLinea && !!codigoCalle && !!codigoInterseccion,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
  });
}

export function useRecorrido(codigoLinea: string, isSublinea: number = 0) {
  return useQuery<RecorridoResponse>({
    queryKey: ["recorrido", codigoLinea, isSublinea],
    queryFn: () => busService.fetchRecorrido(codigoLinea, isSublinea),
    enabled: !!codigoLinea,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
  });
}

// === QUERIES DINÁMICAS (con auto-refresh) ===

/**
 *
 * @param identificadorParada - Identificador único de la parada
 * @param codigoLineaParada - Código de la línea en la parada
 * @param options - Opciones de configuración
 *
 * @example
 * // Con auto-refresh solo cuando está habilitado
 * const { data, isLoading } = useArribos('12345', '501', {
 *   enabled: isVisible,  // ← CLAVE: Controla todo
 *   enableAutoRefresh: true
 * });
 */
export function useArribos(
  identificadorParada: string,
  codigoLineaParada: string,
  options?: {
    /** Habilitar la query (default: true) */
    enabled?: boolean;
    /** Habilitar auto-refresh (default: true) */
    enableAutoRefresh?: boolean;
    /** Intervalo de refresh en ms (default: 60000 = 1min) */
    refetchInterval?: number;
  },
) {
  const enabled = options?.enabled ?? true;
  const enableAutoRefresh = options?.enableAutoRefresh ?? true;
  const refetchInterval = options?.refetchInterval ?? 60 * 1000;

  // 🔥 CLAVE: enabled controla si la query está activa
  // Si enabled = false → NO hace fetch, NO hace polling, NO hace nada
  const queryEnabled = enabled && !!identificadorParada && !!codigoLineaParada;

  return useQuery<ArribosResponse>({
    queryKey: ["arribos", identificadorParada, codigoLineaParada],
    queryFn: () =>
      busService.fetchArrivals(identificadorParada, codigoLineaParada),

    // 🎯 Control principal: enabled
    enabled: queryEnabled,

    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,

    // ⚡ Polling: solo si enabled Y enableAutoRefresh
    // Si enabled = false, esto nunca se ejecuta
    refetchInterval:
      queryEnabled && enableAutoRefresh ? refetchInterval : false,

    // 🚫 NO hacer polling cuando la pestaña está en background
    refetchIntervalInBackground: false,

    // ✅ Sí re-fetch al volver a la ventana (solo si enabled = true)
    refetchOnWindowFocus: true,

    // ✅ Sí re-fetch al reconectar (solo si enabled = true)
    refetchOnReconnect: true,

    retry: 2,
    retryDelay,
  });
}

// === MUTATIONS ===

export function useRefreshArribos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      identificadorParada,
      codigoLineaParada,
    }: {
      identificadorParada: string;
      codigoLineaParada: string;
    }) => {
      await queryClient.invalidateQueries({
        queryKey: ["arribos", identificadorParada, codigoLineaParada],
      });
      return queryClient.fetchQuery({
        queryKey: ["arribos", identificadorParada, codigoLineaParada],
        queryFn: () =>
          busService.fetchArrivals(identificadorParada, codigoLineaParada),
      });
    },
  });
}

export function useInvalidateStaticData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0] as string;
          return [
            "lineas",
            "calles",
            "intersecciones",
            "paradas",
            "recorrido",
          ].includes(key);
        },
      });
    },
  });
}
