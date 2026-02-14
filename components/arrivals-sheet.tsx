import { Sheet, SheetRef } from "react-modal-sheet";
import { useRef } from "react";
import { X, ChevronUp, MapPin } from "lucide-react";
import { ArrivalsPanel } from "./arrivals-panel";

interface ArrivalsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  info: any;
  onVerRecorrido: (codigo: string) => void;
}

export function ArrivalsSheet({
  isOpen,
  onClose,
  info,
  onVerRecorrido,
}: ArrivalsSheetProps) {
  const sheetRef = useRef<SheetRef>(null);

  // Solo 3 snap points - más simple y fluido
  const snapPoints = [0,0.15,0.5, 1];

  return (
    <Sheet
      ref={sheetRef}
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={snapPoints}
      initialSnap={2} // Empieza en 50%
      // Animación más rápida y natural
      tweenConfig={{
        ease: "easeOut",
        duration: 0.3,
      }}
      // Hace más difícil cerrar con swipe rápido
      dragVelocityThreshold={1500}
      // Requiere deslizar más para cerrar
      dragCloseThreshold={0.8}
      disableDismiss={true}
      // Callback para debug (opcional)
      onSnap={(snapIndex) => {
        console.log("Snap to index:", snapIndex);
      }}
    >
      <Sheet.Container className="rounded-t-3xl bg-background! border-t border-border! shadow-2xl">
        {/* Header simplificado - mejor para el drag */}
        <Sheet.Header>
          <div className="px-6 pt-4 pb-3">
            {/* Indicador de drag centrado */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Info del header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-xl font-black text-foreground uppercase">
                  {info.linea?.Descripcion || "Información"}
                </h3>
                <span className="inline-block mt-1 px-2 py-0.5 bg-primary text-primary-foreground text-[9px] font-black rounded-full uppercase">
                  {info.parada?.AbreviaturaBandera}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-foreground/10 hover:bg-foreground/20 transition-colors ml-2 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Location info */}
            <div className="space-y-1">
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground font-medium">
                  {info.calle?.Descripcion}
                </p>
              </div>
              <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wide ml-5">
                {"e "}
                {info.interseccion?.Descripcion}
              </p>
            </div>
          </div>
        </Sheet.Header>

        <Sheet.Content
          // Deshabilita drag en el contenido cuando no está en la parte superior
          // Esto evita conflictos entre scroll y drag
          disableDrag={(state) => state.scrollPosition !== "top"}
          className="px-4 pb-safe"
        >
          {/* Hint de scroll - solo visible cuando no está completamente abierto */}
          <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground border-b border-border/50 mb-4">
            <ChevronUp className="w-4 h-4" />
            <span>Desliza para ver más</span>
          </div>

          {/* Contenido principal */}
          {info.parada && (
            <ArrivalsPanel
              parada={info.parada}
              codigoLinea={info.linea.CodigoLineaParada}
              nombreLinea={info.linea.Descripcion}
              calleNombre={info.calle.Descripcion}
              interseccionNombre={info.interseccion.Descripcion}
              onVerRecorrido={() => {
                onClose();
                onVerRecorrido(info.linea.CodigoLineaParada);
              }}
            />
          )}
        </Sheet.Content>
      </Sheet.Container>

      <Sheet.Backdrop
        onTap={onClose}
        className="backdrop-blur-sm"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
      />
    </Sheet>
  );
}