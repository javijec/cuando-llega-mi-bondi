"use client";

import { useEffect } from "react";

export function PWAInstallPrompt() {
  useEffect(() => {
    // Only import on client side after mount
    import("@khmyznikov/pwa-install");
  }, []);
  return (
    <>
      <pwa-install
        manifest-url="/manifest.json"
        install-description="Instalá la app para acceso rápido"
      />
    </>
  );
}
