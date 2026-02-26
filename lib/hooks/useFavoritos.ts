// lib/hooks/useFavoritos.ts
import { useFavoritosStore } from "@/lib/stores/favoritosStore";
import { useArribos } from "./useBusQuery";
import { useMemo, useState, useEffect } from "react";
import type { Favorito } from "@/lib/types/bus";
import { useIntersectionObserver } from "@/lib/hooks/useIntersectionObserver";
import { useDebounce } from "@/lib/hooks/useDebounce";

const collator = new Intl.Collator("es", { sensitivity: "base" });

const SORT_COMPARATORS: Record<
  "recientes" | "antiguos" | "alfabetico",
  (a: Favorito, b: Favorito) => number
> = {
  recientes: (a, b) =>
    new Date(b.ultimoAcceso ?? b.fechaAgregado).getTime() -
    new Date(a.ultimoAcceso ?? a.fechaAgregado).getTime(),
  antiguos: (a, b) =>
    new Date(a.fechaAgregado).getTime() - new Date(b.fechaAgregado).getTime(),
  alfabetico: (a, b) => collator.compare(a.nombreLinea, b.nombreLinea),
};

export function useFavoritos() {
  const store = useFavoritosStore();
  return {
    ...store,
    totalFavoritos: store.favoritos.length,
  };
}

export function useFavorito(
  identificadorParada: string,
  codigoLinea: string,
  autoRefresh: boolean = false,
) {
  const { esFavorito, obtenerFavorito, toggleFavorito, actualizarUltimoAcceso } =
    useFavoritosStore();

  const favorito = obtenerFavorito(identificadorParada, codigoLinea);
  const isFavorito = esFavorito(identificadorParada, codigoLinea);

  const arribos = useArribos(identificadorParada, codigoLinea, {
    enableAutoRefresh: autoRefresh && isFavorito,
  });

  const toggle = (datosFavorito?: Omit<Favorito, "id" | "fechaAgregado">) => {
    const resultado = toggleFavorito(
      datosFavorito ?? {
        identificadorParada,
        codigoLinea,
        nombreLinea: "",
        bandera: "",
        codigoParada: "",
        banderaCompleta: "",
        descripcionParada: "",
        calle: "",
        interseccion: "",
      },
    );
    if (resultado) actualizarUltimoAcceso(resultado);
    return resultado;
  };

  return {
    favorito,
    esFavorito: isFavorito,
    arribos: isFavorito ? arribos.data : null,
    isLoadingArribos: isFavorito ? arribos.isLoading : false,
    errorArribos: isFavorito ? arribos.error : null,
    toggle,
    actualizarAcceso: () => {
      if (favorito) actualizarUltimoAcceso(favorito.id);
    },
  };
}

export function useFavoritosList(
  orden: "recientes" | "antiguos" | "alfabetico" = "recientes",
  limit?: number,
) {
  const favoritos = useFavoritosStore((state) => state.favoritos);

  const favoritosOrdenados = useMemo(() => {
    const ordenados = favoritos.toSorted(SORT_COMPARATORS[orden]);
    return limit ? ordenados.slice(0, limit) : ordenados;
  }, [favoritos, orden, limit]);

  return {
    favoritos: favoritosOrdenados,
    isEmpty: favoritosOrdenados.length === 0,
    total: favoritosOrdenados.length,
  };
}

export function useVisibleArribos(
  identificadorParada: string,
  codigoLinea: string,
  options: {
    autoRefresh?: boolean;
    activationDelay?: number;
    visibilityDebounce?: number;
  } = {},
) {
  const { autoRefresh = true, activationDelay = 0, visibilityDebounce = 150 } =
    options;

  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: "50px",
    freezeOnceVisible: false,
  });

  // Debounce en ambas direcciones — está bien para visibilidad
  const isVisibleDebounced = useDebounce(
    isIntersecting,
    isIntersecting ? visibilityDebounce : 0,
  );

  // One-way: una vez activado, nunca vuelve a false
  // Mantiene TanStack Query activo para que los datos queden en caché
  // aunque el elemento salga del viewport
  const [isActivated, setIsActivated] = useState(false);
  useEffect(() => {
    if (!isVisibleDebounced || isActivated) return;
    const timer = setTimeout(() => setIsActivated(true), activationDelay);
    return () => clearTimeout(timer);
  }, [isVisibleDebounced, isActivated, activationDelay]);

  const queryEnabled = isVisibleDebounced && isActivated;

  const arribosQuery = useArribos(identificadorParada, codigoLinea, {
    enabled: queryEnabled,
    enableAutoRefresh: autoRefresh,
  });

  return {
    ref,
    isVisible: isIntersecting,
    isVisibleDebounced,
    isActivated,
    hasBeenActivated: isActivated, // alias semántico para templates
    arribos: isActivated ? arribosQuery.data : null,
    isLoading: isActivated && arribosQuery.isLoading,
    isFetching: arribosQuery.isFetching,
    error: isActivated ? arribosQuery.error : null,
    dataUpdatedAt: isActivated ? arribosQuery.dataUpdatedAt : 0,
    _debug:
      process.env.NODE_ENV === "development"
        ? {
            isIntersecting,
            isVisibleDebounced,
            isActivated,
            queryEnabled,
            isQueryEnabled: arribosQuery.isEnabled,
          }
        : undefined,
  };
}

export function useFavoritoToggle(
  identificadorParada: string,
  codigoLinea: string,
  datosFavorito: Omit<
    Favorito,
    "id" | "fechaAgregado" | "identificadorParada" | "codigoLinea"
  >,
) {
  const { esFavorito, toggleFavorito } = useFavoritosStore();
  const isFavorito = esFavorito(identificadorParada, codigoLinea);

  return {
    isFavorito,
    toggle: () =>
      toggleFavorito({ identificadorParada, codigoLinea, ...datosFavorito }),
    icon: isFavorito ? "⭐" : "☆",
    label: isFavorito ? "Quitar de favoritos" : "Agregar a favoritos",
  };
}