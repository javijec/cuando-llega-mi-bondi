"use client";

import { useState, useCallback } from "react";
import { Navbar } from "@/components/navbar";
import { ConsultarView } from "@/components/consultar-view";
import { FavoritosView } from "@/components/favoritos-view";
import { BottomSheet } from "@/components/bottom-sheet";
import { useBusStore } from "@/lib/stores/busStore";
import type { Favorito } from "@/lib/types/bus";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"consultar" | "favoritos">("consultar");
  const [bottomSheetLinea, setBottomSheetLinea] = useState<string | null>(null);
  const { setLinea } = useBusStore();

  const handleVerRecorrido = useCallback((codigoLinea: string) => {
    setBottomSheetLinea(codigoLinea);
  }, []);

  const handleCloseBottomSheet = useCallback(() => {
    setBottomSheetLinea(null);
  }, []);

  // When user taps "Ver todos los arribos" from a favorito card
  const handleConsultarFromFavorito = useCallback(
    (favorito: Favorito) => {
      setLinea(favorito.codigoLinea);
      setActiveTab("consultar");
    },
    [setLinea]
  );

  return (
    <main className="min-h-screen bg-background pb-8">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "consultar" ? (
        <ConsultarView onVerRecorrido={handleVerRecorrido} />
      ) : (
        <FavoritosView
          onConsultar={handleConsultarFromFavorito}
          onGoToConsultar={() => setActiveTab("consultar")}
        />
      )}

      <BottomSheet
        isOpen={!!bottomSheetLinea}
        onClose={handleCloseBottomSheet}
        codigoLinea={bottomSheetLinea || ""}
      />
    </main>
  );
}
