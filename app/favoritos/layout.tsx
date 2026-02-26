import { Navbar } from "@/components/navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Favoritos - MiBondi",
  description: "Tus paradas de colectivo favoritas en Mar del Plata.",
};

export default function FavoritosLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen bg-background pb-8">
        {children}
      </main>
    </>
  );
}
