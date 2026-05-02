import { Navbar } from "@/components/navbar";

export const metadata = {
  title: "Recorridos - Mi Bondi",
  description:
    "Explora los recorridos de las líneas de colectivo en Mar del Plata en un mapa interactivo.",
};

export default function RecorridosLayout({
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
  );
}
