import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Steadfast - Physician-led weight care",
    short_name: "Steadfast",
    description: "Monitoring platform for a physician-led medical weight-management program.",
    start_url: "/sign-in",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F4F6FC",
    theme_color: "#4165FE",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
