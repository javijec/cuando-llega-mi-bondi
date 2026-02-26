import { ConsultarViewWithSuspense } from "@/components/consultar-view-suspense";

export default function ConsultarPage() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only"
      >
        Saltar al contenido principal
      </a>
      <ConsultarViewWithSuspense />
    </>
  );
}
