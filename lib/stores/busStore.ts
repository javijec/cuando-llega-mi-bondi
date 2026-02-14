// lib/stores/busStore.ts
import { create } from 'zustand';

// Definimos solo el estado de la UI
interface BusUIState {
  // Selecciones (IDs)
  lineaSeleccionada: string | null;
  calleSeleccionada: string | null;
  interseccionSeleccionada: string | null;
  paradaSeleccionada: string | null; // ID para buscar arribos

  // Acciones (Solo cambian IDs, no hacen fetch)
  setLinea: (id: string | null) => void;
  setCalle: (id: string | null) => void;
  setInterseccion: (id: string | null) => void;
  setParada: (id: string | null) => void;
  
  // Reset total
  resetSelecciones: () => void;
}

export const useBusStore = create<BusUIState>((set) => ({
  lineaSeleccionada: null,
  calleSeleccionada: null,
  interseccionSeleccionada: null,
  paradaSeleccionada: null,

  // Al seleccionar línea, reseteamos todo lo de abajo
  setLinea: (id) => set({ 
    lineaSeleccionada: id,
    calleSeleccionada: null,
    interseccionSeleccionada: null,
    paradaSeleccionada: null 
  }),

  // Al seleccionar calle, reseteamos intersección y parada
  setCalle: (id) => set({ 
    calleSeleccionada: id,
    interseccionSeleccionada: null,
    paradaSeleccionada: null 
  }),

  // Al seleccionar intersección, reseteamos la parada
  setInterseccion: (id) => set({ 
    interseccionSeleccionada: id,
    paradaSeleccionada: null 
  }),

  setParada: (id) => set({ 
    paradaSeleccionada: id 
  }),

  resetSelecciones: () => set({
    lineaSeleccionada: null,
    calleSeleccionada: null,
    interseccionSeleccionada: null,
    paradaSeleccionada: null,
  }),
}));