"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Map, Star, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  const isConsultar = pathname === "/consultar";
  const isRecorridos = pathname === "/recorridos";
  const isFavoritos = pathname === "/favoritos";
  const isAcerca = pathname === "/acerca";

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:bottom-auto md:top-0 md:left-0 md:right-auto md:h-screen md:w-64 md:border-t-0 md:border-r md:border-border"
    >
      <div className="max-w-md mx-auto flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:max-w-none md:flex-col md:justify-start md:gap-2 md:py-6 md:px-4">
        <Link
          href="/"
          className="hidden md:flex items-center gap-3 px-3 py-3 mb-4 w-full"
        >
          <div className="text-2xl font-black uppercase italic text-foreground">
            Mi<span className="text-mdp-amarillo font-light">Bondi</span>
          </div>
        </Link>

        <Link
          href="/consultar"
          className={cn(
            "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all cursor-pointer md:flex-row md:w-full md:justify-start md:px-4 md:py-3",
            isConsultar
              ? "text-mdp-amarillo md:bg-mdp-turquesa/10"
              : "text-muted-foreground hover:text-foreground",
          )}
          aria-current={isConsultar ? "page" : undefined}
        >
          <Search
            className={cn(
              "h-6 w-6",
              isConsultar ? "text-primary" : "text-muted-foreground",
            )}
          />
          <span className="text-xs font-medium md:text-sm">Consultar</span>
        </Link>

        <Link
          href="/recorridos"
          className={cn(
            "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all cursor-pointer md:flex-row md:w-full md:justify-start md:px-4 md:py-3",
            isRecorridos
              ? "text-mdp-amarillo md:bg-mdp-turquesa/10"
              : "text-muted-foreground hover:text-foreground",
          )}
          aria-current={isRecorridos ? "page" : undefined}
        >
          <Map
            className={cn(
              "h-6 w-6",
              isRecorridos ? "text-primary" : "text-muted-foreground",
            )}
          />
          <span className="text-xs font-medium md:text-sm">Recorridos</span>
        </Link>

        <Link
          href="/favoritos"
          className={cn(
            "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all cursor-pointer md:flex-row md:w-full md:justify-start md:px-4 md:py-3",
            isFavoritos
              ? "text-mdp-amarillo md:bg-mdp-turquesa/10"
              : "text-muted-foreground hover:text-foreground",
          )}
          aria-current={isFavoritos ? "page" : undefined}
        >
          <Star
            className={cn(
              "h-6 w-6",
              isFavoritos ? "text-primary" : "text-muted-foreground",
            )}
          />
          <span className="text-xs font-medium md:text-sm">Favoritos</span>
        </Link>

        <Link
          href="/acerca"
          className={cn(
            "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all cursor-pointer md:flex-row md:w-full md:justify-start md:px-4 md:py-3",
            isAcerca
              ? "text-mdp-amarillo md:bg-mdp-turquesa/10"
              : "text-muted-foreground hover:text-foreground",
          )}
          aria-current={isAcerca ? "page" : undefined}
        >
          <Info
            className={cn(
              "h-6 w-6",
              isAcerca ? "text-primary" : "text-muted-foreground",
            )}
          />
          <span className="text-xs font-medium md:text-sm">Acerca de</span>
        </Link>
      </div>
    </nav>
  );
}
