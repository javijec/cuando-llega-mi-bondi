import { NearbyStopsView } from "@/components/nearby-stops-view";

export default function CercanasPage() {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      <a href="#main-content" className="sr-only">
        Saltar al contenido principal
      </a>
      <main
        id="main-content"
        className="relative flex-1 w-full overflow-hidden"
      >
        <NearbyStopsView />
      </main>
    </div>
  )
}
