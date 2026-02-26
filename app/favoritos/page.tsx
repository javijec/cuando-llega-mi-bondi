import { FavoritosViewWithSuspense } from "@/components/favoritos-view-suspense";

export default function FavoritosPage() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only"
      >
        Saltar al contenido principal
      </a>
      <FavoritosViewWithSuspense />
    </>
  );
}
