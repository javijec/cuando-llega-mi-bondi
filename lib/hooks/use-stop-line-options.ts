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
    const relatedOptions = (stopLinesQuery.data?.lineas ?? []).map(
      toStopLineOption,
    );

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

  const selectedKeys = useMemo(() => {
    const nextKeys = selectedOptionKeys.filter((key) =>
      stopLineOptions.some((option) => getOptionKey(option) === key),
    );

    if (nextKeys.length > 0) {
      return new Set(nextKeys);
    }

    return currentOptionKey ? new Set([currentOptionKey]) : new Set<string>();
  }, [currentOptionKey, selectedOptionKeys, stopLineOptions]);

  const selectedOptions = useMemo(() => {
    const options = stopLineOptions.filter((option) =>
      selectedKeys.has(getOptionKey(option)),
    );

    if (options.length > 0) {
      return options;
    }

    return currentOption ? [currentOption] : [];
  }, [currentOption, selectedKeys, stopLineOptions]);

  const activeOption = useMemo(() => {
    const matchingActiveOption = stopLineOptions.find(
      (option) => getOptionKey(option) === activeOptionKey,
    );

    if (matchingActiveOption && selectedKeys.has(getOptionKey(matchingActiveOption))) {
      return matchingActiveOption;
    }

    return selectedOptions[0] ?? currentOption;
  }, [activeOptionKey, currentOption, selectedKeys, selectedOptions, stopLineOptions]);

  function selectOption(option: StopLineOption): void {
    const optionKey = getOptionKey(option);

    setSelectedOptionKeys((currentKeys) => {
      const baseKeys =
        currentKeys.length === 0 && currentOptionKey ? [currentOptionKey] : currentKeys;

      return baseKeys.includes(optionKey) ? baseKeys : [...baseKeys, optionKey];
    });
    setActiveOptionKey(optionKey);
  }

  function removeOption(option: StopLineOption): void {
    const optionKey = getOptionKey(option);

    setSelectedOptionKeys((currentKeys) => {
      if (currentKeys.length <= 1) {
        return currentKeys;
      }

      return currentKeys.filter((key) => key !== optionKey);
    });

    setActiveOptionKey((currentKey) => {
      if (currentKey !== optionKey) {
        return currentKey;
      }

      const nextOption = selectedOptions.find(
        (selectedOption) => getOptionKey(selectedOption) !== optionKey,
      );

      return nextOption ? getOptionKey(nextOption) : currentOptionKey;
    });
  }

  return {
    activeOption,
    selectedOptions,
    selectedKeys,
    selectOption,
    removeOption,
    stopLineOptions,
    isLoadingStopLines: stopLinesQuery.isLoading,
    stopLinesError: stopLinesQuery.error,
  };
}
