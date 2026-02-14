"use client";

import { ChevronDown, Loader2 } from "lucide-react";

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
}

export function CustomSelect({
  label,
  placeholder,
  options,
  value,
  onChange,
  disabled = false,
  isLoading = false,
}: CustomSelectProps) {
  return (
    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-500">
      <label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest ml-1">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || isLoading}
          className="custom-select w-full bg-secondary text-foreground p-4 pr-10 rounded-2xl border border-border focus:border-primary outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">
            {isLoading ? "Cargando..." : placeholder || `Seleccionar ${label.toLowerCase()}`}
          </option>
          {options.map((opt, index) => (
            <option key={opt.value + index} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </div>
    </div>
  );
}
