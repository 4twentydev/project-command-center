export type ProjectStatus = "Active" | "Planning" | "Shipped" | "Paused";
export type ProjectKind = "Software" | "CNC" | "Business" | "Experiment";

export type Project = {
  id: string;
  name: string;
  eyebrow: string;
  description: string;
  status: ProjectStatus;
  kind: ProjectKind;
  stack: string[];
  repo?: string;
  deployment?: string;
  updatedAt: string;
  updatedLabel: string;
  note: string;
  progress: number;
  accent: "cyan" | "amber" | "violet" | "lime";
  pinned?: boolean;
};

// Add or edit projects here. The dashboard reads directly from this typed list.
export const projects: Project[] = [
  {
    id: "factory",
    name: "factory",
    eyebrow: "Production OS",
    description: "The operating layer for jobs, machines, queues, and shop-floor visibility.",
    status: "Active",
    kind: "Software",
    stack: ["Next.js", "TypeScript", "Postgres"],
    repo: "https://github.com/",
    deployment: "https://vercel.com/",
    updatedAt: "2026-08-09",
    updatedLabel: "Today",
    note: "Wire the live machine queue into the morning view.",
    progress: 72,
    accent: "cyan",
    pinned: true,
  },
  {
    id: "shop-inventory",
    name: "shop-inventory",
    eyebrow: "Materials & tooling",
    description: "Fast stock counts, reorder points, and location tracking for the shop.",
    status: "Active",
    kind: "CNC",
    stack: ["Next.js", "Bun", "SQLite"],
    repo: "https://github.com/",
    updatedAt: "2026-08-07",
    updatedLabel: "2 days ago",
    note: "Barcode flow is ready for a first aisle test.",
    progress: 58,
    accent: "lime",
    pinned: true,
  },
  {
    id: "work-command-center",
    name: "Work Command Center",
    eyebrow: "Daily cockpit",
    description: "One place for priorities, follow-ups, project health, and the next useful action.",
    status: "Active",
    kind: "Software",
    stack: ["Next.js", "shadcn/ui", "Vercel"],
    repo: "https://github.com/",
    deployment: "https://vercel.com/",
    updatedAt: "2026-08-05",
    updatedLabel: "4 days ago",
    note: "Tune the weekly review and inbox capture loop.",
    progress: 84,
    accent: "violet",
    pinned: true,
  },
  {
    id: "detailer",
    name: "Mobile Detailing",
    eyebrow: "Field service app",
    description: "Quote, schedule, route, and close out detailing jobs from a phone-first workflow.",
    status: "Planning",
    kind: "Business",
    stack: ["Next.js", "Stripe", "Maps"],
    updatedAt: "2026-08-01",
    updatedLabel: "8 days ago",
    note: "Lock the quote-to-booking flow before visual design.",
    progress: 26,
    accent: "amber",
  },
  {
    id: "signforge",
    name: "SignForge",
    eyebrow: "Just Fucking Signs",
    description: "A sharp quoting and production workflow for custom sign jobs, from idea to cut file.",
    status: "Active",
    kind: "CNC",
    stack: ["Bun", "Canvas", "CNC"],
    repo: "https://github.com/",
    updatedAt: "2026-07-29",
    updatedLabel: "11 days ago",
    note: "Prototype the material-aware price calculator.",
    progress: 47,
    accent: "amber",
  },
  {
    id: "experiments",
    name: "experiments",
    eyebrow: "R&D bench",
    description: "Small tools, strange interfaces, machine tests, and ideas worth pressure-testing.",
    status: "Paused",
    kind: "Experiment",
    stack: ["TypeScript", "AI", "Hardware"],
    repo: "https://github.com/",
    updatedAt: "2026-07-21",
    updatedLabel: "19 days ago",
    note: "Next up: camera-assisted material identification.",
    progress: 34,
    accent: "violet",
  },
];
