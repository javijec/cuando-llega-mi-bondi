"use client";

import { ChevronDown, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  label: string;
  placeholder?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  stepNumber?: number;
  isComplete?: boolean;
  isActive?: boolean;
}

export function CustomSelect({
  label,
  placeholder,
  options,
  value,
  onChange,
  disabled = false,
  isLoading = false,
  stepNumber,
  isComplete = false,
  isActive = false,
}: CustomSelectProps) {
  const hasValue = value && value.length > 0;
  const needsAttention = isActive && !hasValue && !isLoading;
  const selectId = `select-${label.toLowerCase().replace(/\s+/g, "-")}`;

  // Buscamos el label de la opción seleccionada para mostrarlo visualmente
  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  return (
    <div
      className={`relative flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 ${
        needsAttention
          ? "bg-mdp-amarillo/15 ring-2 ring-mdp-amarillo"
          : isComplete
            ? "bg-mdp-turquesa/10"
            : "bg-card"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {/* ESTRATEGIA: El select nativo se posiciona absolutamente sobre TODO el contenedor.
        Se vuelve invisible con opacity-0 pero sigue siendo funcional y accesible.
      */}
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || isLoading}
        aria-required={needsAttention}
        aria-invalid={needsAttention}
        aria-describedby={needsAttention ? `${selectId}-hint` : undefined}
        className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer disabled:cursor-not-allowed"
      >
        <option value="" disabled>
          {placeholder || `Seleccionar ${label.toLowerCase()}`}
        </option>
        {options.map((opt, index) => (
          <option key={`${opt.value}-${index}`} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Contenido Visual (Capa inferior al select) */}
      {stepNumber !== undefined && (
        <div
          className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-black text-sm transition-all ${
            isComplete
              ? "bg-mdp-turquesa text-white"
              : needsAttention
                ? "bg-mdp-amarillo text-foreground"
                : "bg-muted text-muted-foreground"
          }`}
          aria-hidden="true"
        >
          {isComplete ? <CheckCircle2 className="w-5 h-5" /> : stepNumber}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <label
          id={`${selectId}-label`}
          htmlFor={selectId}
          className={`block text-xs font-semibold uppercase tracking-wide mb-1 transition-all ${
            hasValue ? "text-muted-foreground/60" : needsAttention ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          {label}
          {needsAttention && (
            <span className="text-mdp-rosa ml-1">(requerido)</span>
          )}
        </label>

        {needsAttention && (
          <p className="text-xs text-foreground/80 mb-1 flex items-center gap-1" aria-hidden="true">
            <AlertCircle className="w-3 h-3" />
            Seleccioná una opción
          </p>
        )}

        {/* Muestra el valor seleccionado o el placeholder */}
        <div 
          className={`text-lg font-bold leading-tight truncate ${
            !hasValue ? "text-muted-foreground font-medium" : "text-foreground"
          }`}
        >
          {selectedLabel || placeholder || `Seleccionar ${label.toLowerCase()}`}
        </div>

        {needsAttention && (
          <p id={`${selectId}-hint`} className="sr-only">
            Debés seleccionar una opción para continuar
          </p>
        )}
      </div>

      <div className="shrink-0" aria-hidden="true">
        {isLoading ? (
          <Loader2 className="w-5 h-5 text-mdp-amarillo animate-spin" />
        ) : (
          <ChevronDown
            className={`w-5 h-5 transition-colors ${
              needsAttention ? "text-mdp-amarillo" : "text-muted-foreground"
            }`}
          />
        )}
      </div>
    </div>
  );
}