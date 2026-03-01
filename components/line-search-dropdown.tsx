"use client";

import { useState, useRef, useEffect, useId } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import type { Linea } from "@/lib/types/bus";

interface LineSearchDropdownProps {
  lineas: Linea[];
  selectedLinea: string | null;
  onSelectLinea: (codigoLinea: string) => void;
  placeholder?: string;
}

export function LineSearchDropdown({
  lineas,
  selectedLinea,
  onSelectLinea,
  placeholder = "Buscar línea...",
}: LineSearchDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedLineaInfo = lineas.find(
    (l) => l.CodigoLineaParada === selectedLinea,
  );

  const filteredLineas = lineas.filter((linea) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      linea.Descripcion.toLowerCase().includes(query) ||
      linea.CodigoLineaParada.toLowerCase().includes(query)
    );
  });

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSelect = (codigoLinea: string) => {
    onSelectLinea(codigoLinea);
    setIsOpen(false);
    setSearchQuery("");
    triggerRef.current?.focus();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectLinea("");
    setSearchQuery("");
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const listId = useId();
  const inputId = useId();

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Bar Trigger */}
      <button
        ref={triggerRef}
        onClick={handleToggle}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listId : undefined}
        className="w-full bg-card border border-border rounded-2xl shadow-lg p-4 flex items-center justify-between hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="w-10 h-10 bg-mdp-turquesa rounded-full flex items-center justify-center flex-shrink-0"
            aria-hidden="true"
          >
            <Search className="w-5 h-5 text-white" />
          </div>
          {selectedLineaInfo ? (
            <div className="text-left min-w-0">
              <p className="font-bold text-foreground text-sm truncate">
                {selectedLineaInfo.Descripcion}
              </p>
              <p className="text-xs text-muted-foreground">
                Línea {selectedLineaInfo.CodigoLineaParada}
              </p>
            </div>
          ) : (
            <span className="font-semibold text-muted-foreground">
              {placeholder}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {selectedLinea && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleClear(e as unknown as React.MouseEvent);
                }
              }}
              className="p-1 hover:bg-muted rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
              aria-label="Limpiar selección"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </span>
          )}
          <ChevronDown
            className={`w-5 h-5 text-muted-foreground transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          id={listId}
          role="listbox"
          aria-label="Seleccionar línea"
          className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50 max-h-[60vh] flex flex-col"
        >
          {/* Search Input inside dropdown */}
          <div className="p-3 border-b border-border sticky top-0 bg-card">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                ref={inputRef}
                id={inputId}
                type="text"
                role="searchbox"
                aria-label="Buscar línea"
                placeholder="Buscar línea..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-muted rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              ) : null}
            </div>
          </div>

          {/* Lineas List */}
          <div className="overflow-y-auto flex-1" role="presentation">
            {filteredLineas.length === 0 ? (
              <div className="p-8 text-center" role="status" aria-live="polite">
                <p className="text-muted-foreground text-sm">
                  No se encontraron líneas
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border" role="presentation">
                {filteredLineas.map((linea) => (
                  <button
                    key={linea.CodigoLineaParada}
                    onClick={() => handleSelect(linea.CodigoLineaParada)}
                    role="option"
                    aria-selected={selectedLinea === linea.CodigoLineaParada}
                    className={`w-full px-4 py-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left focus-visible:outline-none focus-visible:bg-muted/50 ${
                      selectedLinea === linea.CodigoLineaParada
                        ? "bg-primary/10"
                        : ""
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                        selectedLinea === linea.CodigoLineaParada
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                      aria-hidden="true"
                    >
                      {linea.CodigoLineaParada.slice(0, 3)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground text-sm truncate">
                        {linea.Descripcion}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Línea {linea.CodigoLineaParada}
                      </p>
                    </div>
                    {selectedLinea === linea.CodigoLineaParada && (
                      <div
                        className="w-2 h-2 rounded-full bg-primary flex-shrink-0"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
