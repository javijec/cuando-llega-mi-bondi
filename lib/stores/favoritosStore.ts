// lib/stores/favoritosStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Favorito } from '@/lib/types/bus';

interface FavoritosState {
  favoritos: Favorito[];
  
  // Acciones
  agregarFavorito: (favorito: Omit<Favorito, 'id' | 'fechaAgregado'>) => void;
  eliminarFavorito: (id: string) => void;
  toggleFavorito: (favorito: Omit<Favorito, 'id' | 'fechaAgregado'>) => string | null;
  actualizarUltimoAcceso: (id: string) => void;
  esFavorito: (identificadorParada: string, codigoLinea: string) => boolean;
  obtenerFavorito: (identificadorParada: string, codigoLinea: string) => Favorito | undefined;
  obtenerFavoritosOrdenados: (orden?: 'recientes' | 'antiguos' | 'alfabetico') => Favorito[];
  limpiarTodo: () => void;
}

/**
 * Store de favoritos usando Zustand + persist middleware
 * 
 * Este store maneja el estado LOCAL de favoritos (no viene del servidor)
 * Se persiste en localStorage automáticamente
 * 
 * ✅ PERFECTO para este caso porque:
 * - Son datos locales (no necesitan cache de servidor)
 * - Operaciones síncronas (no hay fetching)
 * - Persistencia simple con localStorage
 */
export const useFavoritosStore = create<FavoritosState>()(
  persist(
    (set, get) => ({
      favoritos: [],

      /**
       * ⭐ Agregar una parada a favoritos
       * 
       * @param data - Datos del favorito (sin id ni fechaAgregado)
       * @returns void
       * 
       * @example
       * agregarFavorito({
       *   codigoLinea: '501',
       *   identificadorParada: '12345',
       *   nombreLinea: 'Línea 501',
       *   bandera: 'A',
       *   descripcionParada: 'Av. Constitución y San Juan',
       *   calle: 'Av. Constitución',
       *   interseccion: 'San Juan'
       * });
       */
      agregarFavorito: (data) => {
        const id = crypto.randomUUID();
        const fechaAgregado = new Date().toISOString();

        const nuevoFavorito: Favorito = {
          ...data,
          id,
          fechaAgregado,
        };

        set((state) => ({
          favoritos: [...state.favoritos, nuevoFavorito],
        }));

        console.log('⭐ Favorito agregado:', nuevoFavorito);
      },

      /**
       * 🗑️ Eliminar un favorito por ID
       * 
       * @param id - ID único del favorito
       */
      eliminarFavorito: (id) => {
        set((state) => ({
          favoritos: state.favoritos.filter((f) => f.id !== id),
        }));
        console.log('🗑️ Favorito eliminado:', id);
      },

      /**
       * ⭐🗑️ Toggle favorito (agregar si no existe, eliminar si existe)
       * 
       * Este método es útil para botones de favorito que actúan como switch
       * 
       * @param favorito - Datos del favorito
       * @returns ID del favorito agregado, o null si se eliminó
       * 
       * @example
       * const resultado = toggleFavorito({ ... });
       * if (resultado) {
       *   toast.success('Agregado a favoritos');
       * } else {
       *   toast.info('Eliminado de favoritos');
       * }
       */
      toggleFavorito: (favorito) => {
        const { esFavorito, agregarFavorito, eliminarFavorito, obtenerFavorito } = get();
        
        if (esFavorito(favorito.identificadorParada, favorito.codigoLinea)) {
          // Ya existe, eliminar
          const existente = obtenerFavorito(favorito.identificadorParada, favorito.codigoLinea);
          if (existente) {
            eliminarFavorito(existente.id);
          }
          return null;
        } else {
          // No existe, agregar
          agregarFavorito(favorito);
          // Retornar el ID del último favorito agregado (el que acabamos de agregar)
          const { favoritos } = get();
          return favoritos[favoritos.length - 1]?.id || null;
        }
      },

      /**
       * 🕐 Actualizar último acceso de un favorito
       * 
       * Útil para ordenar por "recientes" o mostrar cuál fue el último consultado
       * 
       * @param id - ID del favorito
       */
      actualizarUltimoAcceso: (id) => {
        set((state) => ({
          favoritos: state.favoritos.map((f) =>
            f.id === id ? { ...f, ultimoAcceso: new Date().toISOString() } : f
          ),
        }));
      },

      /**
       * ❓ Verificar si una parada está en favoritos
       * 
       * @param identificadorParada - ID de la parada
       * @param codigoLinea - Código de la línea
       * @returns true si está en favoritos
       */
      esFavorito: (identificadorParada, codigoLinea) => {
        const { favoritos } = get();
        return favoritos.some(
          (f) =>
            f.identificadorParada === identificadorParada &&
            f.codigoLinea === codigoLinea
        );
      },

      /**
       * 🔍 Obtener un favorito específico
       * 
       * @param identificadorParada - ID de la parada
       * @param codigoLinea - Código de la línea
       * @returns Favorito si existe, undefined si no
       */
      obtenerFavorito: (identificadorParada, codigoLinea) => {
        const { favoritos } = get();
        return favoritos.find(
          (f) =>
            f.identificadorParada === identificadorParada &&
            f.codigoLinea === codigoLinea
        );
      },

      /**
       * 📋 Obtener favoritos ordenados
       * 
       * @param orden - Tipo de ordenamiento
       * @returns Array de favoritos ordenados
       * 
       * @example
       * const recientes = obtenerFavoritosOrdenados('recientes');
       * const alfabetico = obtenerFavoritosOrdenados('alfabetico');
       */
      obtenerFavoritosOrdenados: (orden = 'recientes') => {
        const { favoritos } = get();
        const copia = [...favoritos];

        switch (orden) {
          case 'recientes':
            // Ordenar por ultimoAcceso (más reciente primero), luego por fechaAgregado
            return copia.sort((a, b) => {
              const dateA = a.ultimoAcceso || a.fechaAgregado;
              const dateB = b.ultimoAcceso || b.fechaAgregado;
              return new Date(dateB).getTime() - new Date(dateA).getTime();
            });

          case 'antiguos':
            // Ordenar por fechaAgregado (más antiguo primero)
            return copia.sort((a, b) => {
              return new Date(a.fechaAgregado).getTime() - new Date(b.fechaAgregado).getTime();
            });

          case 'alfabetico':
            // Ordenar alfabéticamente por nombreLinea
            return copia.sort((a, b) => {
              return a.nombreLinea.localeCompare(b.nombreLinea);
            });

          default:
            return copia;
        }
      },

      /**
       * 🗑️ Limpiar todos los favoritos
       * 
       * Muestra confirmación antes de eliminar
       */
      limpiarTodo: () => {
        if (confirm('¿Estás seguro de eliminar todos los favoritos?')) {
          set({ favoritos: [] });
          console.log('🗑️ Todos los favoritos eliminados');
        }
      },
    }),
    {
      name: 'colectivos-favoritos', // Nombre en localStorage
      // Opcional: versión para migración futura
      version: 1,
    }
  )
);