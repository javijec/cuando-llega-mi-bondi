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

  const options = useMemo(() => {
    const relatedOptions = (stopLinesQuery.data?.lineas ?? []).map(
      toStopLineOption,
    );

    return dedupeOptions(
      currentOption ? [currentOption, ...relatedOptions] : relatedOptions,
    );
  }, [currentOption, stopLinesQuery.data]);

  const [activeOption, setActiveOption] = useState<StopLineOption | null>(
    null,
  );
  const resolvedActiveOption = useMemo(() => {
    if (activeOption) {
      const existingActiveOption = options.find(
        (option) => getOptionKey(option) === getOptionKey(activeOption),
      );

      if (existingActiveOption) {
        return existingActiveOption;
      }
    }

    return currentOption;
  }, [activeOption, currentOption, options]);

  return {
    activeOption: resolvedActiveOption,
    setActiveOption,
    stopLineOptions: options,
    isLoadingStopLines: stopLinesQuery.isLoading,
    stopLinesError: stopLinesQuery.error,
  };
}
