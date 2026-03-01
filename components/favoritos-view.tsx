"use client";

import { useState } from "react";
import Link from "next/link";
import { useFavoritosList } from "@/lib/hooks/useFavoritos";
import { useFavoritosStore } from "@/lib/stores/favoritosStore";
import { FavoritoCard } from "./favorito-card";
import { CustomSelect } from "./custom-select";
import { Star, Search } from "lucide-react";

export function FavoritosView() {
  const [orden, setOrden] = useState<"recientes" | "antiguos" | "alfabetico">(
    "recientes",
  );

  const eliminarFavorito = useFavoritosStore((state) => state.eliminarFavorito);
  const { favoritos, isEmpty } = useFavoritosList(orden);

  const opcionesOrden = [
    {
      value: "recientes",
      label: "Más recientes",
    },
    {
      value: "alfabetico",
      label: "Orden alfabético",
    },
    {
      value: "antiguos",
      label: "Más antiguos",
    },
  ];

  if (isEmpty) {
    return (
      <section
        id="panel-favoritos"
        role="tabpanel"
        aria-labelledby="tab-favoritos"
        className="px-4 py-16 max-w-md mx-auto text-center"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Star className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-black text-foreground mb-2 uppercase tracking-tight">
          Sin favoritos
        </h2>
        <p className="text-muted-foreground text-sm mb-6 font-medium max-w-50 mx-auto">
          Guarda tus paradas favoritas para acceso rápido
        </p>
        <Link
          href="/consultar"
          className="btn-mdp-amarillo px-6 py-3 rounded-2xl text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
        >
          <Search className="w-4 h-4" aria-hidden="true" />
          Buscar colectivo
        </Link>
      </section>
    );
  }

  return (
    <section
      id="panel-favoritos"
      role="tabpanel"
      aria-labelledby="tab-favoritos"
      className="px-4 py-5 max-w-md mx-auto"
    >
      <div className="mb-5">
        <CustomSelect
          label="Ordenar por"
          options={opcionesOrden}
          value={orden}
          onChange={(val) => setOrden(val as typeof orden)}
        />
      </div>

      <ul
        className="space-y-4"
        role="list"
        aria-label="Lista de paradas favoritas"
      >
        {favoritos.map((fav, index) => (
          <li key={fav.id}>
            <FavoritoCard
              favorito={fav}
              onEliminar={eliminarFavorito}
              refreshMode="auto"
              index={index}
            />
          </li>
        ))}
      </ul>

      <p
        className="mt-8 text-center text-sm text-muted-foreground font-medium"
        aria-live="polite"
      >
        {favoritos.length}{" "}
        {favoritos.length === 1 ? "favorito guardado" : "favoritos guardados"}
      </p>
    </section>
  );
}
