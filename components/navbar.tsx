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

  const navItems = [
    { href: "/consultar", label: "Consultar", icon: Search, active: isConsultar },
    { href: "/recorridos", label: "Recorridos", icon: Map, active: isRecorridos },
    { href: "/favoritos", label: "Favoritos", icon: Star, active: isFavoritos },
    { href: "/acerca", label: "Acerca de", icon: Info, active: isAcerca },
  ];

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:bottom-auto md:top-0 md:left-0 md:right-auto md:h-screen md:w-64 md:border-t-0 md:border-r md:border-border"
    >
      <div className="max-w-md mx-auto flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:max-w-none md:flex-col md:justify-start md:gap-1 md:py-6 md:px-4">
        
        {/* Logo — solo desktop */}
        <Link
          href="/"
          className="hidden md:flex items-center gap-3 px-3 py-3 mb-4 w-full"
          aria-label="MiBondi — inicio"
        >
          <span className="text-2xl font-black uppercase italic text-foreground" aria-hidden="true">
            Mi<span className="text-mdp-amarillo font-light">Bondi</span>
          </span>
        </Link>

        {navItems.map(({ href, label, icon: Icon, active }) => (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              // Base — mobile: columna centrada; desktop: fila full-width
              "relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors",
              "min-w-[44px] min-h-[44px] justify-center",           // touch target mínimo
              "md:flex-row md:w-full md:justify-start md:px-4 md:py-3 md:gap-3",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",

              active
                ? [
                    // ✅ text-secondary → turquesa en light (~4.85:1) y teal en dark (~4.2:1)
                    "text-secondary font-semibold",
                    "md:bg-secondary/10",
                  ]
                : [
                    "text-muted-foreground hover:text-foreground hover:bg-muted",
                    "transition-all duration-150",
                  ],
            )}
          >
            {/* Indicador activo en mobile — punto sobre el ícono */}
            {active && (
              <span
                aria-hidden="true"
                className="absolute top-1 inset-x-0 mx-auto w-1 h-1 rounded-full bg-secondary md:hidden"
              />
            )}

            {/* Indicador activo en desktop — barra izquierda */}
            {active && (
              <span
                aria-hidden="true"
                className="hidden md:block absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-secondary"
              />
            )}

            <Icon
              aria-hidden="true"
              className={cn(
                "h-6 w-6 shrink-0",
                active ? "text-secondary" : "text-muted-foreground",
              )}
            />

            <span className="text-xs font-medium md:text-sm">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}