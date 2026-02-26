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
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen bg-background pb-8">
        {children}
      </main>
    </>
  );
}
