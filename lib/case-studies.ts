import type { ProjectStatus } from "@/lib/project-status";
import type { ProjectMedia } from "@/lib/project-media";

export type CaseStudy = {
  slug: string;
  number: string;
  status: ProjectStatus;
  title: string;
  kicker: string;
  summary: string;
  signal: string;
  icon: "gauge" | "scan-line" | "layers";
  intendedFor: string;
  problem: string;
  previousWorkflow: string;
  solution: string;
  capabilities: string[];
  technologies: string[];
  outcomeLabel: "Operational outcome" | "Intended outcome";
  outcome: string;
  limitations: string;
  media: ProjectMedia[];
  previewMediaId?: string;
  cta: { label: string; href: string };
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "work-control",
    number: "01",
    status: "Live system",
    title: "WORK//CTRL",
    kicker: "Personal operations platform",
    summary: "An implemented, currently operational command center that brings projects, tasks, GitHub activity, deployment health, planning, notes, and reminders into one operating view.",
    signal: "From scattered tools to one daily control surface",
    icon: "gauge",
    intendedFor: "An independent builder managing software, CNC, business, and experimental work across several tools and operating rhythms.",
    problem: "Project context was split across repositories, deployments, notes, task lists, and memory. The work existed, but there was no single place to decide what needed attention next.",
    previousWorkflow: "Open each tool separately, reconstruct project status, update parallel notes, and rely on manual review to catch stale work, overdue tasks, deployment issues, or follow-ups.",
    solution: "A passkey-protected, database-backed command center that combines project records, planning signals, tasks, activity, repository status, deployment status, reminders, and client-lead follow-up in one interface.",
    capabilities: ["Unified project and task workspace", "GitHub and Vercel status signals", "Focus planning and pressure mapping", "Notes, snapshots, reminders, and push notifications", "Passkey-protected owner access", "Client inquiry and follow-up pipeline"],
    technologies: ["Next.js App Router", "TypeScript", "Neon Postgres", "Better Auth passkeys", "Vercel", "Bun"],
    outcomeLabel: "Operational outcome",
    outcome: "The live system provides one daily control surface for reviewing active work and deciding what to move next. The value is qualitative: less context reconstruction and a clearer operating picture, not a verified claim of time or cost savings.",
    limitations: "This is an owner-operated system, not a validated multi-tenant product. Integrations depend on configured service credentials, and several planning signals are intentionally lightweight rather than predictive analytics.",
    media: [{ id: "command-center-overview", type: "placeholder", label: "Command center overview", description: "A verified view of the WORK//CTRL dashboard across desktop and mobile.", caption: "Final product screenshots have not been supplied. This placeholder does not represent the interface.", requestedAsset: "Supply a desktop dashboard screenshot and, optionally, a mobile command-center screenshot." }],
    previewMediaId: "command-center-overview",
    cta: { label: "Discuss an internal command center", href: "/#contact" },
  },
  {
    slug: "signforge",
    number: "02",
    status: "Active concept",
    title: "SignForge",
    kicker: "CNC signage workflow",
    summary: "A production-minded system for taking custom sign work from customer intent through design decisions, material planning, fabrication, and delivery.",
    signal: "Built around the shop floor—not generic project management",
    icon: "scan-line",
    intendedFor: "Small sign, CNC, and fabrication shops handling custom work where each order carries design choices, material constraints, production steps, and customer approvals.",
    problem: "Custom sign jobs can lose momentum between the first request, quoting, design approval, material planning, toolpath preparation, fabrication, finishing, and delivery.",
    previousWorkflow: "Customer details, dimensions, revisions, prices, material notes, and production status are often distributed across messages, paper, spreadsheets, design files, and the knowledge of whoever is running the job.",
    solution: "A proposed job workflow that keeps customer intent, quoting inputs, approvals, material requirements, production stages, and delivery status connected to the same sign record.",
    capabilities: ["Structured project intake", "Quote and option tracking", "Design approval history", "Material and production planning", "Shop-floor status checkpoints", "Delivery and handoff visibility"],
    technologies: ["CNC production domain modeling", "Workflow mapping", "Web application prototyping", "Automation planning"],
    outcomeLabel: "Intended outcome",
    outcome: "The intended outcome is a clearer path from inquiry to finished sign, with fewer lost decisions and less dependence on verbal status checks. No production results or savings have been verified because the system remains an active concept.",
    limitations: "SignForge remains an active concept, not a deployed customer system. Machine integrations, quoting rules, design-file handling, and the exact production model still require validation against a real shop’s equipment and workflow.",
    media: [{ id: "workflow-concept", type: "placeholder", label: "Workflow concept", description: "A verified workflow map or functional prototype view for SignForge.", caption: "No interface or fabrication media is shown because SignForge remains an active concept.", requestedAsset: "Supply a verified workflow diagram or prototype screen when one exists." }],
    cta: { label: "Audit a fabrication workflow", href: "/#contact" },
  },
  {
    slug: "shop-inventory",
    number: "03",
    status: "Working prototype",
    title: "Shop Inventory",
    kicker: "Operational visibility",
    summary: "A lightweight working prototype for testing how a shop can see what is on hand, what is committed, and what needs attention without spreadsheet archaeology.",
    signal: "Clear next actions from real operating data",
    icon: "layers",
    intendedFor: "Small manufacturers and fabrication shops that need practical stock visibility without adopting an oversized warehouse or ERP platform.",
    problem: "Inventory numbers become difficult to trust when receiving, job allocation, consumption, and replenishment are recorded at different times or in different places.",
    previousWorkflow: "Check shelves, ask another person, search a spreadsheet, compare it with open jobs, and manually decide whether stock is available, committed, low, or already on order.",
    solution: "A mobile-first prototype organized around simple item records, stock movements, job commitments, reorder attention, and an operating view that emphasizes exceptions instead of exhaustive reporting.",
    capabilities: ["On-hand and committed quantities", "Receiving and usage records", "Job-level material allocation", "Low-stock and reorder attention", "Mobile-friendly shop updates", "Exception-focused operating view"],
    technologies: ["Mobile-first web prototyping", "Inventory data modeling", "TypeScript workflow rules", "Operational reporting concepts"],
    outcomeLabel: "Intended outcome",
    outcome: "The intended outcome is faster, more confident inventory decisions and fewer manual status checks. The prototype has not produced verified customer, savings, accuracy, or throughput metrics.",
    limitations: "The prototype does not yet claim barcode hardware support, accounting integration, demand forecasting, or production-grade synchronization. Inventory rules still need validation against actual receiving and consumption behavior.",
    media: [{ id: "inventory-overview", type: "placeholder", label: "Inventory prototype overview", description: "A verified view of the Shop Inventory prototype at desktop and mobile sizes.", caption: "Final prototype screenshots have not been supplied. This placeholder does not represent the interface.", requestedAsset: "Supply a desktop inventory view and a mobile stock-update screen." }],
    previewMediaId: "inventory-overview",
    cta: { label: "Discuss inventory visibility", href: "/#contact" },
  },
];

export function getCaseStudy(slug: string) {
  return caseStudies.find((study) => study.slug === slug);
}

export function getAdjacentCaseStudies(slug: string) {
  const index = caseStudies.findIndex((study) => study.slug === slug);
  if (index < 0) return { previous: undefined, next: undefined };
  return {
    previous: caseStudies[(index - 1 + caseStudies.length) % caseStudies.length],
    next: caseStudies[(index + 1) % caseStudies.length],
  };
}
