export const brand = {
  name: "Yorkstead Systems",
  wordmark: "YORKSTEAD",
  domainSuffix: ".SYSTEMS",
  siteURL: "https://yorkstead.com",
  email: "hello@yorkstead.com",
  founder: "Brandon York",
  descriptor: "Industrial software and workflow automation",
  audienceLine: "Practical systems for manufacturers, shops, contractors, and small businesses.",
  positioning: "Industrial software and workflow automation for small manufacturers, fabrication shops, contractors, and owner-led businesses.",
  promise: "Software that keeps real-world work moving.",
  socialTitle: "Yorkstead Systems | Industrial software and workflow automation",
  socialDescription: "Practical systems for quoting, inventory, production, scheduling, customer intake, and the handoffs between them.",
  emailFromName: "Brandon York | Yorkstead Systems",
  serviceSignals: ["Quoting", "Inventory", "Production", "Scheduling"],
} as const;

export const brandMailto = `mailto:${brand.email}?subject=${encodeURIComponent("Project inquiry | Yorkstead Systems")}`;
