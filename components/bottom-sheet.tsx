"use client";

import { useEffect, useCallback } from "react";
import { useRecorrido } from "@/lib/hooks/useBusQuery";
import { Loader2, X } from "lucide-react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  codigoLinea: string;
}

export function BottomSheet({ isOpen, onClose, codigoLinea }: BottomSheetProps) {
  const { data, isLoading, error } = useRecorrido(
    isOpen ? codigoLinea : ""
  );

  // Close on ESC key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  // Filter to just stops (IsPuntoPaso === true)
  const paradas = (data?.puntos || []).filter((p) => p.IsPuntoPaso);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
        role="presentation"
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-[2.5rem] border-t border-border shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[80vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Recorrido de la linea"
      >
        {/* Handle */}
        <div className="flex justify-center pt-4 pb-2 shrink-0">
          <div className="w-12 h-1 bg-muted rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
          <h3 className="text-xl font-black text-foreground uppercase">
            Recorrido <span className="text-primary">{codigoLinea}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary hover:bg-muted transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto flex-1 min-h-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-muted-foreground text-sm mt-3 font-bold uppercase tracking-widest">
                Cargando recorrido...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive text-sm font-bold">
                Error al cargar el recorrido
              </p>
              <p className="text-muted-foreground text-xs mt-2">{error.message}</p>
            </div>
          ) : paradas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">No hay paradas disponibles</p>
            </div>
          ) : (
            <div className="space-y-0">
              {paradas.map((parada, index) => {
                const isFirst = index === 0;
                const isLast = index === paradas.length - 1;

                // Parse description - format: "96;A STA ROSA;A STA ROSA"
                const parts = parada.Descripcion.split(";");
                const stopName = parts[1] || parts[0] || parada.Descripcion;

                return (
                  <div key={`${parada.Latitud}-${parada.Longitud}-${index}`} className="flex items-start gap-3">
                    {/* Timeline */}
                    <div className="flex flex-col items-center shrink-0">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          isFirst || isLast ? "bg-primary" : "bg-muted"
                        }`}
                      />
                      {!isLast && <div className="w-0.5 h-10 bg-border" />}
                    </div>

                    {/* Stop info */}
                    <div className="flex-1 pb-3 -mt-1">
                      <p
                        className={`font-bold text-sm ${
                          isFirst || isLast ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {stopName.trim()}
                      </p>
                      {(isFirst || isLast) && (
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                          {isFirst ? "Inicio" : "Fin del recorrido"}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-card/95 backdrop-blur-sm shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase text-sm active:scale-95 transition-transform"
          >
            Cerrar
          </button>
        </div>
      </div>
    </>
  );
}
