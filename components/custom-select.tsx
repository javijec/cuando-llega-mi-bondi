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

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 ${
        needsAttention
          ? "bg-mdp-amarillo/15 ring-2 ring-mdp-amarillo"
          : isComplete
            ? "bg-mdp-turquesa/10"
            : "bg-card"
      }`}
      role="group"
      aria-labelledby={`${selectId}-label`}
    >
      {stepNumber !== undefined && (
        <div
          className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-black text-sm transition-all ${
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
          className={`block text-xs font-semibold uppercase tracking-wide mb-1 ${
            hasValue ? "sr-only" : ""
          } ${needsAttention ? "text-foreground" : "text-muted-foreground"}`}
        >
          {label}
          {needsAttention && (
            <span className="text-mdp-rosa ml-1">(requerido)</span>
          )}
        </label>

        {needsAttention && (
          <p
            className="text-xs text-foreground/80 mb-1 flex items-center gap-1"
            aria-hidden="true"
          >
            <AlertCircle className="w-3 h-3" />
            Seleccioná una opción
          </p>
        )}

        <select
          id={selectId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || isLoading}
          aria-required={needsAttention}
          aria-invalid={needsAttention}
          aria-describedby={needsAttention ? `${selectId}-hint` : undefined}
          className={`
            w-full appearance-none bg-transparent
            text-lg font-bold text-foreground
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mdp-turquesa
            disabled:opacity-50 disabled:cursor-not-allowed
            leading-tight cursor-pointer
            ${!hasValue && !disabled ? "text-muted-foreground font-medium" : ""}
          `}
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

        {needsAttention && (
          <p id={`${selectId}-hint`} className="sr-only">
            Debés seleccionar una opción para continuar
          </p>
        )}
      </div>

      <div className="flex-shrink-0 pointer-events-none" aria-hidden="true">
        {isLoading ? (
          <Loader2 className="w-5 h-5 text-mdp-amarillo animate-spin" />
        ) : (
          <ChevronDown
            className={`w-5 h-5 transition-colors ${needsAttention ? "text-mdp-amarillo" : "text-muted-foreground"}`}
          />
        )}
      </div>
    </div>
  );
}
