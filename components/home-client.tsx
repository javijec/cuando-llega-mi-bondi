"use client";

import { useState, useCallback } from "react";
import { Navbar } from "@/components/navbar";
import { ConsultarViewWithSuspense } from "@/components/consultar-view-suspense";
import { FavoritosViewWithSuspense } from "@/components/favoritos-view-suspense";
import { useBusStore } from "@/lib/stores/busStore";
import type { Favorito } from "@/lib/types/bus";

export function HomeClient() {
  const [activeTab, setActiveTab] = useState<"consultar" | "favoritos">(
    "consultar",
  );
  const { setLinea } = useBusStore();

  const handleConsultarFromFavorito = useCallback(
    (favorito: Favorito) => {
      setLinea(favorito.codigoLinea);
      setActiveTab("consultar");
    },
    [setLinea],
  );

  return (
    <>
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "consultar" ? (
        <ConsultarViewWithSuspense />
      ) : (
        <FavoritosViewWithSuspense
          onConsultar={handleConsultarFromFavorito}
          onGoToConsultar={() => setActiveTab("consultar")}
        />
      )}
    </>
  );
}
