import { Navbar } from "@/components/navbar";
import { RecorridosView } from "@/components/recorridos-view";

export default function RecorridosPage() {
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <a href="#main-content" className="sr-only">
        Saltar al contenido principal
      </a>
      <main id="main-content" className="flex-1 w-full overflow-hidden relative">
        <RecorridosView />
      </main>
      <Navbar/>
    </div>
  );
}
