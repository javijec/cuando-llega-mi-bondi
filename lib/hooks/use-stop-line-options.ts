import { useMemo, useState } from "react";
import { useParadaLineas } from "@/lib/hooks/useBusQuery";
import type {
  Calle,
  Interseccion,
  Linea,
  Parada,
  ParadaLineaRelacion,
} from "@/lib/types/bus";

export interface StopLineOption {
  linea: Linea;
  parada: Parada;
}

interface UseStopLineOptionsInput {
  linea?: Linea;
  parada?: Parada;
  calle?: Calle;
  interseccion?: Interseccion;
}

function getOptionKey(option: StopLineOption): string {
  return `${option.linea.CodigoLineaParada}:${option.parada.Codigo}`;
}

function dedupeOptions(options: StopLineOption[]): StopLineOption[] {
  const seen = new Set<string>();

  return options.filter((option) => {
    const key = getOptionKey(option);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function toStopLineOption(relation: ParadaLineaRelacion): StopLineOption {
  return {
    linea: relation.linea,
    parada: relation.parada,
  };
}

export function useStopLineOptions({
  linea,
  parada,
  calle,
  interseccion,
}: UseStopLineOptionsInput) {
  const currentOption = useMemo<StopLineOption | null>(
    () => (linea && parada ? { linea, parada } : null),
    [linea, parada],
  );

  const stopLinesQuery = useParadaLineas(
    parada?.Identificador ?? "",
    calle?.Descripcion ?? "",
    interseccion?.Descripcion ?? "",
    !!parada && !!calle && !!interseccion,
  );

  const stopLineOptions = useMemo(() => {
    const relatedOptions = (stopLinesQuery.data ?? []).map(toStopLineOption);

    return dedupeOptions(
      currentOption ? [currentOption, ...relatedOptions] : relatedOptions,
    );
  }, [currentOption, stopLinesQuery.data]);

  const currentOptionKey = currentOption ? getOptionKey(currentOption) : null;
  const [selectedOptionKeys, setSelectedOptionKeys] = useState<string[]>(
    currentOptionKey ? [currentOptionKey] : [],
  );
  const [activeOptionKey, setActiveOptionKey] = useState<string | null>(
    currentOptionKey,
  );
  const [hasManualSelection, setHasManualSelection] = useState(false);

  const selectedKeys = useMemo(() => {
    if (!hasManualSelection) {
      return currentOptionKey ? new Set([currentOptionKey]) : new Set<string>();
    }

    const nextKeys = selectedOptionKeys.filter((key) =>
      stopLineOptions.some((option) => getOptionKey(option) === key),
    );

    return nextKeys.length > 0 ? new Set(nextKeys) : new Set<string>();
  }, [currentOptionKey, hasManualSelection, selectedOptionKeys, stopLineOptions]);

  const selectedOptions = useMemo(() => {
    return stopLineOptions.filter((option) =>
      selectedKeys.has(getOptionKey(option)),
    );
  }, [selectedKeys, stopLineOptions]);

  const activeOption = useMemo(() => {
    if (selectedOptions.length === 0) {
      return null;
    }

    if (!hasManualSelection && currentOption) {
      return currentOption;
    }

    const matchingActiveOption = stopLineOptions.find(
      (option) => getOptionKey(option) === activeOptionKey,
    );

    if (
      matchingActiveOption &&
      selectedKeys.has(getOptionKey(matchingActiveOption))
    ) {
      return matchingActiveOption;
    }

    return selectedOptions[0] ?? null;
  }, [
    activeOptionKey,
    currentOption,
    hasManualSelection,
    selectedKeys,
    selectedOptions,
    stopLineOptions,
  ]);

  function selectOption(option: StopLineOption): void {
    setHasManualSelection(true);

    const optionKey = getOptionKey(option);
    const isSelected = selectedKeys.has(optionKey);
    const currentKeys = Array.from(selectedKeys);

    setSelectedOptionKeys(() => {
      const nextKeys = isSelected
        ? currentKeys.filter((key) => key !== optionKey)
        : [...currentKeys, optionKey];

      return nextKeys;
    });

    if (isSelected) {
      if (activeOptionKey === optionKey) {
        const remainingKeys = Array.from(selectedKeys).filter(
          (key) => key !== optionKey,
        );
        setActiveOptionKey(remainingKeys[remainingKeys.length - 1] ?? null);
      }
    } else {
      setActiveOptionKey(optionKey);
    }
  }

  return {
    activeOption,
    selectedOptions,
    selectedKeys,
    selectOption,
    stopLineOptions,
    isLoadingStopLines: stopLinesQuery.isLoading,
    stopLinesError: stopLinesQuery.error,
  };
}
