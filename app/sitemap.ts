import type { MetadataRoute } from "next";
import { caseStudies } from "@/lib/case-studies";
import { brand } from "@/lib/brand";
import { publicServices } from "@/lib/services";

const siteURL = brand.siteURL;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteURL, changeFrequency: "monthly", priority: 1 },
    { url: `${siteURL}/about`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteURL}/solutions`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteURL}/demos`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteURL}/work`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteURL}/labs`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteURL}/workflow-audit`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteURL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    ...publicServices.map(({ slug, primary }) => ({ url: `${siteURL}/services/${slug}`, changeFrequency: "monthly" as const, priority: primary ? 0.9 : 0.8 })),
    ...caseStudies.map(({ slug }) => ({ url: `${siteURL}/work/${slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
