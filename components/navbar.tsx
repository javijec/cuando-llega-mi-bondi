"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  const isConsultar = pathname === "/consultar";
  const isFavoritos = pathname === "/favoritos";

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-md mx-auto">
        <div className="text-center py-3 border-b border-border/50">
          <h1 className="text-2xl font-black uppercase tracking-tighter italic text-foreground">
            Mi<span className="text-mdp-amarillo font-light">Bondi</span>
          </h1>
          <div
            className="h-1 w-10 bg-mdp-amarillo mx-auto mt-1 rounded-full"
            aria-hidden="true"
          />
        </div>

        <nav aria-label="Navegación principal">
          <div className="flex bg-muted/30 p-1 m-2 rounded-2xl">
            <Link
              href="/consultar"
              className={cn(
                "flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all text-center cursor-pointer",
                isConsultar
                  ? "btn-mdp-amarillo shadow-md"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-current={isConsultar ? "page" : undefined}
            >
              Consultar
            </Link>
            <Link
              href="/favoritos"
              className={cn(
                "flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all text-center cursor-pointer",
                isFavoritos
                  ? "btn-mdp-amarillo shadow-md"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-current={isFavoritos ? "page" : undefined}
            >
              Favoritos
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
