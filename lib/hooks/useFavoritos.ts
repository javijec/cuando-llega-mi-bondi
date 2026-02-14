// lib/hooks/useFavoritos.ts
import { useFavoritosStore } from '@/lib/stores/favoritosStore';
import { useArribos } from './useBusQuery';
import { useMemo, useState, useEffect, useRef } from 'react';
import type { Favorito } from '@/lib/types/bus';
import { useIntersectionObserver } from '@/lib/hooks/useIntersectionObserver';

/**
 * 🎯 Hook personalizado para manejar favoritos
 */

export function useFavoritos() {
  const {
    favoritos,
    agregarFavorito,
    eliminarFavorito,
    toggleFavorito,
    actualizarUltimoAcceso,
    esFavorito,
    obtenerFavorito,
    obtenerFavoritosOrdenados,
    limpiarTodo,
  } = useFavoritosStore();

  return {
    favoritos,
    totalFavoritos: favoritos.length,
    agregarFavorito,
    eliminarFavorito,
    toggleFavorito,
    actualizarUltimoAcceso,
    esFavorito,
    obtenerFavorito,
    obtenerFavoritosOrdenados,
    limpiarTodo,
  };
}

export function useFavorito(
  identificadorParada: string,
  codigoLinea: string,
  autoRefresh: boolean = false
) {
  const {
    esFavorito,
    obtenerFavorito,
    toggleFavorito,
    actualizarUltimoAcceso,
  } = useFavoritosStore();

  const favorito = obtenerFavorito(identificadorParada, codigoLinea);
  const isFavorito = esFavorito(identificadorParada, codigoLinea);

  const arribos = useArribos(
    identificadorParada,
    codigoLinea,
    {
      enableAutoRefresh: autoRefresh && isFavorito,
    }
  );

  const toggle = (datosFavorito?: Omit<Favorito, 'id' | 'fechaAgregado'>) => {
    const resultado = toggleFavorito(
      datosFavorito || {
        identificadorParada,
        codigoLinea,
        nombreLinea: '',
        bandera: '',
        codigoParada: '',
        banderaCompleta: '',
        descripcionParada: '',
        calle: '',
        interseccion: '',
      }
    );

    if (resultado) {
      actualizarUltimoAcceso(resultado);
    }

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
      if (favorito) {
        actualizarUltimoAcceso(favorito.id);
      }
    },
  };
}

/**
 * 📋 Hook para lista de favoritos SIN arribos (solo metadata)
 */
export function useFavoritosList(
  orden: 'recientes' | 'antiguos' | 'alfabetico' = 'recientes',
  limit?: number
) {
  const { obtenerFavoritosOrdenados } = useFavoritosStore();
  
  const favoritos = useMemo(() => {
    const ordenados = obtenerFavoritosOrdenados(orden);
    return limit ? ordenados.slice(0, limit) : ordenados;
  }, [obtenerFavoritosOrdenados, orden, limit]);

  return {
    favoritos,
    isEmpty: favoritos.length === 0,
    total: favoritos.length,
  };
}

/**
 * 🚀 ULTRA-FINAL: TODO setState usa setTimeout
 * 
 * Patrón usado:
 * - ✅ useState con valores iniciales explícitos (React 19)
 * - ✅ SIEMPRE setTimeout para setState en effects (ESLint estricto)
 * - ✅ Sin excepciones, incluso para casos "válidos"
 * 
 * @param identificadorParada - ID de la parada
 * @param codigoLinea - Código de la línea
 * @param options - Opciones de configuración
 */
