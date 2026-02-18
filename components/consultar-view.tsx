"use client";

import { useState, useCallback } from "react";
import { Search } from "lucide-react";
import { CustomSelect } from "./custom-select";
import { ArrivalsSheet } from "./arrivals-sheet-dynamic";
import { useConsultarBus } from "@/lib/hooks/use-consultar-bus";

export function ConsultarView() {
  const [isOpen, setIsOpen] = useState(false);
  const { actions, state, options, selectedInfo, isLoading } =
    useConsultarBus();

  const handleSelection = useCallback(
    (setter: (val: string | null) => void, val: string) => {
      setter(val || null);
      setIsOpen(false);
    },
    [],
  );

  const handleOpenSheet = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <div className="px-4 py-6 max-w-md mx-auto">
      <div className="space-y-4">
        <CustomSelect
          label="Línea"
          options={options.lineas}
          value={state.lineaSeleccionada || ""}
          onChange={(v) => handleSelection(actions.setLinea, v)}
          isLoading={isLoading.lineas}
        />

        {state.lineaSeleccionada && (
          <CustomSelect
            label="Calle"
            options={options.calles}
            value={state.calleSeleccionada || ""}
            onChange={(v) => handleSelection(actions.setCalle, v)}
            isLoading={isLoading.calles}
          />
        )}

        {state.calleSeleccionada && (
          <CustomSelect
            label="Intersección"
            options={options.intersecciones}
            value={state.interseccionSeleccionada || ""}
            onChange={(v) => handleSelection(actions.setInterseccion, v)}
            isLoading={isLoading.intersecciones}
          />
        )}

        {state.interseccionSeleccionada && (
          <CustomSelect
            label="Parada"
            options={options.paradas}
            value={state.paradaSeleccionada || ""}
            onChange={(v) => handleSelection(actions.setParada, v)}
            isLoading={isLoading.paradas}
          />
        )}
      </div>

      <button
        onClick={handleOpenSheet}
        disabled={!state.paradaSeleccionada}
        className="w-full mt-6 py-5 rounded-2xl font-black uppercase text-sm bg-primary text-primary-foreground shadow-lg disabled:opacity-40 flex items-center justify-center gap-2"
      >
        <Search className="w-4 h-4" />
        Consultar Arribo
      </button>

      <ArrivalsSheet
        isOpen={isOpen}
        onClose={handleCloseSheet}
        info={selectedInfo}
      />
    </div>
  );
}
