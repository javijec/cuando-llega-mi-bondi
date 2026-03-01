"use client";

import { useState, useCallback, useEffect } from "react";
import { MapPin } from "lucide-react";
import { CustomSelect } from "./custom-select";
import { ArrivalsSheet } from "./arrivals-sheet-dynamic";
import { ArrivalsPanel } from "./arrivals-panel";
import { useConsultarBus } from "@/lib/hooks/use-consultar-bus";

const STEPS = [
  { key: "linea", label: "Línea" },
  { key: "calle", label: "Calle" },
  { key: "interseccion", label: "Intersección" },
  { key: "parada", label: "Parada" },
] as const;

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

  useEffect(() => {
    if (
      !state.lineaSeleccionada &&
      options.lineas.length === 1 &&
      !isLoading.lineas
    ) {
      actions.setLinea(options.lineas[0].value);
    }
  }, [state.lineaSeleccionada, options.lineas, isLoading.lineas, actions]);

  useEffect(() => {
    if (
      state.lineaSeleccionada &&
      !state.calleSeleccionada &&
      options.calles.length === 1 &&
      !isLoading.calles
    ) {
      actions.setCalle(options.calles[0].value);
    }
  }, [
    state.lineaSeleccionada,
    state.calleSeleccionada,
    options.calles,
    isLoading.calles,
    actions,
  ]);

  useEffect(() => {
    if (
      state.calleSeleccionada &&
      !state.interseccionSeleccionada &&
      options.intersecciones.length === 1 &&
      !isLoading.intersecciones
    ) {
      actions.setInterseccion(options.intersecciones[0].value);
    }
  }, [
    state.calleSeleccionada,
    state.interseccionSeleccionada,
    options.intersecciones,
    isLoading.intersecciones,
    actions,
  ]);

  useEffect(() => {
    if (
      state.interseccionSeleccionada &&
      !state.paradaSeleccionada &&
      options.paradas.length === 1 &&
      !isLoading.paradas
    ) {
      actions.setParada(options.paradas[0].value);
    }
  }, [
    state.interseccionSeleccionada,
    state.paradaSeleccionada,
    options.paradas,
    isLoading.paradas,
    actions,
  ]);

  const completedSteps = [
    !!state.lineaSeleccionada,
    !!state.calleSeleccionada,
    !!state.interseccionSeleccionada,
    !!state.paradaSeleccionada,
  ].filter(Boolean).length;

  const isComplete = completedSteps === STEPS.length;

  const getStepStatus = (index: number) => {
    const hasSelection = [
      state.lineaSeleccionada,
      state.calleSeleccionada,
      state.interseccionSeleccionada,
      state.paradaSeleccionada,
    ][index];

    const prevStepsComplete =
      index === 0 ||
      [
        state.lineaSeleccionada,
        state.calleSeleccionada,
        state.interseccionSeleccionada,
      ][index - 1];

    if (hasSelection) return { isComplete: true, isActive: false };
    if (prevStepsComplete && !hasSelection)
      return { isComplete: false, isActive: true };
    return { isComplete: false, isActive: false };
  };

  return (
    <>
      <section
        id="panel-consultar"
        role="tabpanel"
        aria-labelledby="tab-consultar"
        className="px-4 py-6 max-w-md mx-auto md:max-w-none md:w-full overflow-y-auto"
      >
        <header className="text-center mb-6 md:text-left">
          <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-1">
            Consultá tu bondi
          </h2>
          <p className="text-sm text-muted-foreground font-medium">
            Completá los 4 pasos
          </p>
        </header>

        <form
          onSubmit={(e) => e.preventDefault()}
          aria-label="Formulario de consulta de bondi"
        >
          <div
            className="space-y-3"
            role="list"
            aria-label="Pasos para consultar"
          >
            <div role="listitem">
              <CustomSelect
                label={STEPS[0].label}
                options={options.lineas}
                value={state.lineaSeleccionada || ""}
                onChange={(v) => handleSelection(actions.setLinea, v)}
                isLoading={isLoading.lineas}
                stepNumber={1}
                isComplete={getStepStatus(0).isComplete}
                isActive={getStepStatus(0).isActive}
              />
            </div>

            {state.lineaSeleccionada && (
              <div role="listitem">
                <CustomSelect
                  label={STEPS[1].label}
                  options={options.calles}
                  value={state.calleSeleccionada || ""}
                  onChange={(v) => handleSelection(actions.setCalle, v)}
                  isLoading={isLoading.calles}
                  stepNumber={2}
                  isComplete={getStepStatus(1).isComplete}
                  isActive={getStepStatus(1).isActive}
                />
              </div>
            )}

            {state.calleSeleccionada && (
              <div role="listitem">
                <CustomSelect
                  label={STEPS[2].label}
                  options={options.intersecciones}
                  value={state.interseccionSeleccionada || ""}
                  onChange={(v) => handleSelection(actions.setInterseccion, v)}
                  isLoading={isLoading.intersecciones}
                  stepNumber={3}
                  isComplete={getStepStatus(2).isComplete}
                  isActive={getStepStatus(2).isActive}
                />
              </div>
            )}

            {state.interseccionSeleccionada && (
              <div role="listitem">
                <CustomSelect
                  label={STEPS[3].label}
                  options={options.paradas}
                  value={state.paradaSeleccionada || ""}
                  onChange={(v) => handleSelection(actions.setParada, v)}
                  isLoading={isLoading.paradas}
                  stepNumber={4}
                  isComplete={getStepStatus(3).isComplete}
                  isActive={getStepStatus(3).isActive}
                />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleOpenSheet}
            disabled={!state.paradaSeleccionada}
            aria-disabled={!state.paradaSeleccionada}
            className={`w-full mt-6 py-4 rounded-2xl font-black text-base uppercase tracking-wide shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer md:hidden ${
              isComplete
                ? "btn-mdp-turquesa"
                : "btn-mdp-amarillo opacity-50 cursor-not-allowed"
            }`}
          >
            <MapPin className="w-5 h-5" aria-hidden="true" />
            <span>
              {isComplete
                ? "Ver cuándo llega"
                : `${completedSteps} de ${STEPS.length} pasos completados`}
            </span>
          </button>
        </form>

        <ArrivalsSheet
          isOpen={isOpen}
          onClose={handleCloseSheet}
          info={selectedInfo}
        />
      </section>

      {isComplete && (
        <div className="hidden md:block md:overflow-hidden">
          <ArrivalsPanel info={selectedInfo} />
        </div>
      )}
    </>
  );
}
