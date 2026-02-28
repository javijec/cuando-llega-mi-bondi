import { Navbar } from "@/components/navbar";
import { RecorridosView } from "@/components/recorridos-view";
import { fetchMuniAPICached } from "@/lib/cache/bus-cache";
import type { LineasResponse } from "@/lib/types/bus";


export default async function RecorridosPage() {
  // Fetch lines server-side with caching
  const response: LineasResponse = await fetchMuniAPICached("lineas", {});
  const lineas = response.lineas || [];

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <a href="#main-content" className="sr-only">
        Saltar al contenido principal
      </a>
      <main id="main-content" className="flex-1 w-full overflow-hidden relative">
        <RecorridosView lineas={lineas} />
      </main>
      <Navbar/>
    </div>
  );
}
