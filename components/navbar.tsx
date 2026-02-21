"use client";

import { cn } from "@/lib/utils";

interface NavbarProps {
  activeTab: "consultar" | "favoritos";
  onTabChange: (tab: "consultar" | "favoritos") => void;
}

export function Navbar({ activeTab, onTabChange }: NavbarProps) {
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
          <div className="flex bg-muted/30 p-1 m-2 rounded-2xl" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "consultar"}
              aria-controls="panel-consultar"
              onClick={() => onTabChange("consultar")}
              className={cn(
                "flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all cursor-pointer",
                activeTab === "consultar"
                  ? "btn-mdp-amarillo shadow-md"
                  : "text-muted-foreground",
              )}
            >
              Consultar
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "favoritos"}
              aria-controls="panel-favoritos"
              onClick={() => onTabChange("favoritos")}
              className={cn(
                "flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all cursor-pointer",
                activeTab === "favoritos"
                  ? "btn-mdp-amarillo shadow-md"
                  : "text-muted-foreground",
              )}
            >
              Favoritos
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
