"use client";

import { useState } from "react";

interface CurrentLocation {
  latitude: number;
  longitude: number;
}

interface CurrentLocationState {
  location: CurrentLocation | null;
  error: string | null;
  isLoading: boolean;
  requestLocation: () => void;
}

export function useCurrentLocation(): CurrentLocationState {
  const [location, setLocation] = useState<CurrentLocation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  function requestLocation(): void {
    if (!("geolocation" in navigator)) {
      setError("Tu navegador no soporta geolocalización.")
      return
    }

    setIsLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setIsLoading(false)
      },
      (positionError) => {
        const fallbackMessage = "No pudimos obtener tu ubicación."

        const messageByCode: Record<number, string> = {
          1: "Necesitamos permiso de ubicación para buscar paradas cercanas.",
          2: "No pudimos determinar tu ubicación actual.",
          3: "La ubicación tardó demasiado en responder.",
        }

        setError(messageByCode[positionError.code] ?? fallbackMessage)
        setIsLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    )
  }

  return {
    location,
    error,
    isLoading,
    requestLocation,
  }
}
