"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { CustomSelect } from "./custom-select";
import { ArrivalsSheet } from "./arrivals-sheet";
import { useConsultarBus } from "@/lib/hooks/use-consultar-bus";

export function ConsultarView({ onVerRecorrido }: { onVerRecorrido: (id: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const { store, options, selectedInfo, isLoading } = useConsultarBus();

  const handleSelection = (setter: (val: string | null) => void, val: string) => {
    setter(val || null);
    setIsOpen(false);
  };

  return (
    <div className="px-4 py-6 max-w-md mx-auto">
      <div className="space-y-4">
        <CustomSelect label="Línea" options={options.lineas} value={store.lineaSeleccionada || ""} 
          onChange={(v) => handleSelection(store.setLinea, v)} isLoading={isLoading.lineas} />
        
        {store.lineaSeleccionada && (
          <CustomSelect label="Calle" options={options.calles} value={store.calleSeleccionada || ""} 
            onChange={(v) => handleSelection(store.setCalle, v)} isLoading={isLoading.calles} />
        )}

        {store.calleSeleccionada && (
          <CustomSelect label="Intersección" options={options.intersecciones} value={store.interseccionSeleccionada || ""} 
            onChange={(v) => handleSelection(store.setInterseccion, v)} isLoading={isLoading.intersecciones} />
        )}

        {store.interseccionSeleccionada && (
          <CustomSelect label="Parada" options={options.paradas} value={store.paradaSeleccionada || ""} 
            onChange={(v) => handleSelection(store.setParada, v)} isLoading={isLoading.paradas} />
        )}
      </div>

      <button
        onClick={() => setIsOpen(true)}
        disabled={!store.paradaSeleccionada}
        className="w-full mt-6 py-5 rounded-2xl font-black uppercase text-sm bg-primary text-primary-foreground shadow-lg disabled:opacity-40 flex items-center justify-center gap-2"
      >
        <Search className="w-4 h-4" />
        Consultar Arribo
      </button>

      <ArrivalsSheet 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        info={selectedInfo} 
        onVerRecorrido={onVerRecorrido} 
      />
    </div>
  );
}