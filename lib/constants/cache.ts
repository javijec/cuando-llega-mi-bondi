/**
 * Cache TTL constants (in seconds)
 * Centralized to avoid duplication across API routes and cache functions
 */
export const TTL_MAP: Record<string, number> = {
  lineas: 86400, // 24 horas - casi estático
  calles: 86400, // 24 horas - casi estático
  intersecciones: 86400, // 24 horas - casi estático
  paradas: 86400, // 24 horas - casi estático
  "parada-lineas": 86400, // 24 horas - derivado de datos estáticos
  recorrido: 86400, // 24 horas - estático
  arribos: 60, // 1 minuto - dinámico
} as const;

/**
 * Default TTL for unknown actions
 */
export const DEFAULT_TTL = 86400;

/**
 * Valid action types
 */
export const STATIC_ACTIONS = [
  "lineas",
  "calles",
  "intersecciones",
  "paradas",
  "recorrido",
] as const;

export const DYNAMIC_ACTIONS = ["arribos"] as const;
