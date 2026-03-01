import { Header } from "@/components/header";
import { Navbar } from "@/components/navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Consultar - MiBondi",
  description:
    "Consulta en tiempo real los arribos de colectivos en Mar del Plata.",
};

export default function ConsultarLayout({
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
          className="flex-1 pb-20 md:pb-8 md:pl-64 transition-all overflow-hidden"
        >
          <div className="md:grid md:grid-cols-[380px_1fr] md:gap-8 md:px-8 md:py-8 md:h-[calc(100vh-65px)] md:overflow-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
