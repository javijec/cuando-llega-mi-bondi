"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("❌ Error en la aplicación:", error);
  }, [error]);

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-6">
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⚠️</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          ¡Ups! Algo salió mal
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Ha ocurrido un error inesperado. Por favor, intenta recargar la
          página.
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={reset}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Intentar de nuevo
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 border border-input bg-background rounded-md hover:bg-accent transition-colors"
        >
          Recargar página
        </button>
      </div>

      {process.env.NODE_ENV === "development" && (
        <div className="mt-8 p-4 bg-muted rounded-lg max-w-2xl w-full overflow-auto">
          <p className="text-sm font-mono text-destructive whitespace-pre-wrap">
            {error.message}
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground mt-2">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
