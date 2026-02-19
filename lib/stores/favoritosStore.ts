// lib/stores/favoritosStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Favorito } from "@/lib/types/bus";

interface FavoritosState {
  favoritos: Favorito[];

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
 * ✅ Safe storage for SSR/SSG compatibility
 *
 * Returns a dummy storage on server-side, real localStorage on client.
 * This prevents "localStorage is not defined" errors during build.
 */
const createSafeStorage = (): Storage => {
  if (typeof window === "undefined") {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      length: 0,
    };
  }

  return {
    getItem: (name: string) => {
      try {
        return localStorage.getItem(name);
      } catch (error) {
        console.warn(`[Storage] Error reading ${name}:`, error);
        return null;
      }
    },
    setItem: (name: string, value: string) => {
      try {
        localStorage.setItem(name, value);
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
    clear: () => {
      try {
        localStorage.clear();
      } catch (error) {
        console.warn("[Storage] Error clearing:", error);
      }
    },
    key: (index: number) => {
      try {
        return localStorage.key(index);
      } catch {
        return null;
      }
    },
    get length() {
      try {
        return localStorage.length;
      } catch {
        return 0;
      }
    },
  };
};

/**
 * Store de favoritos usando Zustand + persist middleware
 *
 * Este store maneja el estado LOCAL de favoritos (no viene del servidor)
 * Se persiste en localStorage automáticamente con versionado y migración
 */
export const useFavoritosStore = create<FavoritosState>()(
  persist(
    (set, get) => ({
      favoritos: [],

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

        if (process.env.NODE_ENV === "development") {
          console.log("⭐ Favorito agregado:", nuevoFavorito);
        }
      },

      eliminarFavorito: (id) => {
        set((state) => ({
          favoritos: state.favoritos.filter((f) => f.id !== id),
        }));
        if (process.env.NODE_ENV === "development") {
          console.log("🗑️ Favorito eliminado:", id);
        }
      },

      toggleFavorito: (favorito) => {
        const {
          esFavorito,
          agregarFavorito,
          eliminarFavorito,
          obtenerFavorito,
        } = get();

        if (esFavorito(favorito.identificadorParada, favorito.codigoLinea)) {
          const existente = obtenerFavorito(
            favorito.identificadorParada,
            favorito.codigoLinea,
          );
          if (existente) {
            eliminarFavorito(existente.id);
          }
          return null;
        } else {
          agregarFavorito(favorito);
          const { favoritos } = get();
          return favoritos[favoritos.length - 1]?.id || null;
        }
      },

      actualizarUltimoAcceso: (id) => {
        set((state) => ({
          favoritos: state.favoritos.map((f) =>
            f.id === id ? { ...f, ultimoAcceso: new Date().toISOString() } : f,
          ),
        }));
      },

      esFavorito: (identificadorParada, codigoLinea) => {
        const { favoritos } = get();
        return favoritos.some(
          (f) =>
            f.identificadorParada === identificadorParada &&
            f.codigoLinea === codigoLinea,
        );
      },

      obtenerFavorito: (identificadorParada, codigoLinea) => {
        const { favoritos } = get();
        return favoritos.find(
          (f) =>
            f.identificadorParada === identificadorParada &&
            f.codigoLinea === codigoLinea,
        );
      },

      obtenerFavoritosOrdenados: (orden = "recientes") => {
        const { favoritos } = get();

        switch (orden) {
          case "recientes":
            return favoritos.toSorted((a, b) => {
              const dateA = a.ultimoAcceso || a.fechaAgregado;
              const dateB = b.ultimoAcceso || b.fechaAgregado;
              return new Date(dateB).getTime() - new Date(dateA).getTime();
            });

          case "antiguos":
            return favoritos.toSorted((a, b) => {
              return (
                new Date(a.fechaAgregado).getTime() -
                new Date(b.fechaAgregado).getTime()
              );
            });

          case "alfabetico":
            return favoritos.toSorted((a, b) => {
              return a.nombreLinea.localeCompare(b.nombreLinea);
            });

          default:
            return favoritos;
        }
      },

      limpiarTodo: () => {
        if (confirm("¿Estás seguro de eliminar todos los favoritos?")) {
          set({ favoritos: [] });
          if (process.env.NODE_ENV === "development") {
            console.log("🗑️ Todos los favoritos eliminados");
          }
        }
      },
    }),
    {
      name: "colectivos-favoritos",
      version: 2,
      storage: createJSONStorage(() => createSafeStorage()),

      migrate: (persistedState: unknown, version: number) => {
        if (version === 1) {
          const stateV1 = persistedState as { favoritos: Favorito[] };

          if (process.env.NODE_ENV === "development") {
            console.log("[Storage] Migrando favoritos de v1 → v2");
          }

          return {
            favoritos: stateV1.favoritos.map((fav) => ({
              ...fav,
            })),
          } as FavoritosState;
        }

        return persistedState as FavoritosState;
      },
    },
  ),
);
