// lib/hooks/useIntersectionObserver.ts
// From: https://usehooks-ts.com/react-hook/use-intersection-observer
// License: MIT
// Rewritten for React 19 compliance

import { useEffect, useRef, useState, useCallback } from "react";

type State = {
  isIntersecting: boolean;
  entry?: IntersectionObserverEntry;
};

type UseIntersectionObserverOptions = {
  root?: Element | Document | null;
  rootMargin?: string;
  threshold?: number | number[];
  freezeOnceVisible?: boolean;
  onChange?: (
    isIntersecting: boolean,
    entry: IntersectionObserverEntry,
  ) => void;
  initialIsIntersecting?: boolean;
};

type IntersectionReturn = [
  (node?: Element | null) => void,
  boolean,
  IntersectionObserverEntry | undefined,
] & {
  ref: (node?: Element | null) => void;
  isIntersecting: boolean;
  entry?: IntersectionObserverEntry;
};

export function useIntersectionObserver({
  threshold = 0,
  root = null,
  rootMargin = "0%",
  freezeOnceVisible = false,
  initialIsIntersecting = false,
  onChange,
}: UseIntersectionObserverOptions = {}): IntersectionReturn {
  const [element, setElement] = useState<Element | null>(null);
  const [state, setState] = useState<State>({
    isIntersecting: initialIsIntersecting,
    entry: undefined,
  });

  const onChangeRef = useRef(onChange);
  const frozenRef = useRef(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const setRef = useCallback((node?: Element | null) => {
    setElement(node ?? null);
  }, []);

  useEffect(() => {
    if (!element) return;
    if (!("IntersectionObserver" in window)) return;
    if (frozenRef.current) return;

    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        const thresholds = Array.isArray(observer.thresholds)
          ? observer.thresholds
          : [observer.thresholds];

        entries.forEach((entry) => {
          const isIntersecting =
            entry.isIntersecting &&
            thresholds.some((t) => entry.intersectionRatio >= t);

          if (isIntersecting && freezeOnceVisible) {
            frozenRef.current = true;
          }

          setState({ isIntersecting, entry });

          if (onChangeRef.current) {
            onChangeRef.current(isIntersecting, entry);
          }
        });
      },
      { threshold, root, rootMargin },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [element, threshold, root, rootMargin, freezeOnceVisible]);

  const result = [
    setRef,
    state.isIntersecting,
    state.entry,
  ] as IntersectionReturn;
  result.ref = setRef;
  result.isIntersecting = state.isIntersecting;
  result.entry = state.entry;

  return result;
}