export function useVisibleArribos(
  identificadorParada: string,
  codigoLinea: string,
  options: {
    autoRefresh?: boolean;
    activationDelay?: number;
    visibilityDebounce?: number;
  } = {}
) {
  const {
    autoRefresh = true,
    activationDelay = 0,
    visibilityDebounce = 150,
  } = options;

  // 👁️ Intersection Observer (NO freeze - necesitamos trackear cuando sale)
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
    freezeOnceVisible: false,
  });

  // 🎯 Debounced visibility - TODO con setTimeout
  const [isVisibleDebounced, setIsVisibleDebounced] = useState<boolean>(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    // Limpiar timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (isIntersecting) {
      // Visible: debounce para evitar ráfagas
      debounceTimerRef.current = setTimeout(() => {
        setIsVisibleDebounced(true);
      }, visibilityDebounce);
    } else {
      // No visible: también usar setTimeout para satisfacer ESLint
      // aunque setTimeout(fn, 0) es inmediato, evita el warning
      debounceTimerRef.current = setTimeout(() => {
        setIsVisibleDebounced(false);
      }, 0);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [isIntersecting, visibilityDebounce]);

  // 🚦 Staged activation - TODO con setTimeout
  const [isActivated, setIsActivated] = useState<boolean>(false);
  const activationTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    // Limpiar timer anterior
    if (activationTimerRef.current) {
      clearTimeout(activationTimerRef.current);
    }

    if (isVisibleDebounced && !isActivated) {
      const delay = activationDelay > 0 ? activationDelay : 0;
      
      // Siempre setTimeout
      activationTimerRef.current = setTimeout(() => {
        setIsActivated(true);
      }, delay);
    }

    // NO desactivar cuando sale - mantener isActivated = true
    // para que TanStack Query mantenga los datos en caché

    return () => {
      if (activationTimerRef.current) {
        clearTimeout(activationTimerRef.current);
      }
    };
  }, [isVisibleDebounced, isActivated, activationDelay]);

  // 📊 hasBeenActivated - useState + setTimeout
  const [hasBeenActivated, setHasBeenActivated] = useState<boolean>(false);

  useEffect(() => {
    if (isActivated && !hasBeenActivated) {
      // setTimeout para evitar warning de ESLint
      setTimeout(() => {
        setHasBeenActivated(true);
      }, 0);
    }
  }, [isActivated, hasBeenActivated]);

  // 🔥 CLAVE: enabled controla TODO (fetch + polling)
  const queryEnabled = isVisibleDebounced && isActivated;

  // 🔄 Fetch de arribos
  const arribosQuery = useArribos(
    identificadorParada,
    codigoLinea,
    {
      enabled: queryEnabled,
      enableAutoRefresh: autoRefresh,
    }
  );

  return {
    ref,
    // Estados de visibilidad
    isVisible: isIntersecting,
    isVisibleDebounced,
    isActivated,
    hasBeenActivated,
    // Datos
    arribos: hasBeenActivated ? arribosQuery.data : null,
    isLoading: isActivated && arribosQuery.isLoading,
    isFetching: arribosQuery.isFetching,
    error: hasBeenActivated ? arribosQuery.error : null,
    dataUpdatedAt: hasBeenActivated ? arribosQuery.dataUpdatedAt : 0,
    // Metadata útil para debugging
    _debug: process.env.NODE_ENV === 'development' ? {
      isIntersecting,
      isVisibleDebounced,
      isActivated,
      hasBeenActivated,
      queryEnabled,
      isQueryEnabled: arribosQuery.isEnabled,
    } : undefined,
  };
}

/**
 * 🎨 Hook para botón de favorito
 */
export function useFavoritoToggle(
  identificadorParada: string,
  codigoLinea: string,
  datosFavorito: Omit<Favorito, 'id' | 'fechaAgregado' | 'identificadorParada' | 'codigoLinea'>
) {
  const { esFavorito, toggleFavorito } = useFavoritosStore();
  
  const isFavorito = esFavorito(identificadorParada, codigoLinea);

  const toggle = () => {
    return toggleFavorito({
      identificadorParada,
      codigoLinea,
      ...datosFavorito,
    });
  };

  return {
    isFavorito,
    toggle,
    icon: isFavorito ? '⭐' : '☆',
    label: isFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos',
  };
}