import type { MetadataRoute } from "next";
import { caseStudies } from "@/lib/case-studies";
import { publicServices } from "@/lib/services";

const siteURL = "https://www.4twenty.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteURL, changeFrequency: "monthly", priority: 1 },
    { url: `${siteURL}/about`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteURL}/workflow-audit`, changeFrequency: "monthly", priority: 0.9 },
    ...publicServices.map(({ slug, primary }) => ({ url: `${siteURL}/services/${slug}`, changeFrequency: "monthly" as const, priority: primary ? 0.9 : 0.8 })),
    ...caseStudies.map(({ slug }) => ({ url: `${siteURL}/work/${slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
