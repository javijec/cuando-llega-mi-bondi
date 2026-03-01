import { Header } from "@/components/header";
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
    <div className="min-h-screen bg-background">
      <Header />
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
  );
}
