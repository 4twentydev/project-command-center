import type { MetadataRoute } from "next";
import { brand } from "@/lib/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${brand.name} — ${brand.descriptor}`,
    short_name: brand.name,
    description: brand.positioning,
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#111419",
    theme_color: "#111419",
    orientation: "any",
    categories: ["productivity", "business", "utilities"],
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      {
        name: "Command Center",
        short_name: "Command Center",
        description: "Launch the owner command center",
        url: "/dashboard",
        icons: [{ src: "/icon", sizes: "512x512" }],
      },
      {
        name: "Client Leads",
        short_name: "Leads",
        description: "Open client lead pipeline",
        url: "/dashboard/leads",
        icons: [{ src: "/icon", sizes: "512x512" }],
      },
      {
        name: "Consultations",
        short_name: "Consultations",
        description: "Open consultation discovery playbooks",
        url: "/dashboard/consultations",
        icons: [{ src: "/icon", sizes: "512x512" }],
      },
    ],
  };
}
