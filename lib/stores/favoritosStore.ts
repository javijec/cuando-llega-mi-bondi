// lib/stores/favoritosStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Favorito } from "@/lib/types/bus";

interface FavoritosState {
  favoritos: Favorito[];

  // Acciones
  agregarFavorito: (favorito: Omit<Favorito, "id" | "fechaAgregado">) => void;
  eliminarFavorito: (id: string) => void;
  toggleFavorito: (
    favorito: Omit<Favorito, "id" | "fechaAgregado">,
  ) => string | null;
  actualizarUltimoAcceso: (id: string) => void;
  esFavorito: (identificadorParada: string, codigoLinea: string) => boolean;
  obtenerFavorito: (
    identificadorParada: string,
    codigoLinea: string,
  ) => Favorito | undefined;
  obtenerFavoritosOrdenados: (
    orden?: "recientes" | "antiguos" | "alfabetico",
  ) => Favorito[];
  limpiarTodo: () => void;
}

/**
 * ✅ Storage wrapper con try-catch para manejar errores de localStorage
 *
 * localStorage puede fallar en:
 * - Modo incógnito/privado (Safari, Firefox)
 * - Cuota excedida (storage lleno)
 * - localStorage deshabilitado por el usuario
 * - Cookies de terceros bloqueadas
 * - Server-side rendering (SSR/SSG)
 */
const createSafeStorage = () => {
  if (typeof window === "undefined") {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }

  return {
    getItem: (name: string) => {
      try {
        const value = localStorage.getItem(name);
        return value ? JSON.parse(value) : null;
      } catch (error) {
        console.warn(`[Storage] Error reading ${name}:`, error);
        return null;
      }
    },
    setItem: (name: string, value: unknown) => {
      try {
        localStorage.setItem(name, JSON.stringify(value));
      } catch (error) {
        console.warn(`[Storage] Error writing ${name}:`, error);
      }
    },
    removeItem: (name: string) => {
      try {
        localStorage.removeItem(name);
      } catch (error) {
        console.warn(`[Storage] Error removing ${name}:`, error);
      }
    },
  };
};

/**
 * Store de favoritos usando Zustand + persist middleware
 *
 * Este store maneja el estado LOCAL de favoritos (no viene del servidor)
 * Se persiste en localStorage automáticamente con versionado y migración
 *
 * ✅ PERFECTO para este caso porque:
 * - Son datos locales (no necesitan cache de servidor)
 * - Operaciones síncronas (no hay fetching)
 * - Persistencia simple con localStorage
 * - Versionado para evolución del schema
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

        console.log("⭐ Favorito agregado:", nuevoFavorito);
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
        console.log("🗑️ Favorito eliminado:", id);
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
        const {
          esFavorito,
          agregarFavorito,
          eliminarFavorito,
          obtenerFavorito,
        } = get();

        if (esFavorito(favorito.identificadorParada, favorito.codigoLinea)) {
          // Ya existe, eliminar
          const existente = obtenerFavorito(
            favorito.identificadorParada,
            favorito.codigoLinea,
          );
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
            f.id === id ? { ...f, ultimoAcceso: new Date().toISOString() } : f,
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
            f.codigoLinea === codigoLinea,
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
            f.codigoLinea === codigoLinea,
        );
      },

      /**
       * 📋 Obtener favoritos ordenados
       *
       * ✅ FIX: Usa .toSorted() en lugar de .sort() para inmutabilidad
       *
       * @param orden - Tipo de ordenamiento
       * @returns Array de favoritos ordenados
       *
       * @example
       * const recientes = obtenerFavoritosOrdenados('recientes');
       * const alfabetico = obtenerFavoritosOrdenados('alfabetico');
       */
      obtenerFavoritosOrdenados: (orden = "recientes") => {
        const { favoritos } = get();

        switch (orden) {
          case "recientes":
            // ✅ .toSorted() crea nueva array sin mutar el original
            return favoritos.toSorted((a, b) => {
              const dateA = a.ultimoAcceso || a.fechaAgregado;
              const dateB = b.ultimoAcceso || b.fechaAgregado;
              return new Date(dateB).getTime() - new Date(dateA).getTime();
            });

          case "antiguos":
            // ✅ .toSorted() crea nueva array sin mutar el original
            return favoritos.toSorted((a, b) => {
              return (
                new Date(a.fechaAgregado).getTime() -
                new Date(b.fechaAgregado).getTime()
              );
            });

          case "alfabetico":
            // ✅ .toSorted() crea nueva array sin mutar el original
            return favoritos.toSorted((a, b) => {
              return a.nombreLinea.localeCompare(b.nombreLinea);
            });

          default:
            return favoritos;
        }
      },

      /**
       * 🗑️ Limpiar todos los favoritos
       *
       * Muestra confirmación antes de eliminar
       */
      limpiarTodo: () => {
        if (confirm("¿Estás seguro de eliminar todos los favoritos?")) {
          set({ favoritos: [] });
          console.log("🗑️ Todos los favoritos eliminados");
        }
      },
    }),
    {
      name: "colectivos-favoritos",
      version: 2, // ← Incrementado a v2 para activar migración

      /**
       * ✅ FIX: Función de migración para evolución del schema
       *
       * Maneja la transición entre versiones si hay cambios en el tipo Favorito
       *
       * Ejemplo real:
       * - v1: no tenía el campo 'ultimoAcceso' (opcional)
       * - v2: esquema actual con todos los campos
       *
       * @param persistedState - Estado guardado en localStorage
       * @param version - Versión del estado guardado
       * @returns Estado migrado a la versión actual
       */
      migrate: (persistedState: unknown, version: number) => {
        // Si el estado viene de v1, migrarlo a v2
        if (version === 1) {
          const stateV1 = persistedState as { favoritos: Favorito[] };

          console.log("[Storage] Migrando favoritos de v1 → v2");

          // En este caso no hay cambios de schema, pero el patrón está listo
          // para cuando agregues campos nuevos en el futuro
          return {
            favoritos: stateV1.favoritos.map((fav) => ({
              ...fav,
              // Ejemplo: si agregamos un campo nuevo en v2
              // nuevoCapo: fav.nuevoCampo ?? 'default',
            })),
          } as FavoritosState;
        }

        // Si hay otras versiones futuras, agregar casos aquí
        // if (version === 2) { ... }

        // Si no hay migración necesaria, retornar tal cual
        return persistedState as FavoritosState;
      },

      /**
       * ✅ FIX: Storage wrapper seguro con try-catch
       *
       * Previene crashes en:
       * - Modo incógnito/privado
       * - Cuota de storage excedida
       * - localStorage deshabilitado
       */
      storage: createSafeStorage(),
    },
  ),
);
