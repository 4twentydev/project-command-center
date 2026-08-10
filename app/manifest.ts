import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WORK//CTRL Project Command Center",
    short_name: "WORK//CTRL",
    description: "A personal operating system for projects, tasks, and ideas.",
    start_url: "/",
    display: "standalone",
    background_color: "#111419",
    theme_color: "#111419",
    orientation: "any",
    categories: ["productivity", "business", "utilities"],
    icons: [{ src: "/icon", sizes: "512x512", type: "image/png", purpose: "any maskable" }],
  };
}
