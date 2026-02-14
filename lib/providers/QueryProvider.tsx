// lib/providers/QueryProvider.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

/**
 * Provider de TanStack Query para toda la aplicación
 * Configura el cliente con opciones optimizadas para el proyecto de colectivos
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Crear QueryClient con configuración optimizada
  // Se crea con useState para que sea estable entre re-renders
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Configuración global por defecto para todas las queries
            staleTime: 60 * 1000, // 1 minuto por defecto (los hooks pueden sobreescribir esto)
            gcTime: 5 * 60 * 1000, // 5 minutos - tiempo que mantiene datos en cache sin uso
            retry: 1, // Reintentar 1 vez si falla
            refetchOnWindowFocus: false, // No re-fetch automático al volver a la ventana
            refetchOnReconnect: true, // Sí re-fetch al reconectar internet
            refetchOnMount: true, // Sí re-fetch al montar componente
          },
          mutations: {
            retry: 0, // No reintentar mutaciones
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 
        DevTools de React Query - solo en desarrollo
        Permite visualizar el estado de todas las queries en tiempo real
      */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false}
          position="bottom"
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}