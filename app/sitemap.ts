import type { MetadataRoute } from "next";
import { caseStudies } from "@/lib/case-studies";

const siteURL = "https://www.4twenty.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteURL, changeFrequency: "monthly", priority: 1 },
    ...caseStudies.map(({ slug }) => ({ url: `${siteURL}/work/${slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
