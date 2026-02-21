"use client";

import { ChevronDown, Loader2, CheckCircle2 } from "lucide-react";

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

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
        needsAttention
          ? "bg-mdp-amarillo/15 ring-2 ring-mdp-amarillo"
          : isComplete
            ? "bg-mdp-turquesa/10"
            : "bg-card"
      }`}
    >
      {stepNumber !== undefined && (
        <div
          className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
            isComplete
              ? "bg-mdp-turquesa text-white"
              : needsAttention
                ? "bg-mdp-amarillo text-foreground"
                : "bg-muted/50 text-muted-foreground"
          }`}
        >
          {isComplete ? <CheckCircle2 className="w-4 h-4" /> : stepNumber}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <select
          id={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || isLoading}
          aria-label={label}
          aria-required={needsAttention}
          className={`
            w-full appearance-none bg-transparent
            text-base font-medium text-foreground
            focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            ${!hasValue && !disabled ? "text-muted-foreground" : ""}
          `}
        >
          <option value="" disabled>
            {placeholder || label}
          </option>
          {options.map((opt, index) => (
            <option key={`${opt.value}-${index}`} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-shrink-0 pointer-events-none">
        {isLoading ? (
          <Loader2 className="w-5 h-5 text-mdp-amarillo animate-spin" />
        ) : (
          <ChevronDown
            className={`w-5 h-5 ${needsAttention ? "text-mdp-amarillo" : "text-muted-foreground"}`}
          />
        )}
      </div>
    </div>
  );
}
