export const brand = {
  name: "4TWENTY.DEV",
  wordmark: "4TWENTY",
  domainSuffix: ".DEV",
  siteURL: "https://www.4twenty.dev",
  email: "hello@4twenty.dev",
  founder: "Brandon York",
  descriptor: "Industrial software and workflow automation",
  audienceLine: "Practical systems for manufacturers, shops, contractors, and small businesses.",
  positioning: "Industrial software and workflow automation for small manufacturers, fabrication shops, contractors, and owner-led businesses.",
  promise: "Software that keeps real-world work moving.",
  socialTitle: "4TWENTY.DEV | Industrial software and workflow automation",
  socialDescription: "Practical systems for quoting, inventory, production, scheduling, customer intake, and the handoffs between them.",
  emailFromName: "Brandon York | 4TWENTY.DEV",
  serviceSignals: ["Quoting", "Inventory", "Production", "Scheduling"],
} as const;

export const brandMailto = `mailto:${brand.email}?subject=${encodeURIComponent("Project inquiry | 4TWENTY.DEV")}`;
