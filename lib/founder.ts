export const founderExperience = [
  "Manufacturing and production management",
  "CNC operation and digital fabrication",
  "Exterior architectural panel production",
  "Inventory, shipping, packaging, and shop-floor workflows",
  "Operational metrics and process improvement",
  "Custom software, web applications, and automation",
  "Translating real production problems into usable systems",
] as const;

export const founder = {
  name: brand.founder,
  role: `Founder and builder behind ${brand.name}`,
  shortIntroduction: "Brandon York works across production, fabrication, operations, and software. That combination keeps every system grounded in the way quotes, material, people, paperwork, and finished work actually move.",
  portrait: {
    publicPath: "/media/founder/brandon-york.jpg",
    sourceWidth: 853,
    sourceHeight: 1280,
    aspectRatio: "4:5",
    alt: `${brand.founder}, founder of ${brand.name}`,
  },
} as const;

export const founderStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${brand.siteURL}/about#brandon-york`,
      name: founder.name,
      url: `${brand.siteURL}/about`,
      image: `${brand.siteURL}${founder.portrait.publicPath}`,
      description: founder.shortIntroduction,
      knowsAbout: [...founderExperience],
      memberOf: { "@id": `${brand.siteURL}/#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${brand.siteURL}/#organization`,
      name: brand.name,
      url: brand.siteURL,
      email: brand.email,
      description: brand.positioning,
      founder: { "@id": `${brand.siteURL}/about#brandon-york` },
    },
  ],
} as const;
import { brand } from "@/lib/brand";
