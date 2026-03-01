"use client";

import { redirect } from "next/navigation";
import { useDeviceSize } from "@/lib/hooks/use-device-size";
import { LandingHero } from "@/components/landing-hero";
import { LandingFeatures } from "@/components/landing-features";

function LandingContent() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHero />
      <LandingFeatures />

      <footer className="py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <p className="text-muted-foreground">
            © 2026 MiBondi · Mar del Plata
          </p>
          <p className="text-muted-foreground mt-2">
            Hecha con ❤️ para marplatenses 🌊
          </p>
        </div>
      </footer>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-muted border-t-mdp-amarillo rounded-full animate-spin" />
    </div>
  );
}

export default function HomePage() {
  const { isDesktop, isLoaded } = useDeviceSize();

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  if (!isDesktop) {
    redirect("/consultar");
  }

  return <LandingContent />;
}
