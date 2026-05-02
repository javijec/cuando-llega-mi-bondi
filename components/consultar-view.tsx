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
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:items-start">
        <section
          id="panel-consultar"
          role="tabpanel"
          aria-labelledby="tab-consultar"
          className="min-w-0"
        >
          <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm">
            <div className="px-5 py-5 md:px-6">
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
                        onChange={(v) =>
                          handleSelection(actions.setInterseccion, v)
                        }
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
                  className={`mt-6 flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-base font-black uppercase tracking-wide shadow-lg transition-all md:hidden ${
                    isComplete
                      ? "btn-mdp-turquesa"
                      : "btn-mdp-amarillo opacity-50 cursor-not-allowed"
                  }`}
                >
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                  <span>
                    {isComplete
                      ? "Ver cuándo llega"
                      : `${completedSteps} de ${STEPS.length} pasos completados`}
                  </span>
                </button>
              </form>
            </div>
          </div>

          <ArrivalsSheet
            isOpen={isOpen}
            onClose={handleCloseSheet}
            info={selectedInfo}
          />
        </section>

        <aside className="min-w-0">
          {isComplete ? (
            <div className="lg:sticky lg:top-4">
              <ArrivalsPanel info={selectedInfo} />
            </div>
          ) : (
            <div className="hidden h-full rounded-[2rem] border border-dashed border-border bg-card/60 p-8 text-left md:block">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-mdp-turquesa">
                Vista previa
              </p>
              <h3 className="mt-3 text-2xl font-black text-foreground">
                Los arribos aparecen acá
              </h3>
              <p className="mt-3 max-w-md text-sm font-medium leading-6 text-muted-foreground">
                Primero elegí la parada. Cuando completes los pasos, este panel
                muestra el recorrido, las otras líneas que comparten la parada y
                los próximos colectivos sin apilar todo en el formulario.
              </p>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
