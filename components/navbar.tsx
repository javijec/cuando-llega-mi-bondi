"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  const isConsultar = pathname === "/consultar";
  const isFavoritos = pathname === "/favoritos";

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border"
    >
      <div className="max-w-md mx-auto flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <Link
          href="/consultar"
          className={cn(
            "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all cursor-pointer",
            isConsultar
              ? "text-mdp-amarillo"
              : "text-muted-foreground hover:text-foreground",
          )}
          aria-current={isConsultar ? "page" : undefined}
        >
          <Search className={cn("h-6 w-6", isConsultar && "fill-current")} />
          <span className="text-xs font-medium">Consultar</span>
        </Link>

        <Link
          href="/favoritos"
          className={cn(
            "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all cursor-pointer",
            isFavoritos
              ? "text-mdp-amarillo"
              : "text-muted-foreground hover:text-foreground",
          )}
          aria-current={isFavoritos ? "page" : undefined}
        >
          <Star className={cn("h-6 w-6", isFavoritos && "fill-current")} />
          <span className="text-xs font-medium">Favoritos</span>
        </Link>
      </div>
    </nav>
  );
}
