import { Header } from "@/components/header";
import { Navbar } from "@/components/navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acerca de - MiBondi",
  description:
    "Información sobre MiBondi, la app para consultar colectivos en Mar del Plata.",
};

export default function AcercaLayout({
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
