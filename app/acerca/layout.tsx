import { Header } from "@/components/header";
import { Navbar } from "@/components/navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acerca de - MiBondi",
  description: "Información sobre MiBondi, la app para consultar colectivos en Mar del Plata.",
};

export default function AcercaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <main id="main-content" className="min-h-screen bg-background pb-20">
        {children}
      </main>
      <Navbar />
    </>
  );
}
