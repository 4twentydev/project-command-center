import type { MetadataRoute } from "next";
import { brand } from "@/lib/brand";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/account", "/dashboard", "/login"],
    },
    sitemap: `${brand.siteURL}/sitemap.xml`,
    host: brand.siteURL,
  };
}
