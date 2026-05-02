// === TIPOS DE LA API ===

/**
 * Respuesta base de todas las llamadas a la API
 */
export interface APIBaseResponse {
  CodigoEstado: number;
  MensajeEstado: string;
  // El contenido específico varía según el endpoint
}

/**
 * Línea de transporte
 */
export interface Linea {
  CodigoLineaParada: string;
  Descripcion: string;
  CodigoEntidad: string;
  CodigoEmpresa: number;
}

/**
 * Respuesta del endpoint RecuperarLineaPorCuandoLlega
 */
export interface LineasResponse extends APIBaseResponse {
  lineas: Linea[];
}

/**
 * Calle principal
 */
export interface Calle {
  Codigo: string;
  Descripcion: string;
}

/**
 * Respuesta del endpoint RecuperarCallesPrincipalPorLinea
 */
export interface CallesResponse extends APIBaseResponse {
  calles: Calle[];
}

/**
 * Intersección entre calles
 */
export interface Interseccion {
  Codigo: string;
  Descripcion: string;
}

/**
 * Respuesta del endpoint RecuperarInterseccionPorLineaYCalle
 */
export interface InterseccionesResponse extends APIBaseResponse {
  intersecciones?: Interseccion[];
  calles?: Interseccion[]; // A veces la API devuelve "calles" en lugar de "intersecciones"
}

/**
 * Parada de colectivo con bandera (dirección/ramal)
 */
export interface Parada {
  Codigo: string;
  Identificador: string;
  Descripcion: string;
  AbreviaturaBandera: string;
  AbreviaturaAmpliadaBandera: string;
  LatitudParada: number | null;
  LongitudParada: number | null;
}

/**
 * Respuesta del endpoint RecuperarParadasConBanderaPorLineaCalleEInterseccion
 */
export interface ParadasResponse extends APIBaseResponse {
  paradas: Parada[];
}

/**
 * Relación entre una parada física y una línea que pasa por ella
 */
export interface ParadaLineaRelacion {
  linea: Linea;
  parada: Parada;
}

/**
 * Respuesta derivada para obtener todas las líneas que comparten una parada
 */
export type ParadaLineasResponse = ParadaLineaRelacion[];

/**
 * Arribo próximo de un colectivo
 */
export interface Arribo {
  DescripcionLinea: string;
  DescripcionBandera: string;
  Arribo: string; // ej: "68 min. aprox."
  Latitud: string;
  Longitud: string;
  LatitudParada: string;
  LongitudParada: string;
  DescripcionCortaBandera: string;
  DescripcionCartelBandera: string;
  EsAdaptado: string; // "True" | "False"
  IdentificadorCoche: string;
  IdentificadorChofer: string;
  DesvioHorario: string; // ej: "-00:03"
  UltimaFechaHoraGPS: string; // ej: "05/02/2026 17:40:47"
  MensajeError: string;
  CodigoLineaParada: string;
}

/**
 * Respuesta del endpoint RecuperarProximosArribosW
 */
export interface ArribosResponse extends APIBaseResponse {
  arribos: Arribo[];
}

/**
 * Punto del recorrido de una línea en el mapa
 */
export interface PuntoRecorrido {
  Descripcion: string; // ej: "96;A STA ROSA;A STA ROSA"
  AbreviaturaBanderaSMP: string; // ej: "A STA ROSA"
  AbreviaturaLineaSMP: string; // ej: "501"
  IsPuntoPaso: boolean; // true = parada oficial, false = punto de trazado
  Latitud: number;
  Longitud: number;
}

/**
 * Respuesta del endpoint RecuperarRecorridoParaMapaAbrevYAmpliPorEntidadYLinea
 */
export interface RecorridoResponse extends APIBaseResponse {
  puntos: PuntoRecorrido[];
}

/**
 * Parada cercana derivada de recorridos agregados
 */
export interface NearbyStop {
  id: string;
  codigoLineaParada: string;
  nombreLinea: string;
  bandera: string;
  descripcion: string;
  latitud: number;
  longitud: number;
  distanciaMetros: number;
}

export interface NearbyStopsResponse {
  paradas: NearbyStop[];
}

// === FAVORITOS ===

/**
 * Favorito guardado por el usuario
 */
export interface Favorito {
  id: string; // UUID
  // Identificadores
  codigoLinea: string;
  identificadorParada: string;
  codigoParada: string;
  // Información descriptiva
  nombreLinea: string;
  bandera: string;
  banderaCompleta: string;
  descripcionParada: string;
  calle: string;
  interseccion: string;
  // Metadata
  fechaAgregado: string;
  ultimoAcceso?: string;
}

// === TIPOS DE REQUEST/RESPONSE ===

export type AccionAPI =
  | "RecuperarLineaPorCuandoLlega"
  | "RecuperarCallesPrincipalPorLinea"
  | "RecuperarInterseccionPorLineaYCalle"
  | "RecuperarParadasConBanderaPorLineaCalleEInterseccion"
  | "RecuperarProximosArribosW"
  | "RecuperarRecorridoParaMapaAbrevYAmpliPorEntidadYLinea";

export interface APIRequest {
  accion: AccionAPI;
  params?: Record<string, string | number>;
}

export interface APIResponse<T> {
  resultado: T;
}

export interface ErrorResponse {
  error: string;
}
