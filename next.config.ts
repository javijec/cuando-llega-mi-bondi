// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * ✅ CACHE COMPONENTS - Feature de Next.js 16
   * Habilita el uso de 'use cache' directive en componentes y funciones del servidor
   */
  cacheComponents: true,

  /**
   * ⏱️ CACHE LIFE - Perfiles de cache personalizados
   * Define diferentes estrategias de cache según el tipo de dato
   *
   * - stale: Tiempo en segundos que el cliente considera los datos "frescos"
   * - revalidate: Tiempo en segundos que el servidor espera antes de revalidar
   * - expire: Tiempo en segundos antes de eliminar completamente del cache
   */
  cacheLife: {
    // Datos estáticos (líneas, calles, intersecciones, paradas, recorridos)
    static: {
      stale: 86400, // 24 horas - cliente considera datos "frescos"
      revalidate: 86400, // 24 horas - servidor revalida después de este tiempo
      expire: 604800, // 7 días - limpia del cache después de este tiempo
    },

    // Arribos en tiempo real
    realtime: {
      stale: 30, // 30 segundos - cliente considera datos "frescos"
      revalidate: 60, // 1 minuto - servidor revalida después de este tiempo
      expire: 120, // 2 minutos - limpia del cache después de este tiempo
    },
  },
};

export default nextConfig;
