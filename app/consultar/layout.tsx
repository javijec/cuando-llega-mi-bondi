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
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-background pb-20">
        {children}
      </main>
      <Navbar />
    </>
  );
}
