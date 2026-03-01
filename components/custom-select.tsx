"use client";

import { createContext, useId } from "react";
import { ChevronDown, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectContextValue {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  isDisabled: boolean;
  isLoading: boolean;
  isComplete: boolean;
  isActive: boolean;
  label: string;
  placeholder?: string;
}

const SelectContext = createContext<SelectContextValue | null>(null);

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  label: string;
  disabled?: boolean;
  isLoading?: boolean;
  isComplete?: boolean;
  isActive?: boolean;
  placeholder?: string;
  stepNumber?: number;
}

function SelectRoot({
  value,
  onChange,
  options,
  label,
  disabled = false,
  isLoading = false,
  isComplete = false,
  isActive = false,
  placeholder,
  stepNumber,
}: SelectProps) {
  const selectId = useId();
  const hasValue = value && value.length > 0;
  const needsAttention = isActive && !hasValue && !isLoading;

  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  const contextValue: SelectContextValue = {
    name: selectId,
    value,
    onChange,
    options,
    isDisabled: disabled,
    isLoading,
    isComplete,
    isActive,
    label,
    placeholder,
  };

  return (
    <SelectContext.Provider value={contextValue}>
      <div
        className={`relative flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 ${
          needsAttention
            ? "bg-mdp-amarillo/15 ring-2 ring-mdp-amarillo"
            : isComplete
              ? "bg-mdp-turquesa/10"
              : "bg-card"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
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
              hasValue
                ? "text-muted-foreground/60"
                : needsAttention
                  ? "text-foreground"
                  : "text-muted-foreground"
            }`}
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

          <div
            className={`text-lg font-bold leading-tight truncate ${
              !hasValue
                ? "text-muted-foreground font-medium"
                : "text-foreground"
            }`}
          >
            {selectedLabel ||
              placeholder ||
              `Seleccionar ${label.toLowerCase()}`}
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
    </SelectContext.Provider>
  );
}

// Compound component structure for future extensibility
export const Select = Object.assign(SelectRoot, {});

// Legacy export for backwards compatibility
export { Select as CustomSelect };
export type { SelectProps, SelectOption };
