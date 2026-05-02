import { Navbar } from "@/components/navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paradas Cercanas - MiBondi",
  description:
    "Encontrá paradas cercanas a tu ubicación actual en Mar del Plata y visualizalas en un mapa.",
}

export default function CercanasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Navbar />
        <main
          id="main-content"
          className="flex-1 pb-20 md:pb-8 md:pl-64 transition-all"
        >
          {children}
        </main>
      </div>
    </div>
  )
}
