"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("❌ Error global:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground">
          <div className="text-center max-w-md">
            <h1 className="text-4xl font-bold mb-4">Error Crítico</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Ha ocurrido un error grave en la aplicación. Por favor, recarga la
              página para continuar.
            </p>
            <button
              onClick={() => reset()}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Intentar recuperar
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
