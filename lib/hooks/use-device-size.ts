"use client";

import { useState, useEffect } from "react";

const BREAKPOINT = 768;

interface DeviceSize {
  isDesktop: boolean;
  isMobile: boolean;
  width: number;
  isLoaded: boolean;
}

export function useDeviceSize(): DeviceSize {
  const [deviceSize, setDeviceSize] = useState<DeviceSize>({
    isDesktop: false,
    isMobile: true,
    width: 0,
    isLoaded: false,
  });

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      setDeviceSize({
        isDesktop: width >= BREAKPOINT,
        isMobile: width < BREAKPOINT,
        width,
        isLoaded: true,
      });
    }

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return deviceSize;
}
