"use client";

import { cn } from "@/lib/utils";

interface NavbarProps {
  activeTab: "consultar" | "favoritos";
  onTabChange: (tab: "consultar" | "favoritos") => void;
}

export function Navbar({ activeTab, onTabChange }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-md mx-auto px-4 py-3">
        {/* Logo */}
        <div className="text-center mb-3">
          <h1 className="text-2xl font-black uppercase tracking-tighter italic text-foreground">
            Mi<span className="text-primary font-light">Bondi</span>
          </h1>
          <div className="h-1 w-12 bg-primary mx-auto mt-1 rounded-full" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-secondary rounded-2xl p-1">
          <button
            type="button"
            onClick={() => onTabChange("consultar")}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300",
              activeTab === "consultar"
                ? "bg-primary text-primary-foreground shadow-lg"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Consultar
          </button>
          <button
            type="button"
            onClick={() => onTabChange("favoritos")}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300",
              activeTab === "favoritos"
                ? "bg-primary text-primary-foreground shadow-lg"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Favoritos
          </button>
        </div>
      </div>
    </nav>
  );
}
