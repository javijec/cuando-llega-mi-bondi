import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mi Bondi - MDP",
    short_name: "Mi Bondi",
    description:
      "Consulta en tiempo real los arribos de colectivos en Mar del Plata",
    start_url: "/consultar",
    display: "standalone",
    background_color: "#0a0f1a",
    theme_color: "#0a0f1a",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
