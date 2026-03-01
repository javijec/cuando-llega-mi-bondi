"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { Bandera } from "@/lib/hooks/use-recorridos";

interface BranchPillsProps {
  branches: Bandera[];
  selectedBranch: Bandera | null;
  onSelectBranch: (branch: Bandera) => void;
}

export function BranchPills({
  branches,
  selectedBranch,
  onSelectBranch,
}: BranchPillsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateFades = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateFades();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateFades, { passive: true });
    const ro = new ResizeObserver(updateFades);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateFades);
      ro.disconnect();
    };
  }, [updateFades, branches]);

  const getMask = () => {
    const left = canScrollLeft ? "transparent, black 15%" : "black, black";
    const right = canScrollRight ? "black 85%, transparent" : "black, black";
    return `linear-gradient(to right, ${left}, ${right})`;
  };

  if (branches.length === 0) return null;

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto pb-2 scrollbar-hidden"
      role="group"
      aria-label="Seleccionar ramal"
      style={{
        maskImage: getMask(),
        WebkitMaskImage: getMask(),
        transition: "mask-image 0.2s ease, -webkit-mask-image 0.2s ease",
      }}
    >
      {branches.map((branch) => (
        <button
          key={branch.codigo}
          onClick={() => onSelectBranch(branch)}
          aria-pressed={selectedBranch?.codigo === branch.codigo}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all",
            "shadow-md backdrop-blur-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            selectedBranch?.codigo === branch.codigo
              ? "bg-mdp-turquesa text-white shadow-lg"
              : "bg-card/90 text-foreground hover:bg-card border border-border",
          )}
        >
          {branch.descripcion}
        </button>
      ))}
    </div>
  );
}

export function BranchPillsSkeleton() {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-2 scrollbar-hidden"
      role="status"
      aria-label="Cargando ramales"
    >
      <div className="h-9 w-32 bg-muted rounded-full animate-pulse flex-shrink-0" />
      <div className="h-9 w-32 bg-muted rounded-full animate-pulse flex-shrink-0" />
      <div className="h-9 w-32 bg-muted rounded-full animate-pulse flex-shrink-0" />
    </div>
  );
}
