"use client";

import { useState } from "react";
import { useFavoritosList } from "@/lib/hooks/useFavoritos";
import { useFavoritosStore } from "@/lib/stores/favoritosStore";
import { FavoritoCard } from "./favorito-card";
import { CustomSelect } from "./custom-select";
import { Star, Search } from "lucide-react";
import type { Favorito } from "@/lib/types/bus";

interface FavoritosViewProps {
  onConsultar: (favorito: Favorito) => void;
  onGoToConsultar: () => void;
}

export function FavoritosView({
  onConsultar,
  onGoToConsultar,
}: FavoritosViewProps) {
  const [orden, setOrden] = useState<"recientes" | "antiguos" | "alfabetico">(
    "recientes"
  );

  const eliminarFavorito = useFavoritosStore((state) => state.eliminarFavorito);
  const { favoritos, isEmpty } = useFavoritosList(orden);

  const opcionesOrden = [
    { value: "recientes", label: "Recientes" },
    { value: "alfabetico", label: "A - Z" },
    { value: "antiguos", label: "Más antiguos" },
  ];

  if (isEmpty) {
    return (
      <div className="px-4 py-16 max-w-md mx-auto text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
          <Star className="w-8 h-8 text-mdp-amarillo" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-black text-foreground uppercase mb-2">
          Sin Favoritos
        </h3>
        <p className="text-muted-foreground text-sm mb-6">
          Guarda tus paradas para acceso rápido
        </p>
        <button
          type="button"
          onClick={onGoToConsultar}
          className="btn-mdp-amarillo px-6 py-3 rounded-2xl uppercase text-sm active:scale-95 transition-transform flex items-center gap-2 mx-auto"
        >
          <Search className="w-4 h-4" />
          Buscar Colectivos
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-md mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <h2 className="text-2xl font-black text-foreground uppercase text-balance">
          Mis <span className="text-mdp-amarillo">Favoritos</span>
        </h2>

        <div className="w-full sm:w-auto">
          <CustomSelect
            label="Ordenar por"
            options={opcionesOrden}
            value={orden}
            onChange={(val) => setOrden(val as typeof orden)}
            placeholder="Seleccionar orden"
          />
        </div>
      </div>

      {/* Performance info (solo en dev) */}
      {process.env.NODE_ENV === "development" && (
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-left">
          <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">
            🚀 <strong>Optimizaciones activas:</strong>
          </p>
          <ul className="text-[10px] text-blue-600/80 dark:text-blue-400/80 space-y-1">
            <li>✓ Debounced visibility (150ms)</li>
            <li>✓ Staged activation (100ms/card)</li>
            <li>✓ Conditional polling (solo visibles)</li>
            <li>✓ Smart caching (TanStack Query)</li>
          </ul>
          <p className="text-[10px] text-blue-600/60 dark:text-blue-400/60 mt-2">
            Cards con arribos cargados: {favoritos.length} metadata | ~
            {Math.min(5, favoritos.length)} activas simultáneamente
          </p>
        </div>
      )}

      {/* FAVORITOS LIST */}
      <div className="space-y-4">
        {favoritos.map((fav, index) => (
          <FavoritoCard
            key={fav.id}
            favorito={fav}
            onEliminar={eliminarFavorito}
            onConsultar={onConsultar}
            autoRefresh={true}
            index={index}
          />
        ))}
      </div>

      {/* FOOTER INFO */}
      <div className="mt-8 text-center space-y-2 text-sm text-muted-foreground">
        <p>
          {favoritos.length} {favoritos.length === 1 ? "favorito" : "favoritos"}
        </p>
        {favoritos.length > 10 && (
          <p className="text-xs text-muted-foreground/60">
            💡 Scroll para cargar más arribos progresivamente
          </p>
        )}
      </div>
    </div>
  );
}