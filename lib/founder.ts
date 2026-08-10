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
  name: "Brandon York",
  role: "Founder and builder behind 4TWENTY.DEV",
  shortIntroduction: "Brandon York works across production, fabrication, operations, and software. That combination keeps every system grounded in the way quotes, material, people, paperwork, and finished work actually move.",
  portrait: {
    publicPath: "/media/founder/brandon-york.jpg",
    sourceWidth: 853,
    sourceHeight: 1280,
    aspectRatio: "4:5",
    alt: "Brandon York, founder of 4TWENTY.DEV",
  },
} as const;

export const founderStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://www.4twenty.dev/about#brandon-york",
      name: founder.name,
      url: "https://www.4twenty.dev/about",
      image: `https://www.4twenty.dev${founder.portrait.publicPath}`,
      description: founder.shortIntroduction,
      knowsAbout: [...founderExperience],
      memberOf: { "@id": "https://www.4twenty.dev/#organization" },
    },
    {
      "@type": "Organization",
      "@id": "https://www.4twenty.dev/#organization",
      name: "4TWENTY.DEV",
      url: "https://www.4twenty.dev",
      email: "hello@4twenty.dev",
      description: "Custom software, workflow automation, and digital fabrication systems for real-world businesses.",
      founder: { "@id": "https://www.4twenty.dev/about#brandon-york" },
    },
  ],
} as const;
