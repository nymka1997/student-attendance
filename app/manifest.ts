
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Сурагчийн ирц",
    short_name: "Ирц",
    description: "Сургуулийн ирцийн бүртгэлийн систем",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f5f8fc",
    theme_color: "#0f766e",
    lang: "mn",

   icons: [
  {
    src: '/icon.svg',
    sizes: 'any',
    type: 'image/svg+xml',
    purpose: 'any'
  }
],
  };
}
