import type { ProjectStatus } from "@/lib/project-status";
import type { ProjectMedia } from "@/lib/project-media";
import { brand } from "@/lib/brand";

export type CaseStudy = {
  slug: string;
  number: string;
  status: ProjectStatus;
  title: string;
  kicker: string;
  summary: string;
  signal: string;
  icon: "gauge" | "scan-line" | "layers";
  industries: string[];
  applications: { title: string; description: string }[];
  paths: { label: string; description: string; href: string }[];
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
    summary: "A live operations command center pattern for owner-led companies and delivery teams that need projects, tasks, client follow-up, system health, and next actions in one daily view.",
    signal: "One adaptable control surface for work that currently lives across tools",
    icon: "gauge",
    industries: ["Owner-led businesses", "Professional services", "Software teams", "Fabrication and CNC", "Field service"],
    applications: [
      { title: "Owner command center", description: "Combine priorities, commitments, follow-ups, and operating signals so the owner can decide what needs attention without reconstructing the business from several tools." },
      { title: "Project and delivery portfolio", description: "Track active initiatives, next actions, blockers, notes, and external system health across a small delivery team or technical operation." },
      { title: "Client work and follow-up", description: "Connect inquiries, consultations, promised actions, and delivery work so opportunities do not disappear between sales and execution." },
      { title: "Shop and technical operations", description: "Adapt the same control-surface pattern to jobs, maintenance, production exceptions, repositories, deployments, or other domain-specific signals." },
    ],
    paths: [
      { label: "Workflow automation", description: "Connect the useful tools already in place and remove repeated status reconstruction.", href: "/services/workflow-automation" },
      { label: "Manufacturing software", description: "Apply the command-center pattern to production, inventory, scheduling, or shop exceptions.", href: "/services/manufacturing-software" },
      { label: "Discuss a custom operations system", description: "Scope a tailored internal system when several workflows need to operate together.", href: "/?service=workflow-automation&engagement=custom-operations-system#contact" },
    ],
    intendedFor: "Owner-led companies, professional-service teams, technical operators, and small delivery organizations whose projects, client commitments, and system signals are distributed across several useful but disconnected tools.",
    problem: "Operational context becomes fragmented across project tools, inboxes, repositories, deployments, notes, calendars, and memory. The work exists, but there is no shared place to see commitments, exceptions, and the next decision together.",
    previousWorkflow: "Open each tool separately, reconstruct project status, update parallel notes, and rely on manual review to catch stale work, overdue tasks, deployment issues, or follow-ups.",
    solution: "A configurable operations command center that combines the records and signals relevant to a specific business—projects, jobs, tasks, client follow-up, system status, reminders, or exceptions—without pretending every industry needs the same dashboard.",
    capabilities: ["Unified project and task workspace", "GitHub and Vercel status signals", "Focus planning and pressure mapping", "Notes, snapshots, reminders, and push notifications", "Passkey-protected owner access", "Client inquiry and follow-up pipeline"],
    technologies: ["Next.js App Router", "TypeScript", "Neon Postgres", "Better Auth passkeys", "Vercel", "Bun"],
    outcomeLabel: "Operational outcome",
    outcome: "The live system provides one daily control surface for reviewing active work and deciding what to move next. The value is qualitative: less context reconstruction and a clearer operating picture, not a verified claim of time or cost savings.",
    limitations: "This is an owner-operated system, not a validated multi-tenant product. Integrations depend on configured service credentials, and several planning signals are intentionally lightweight rather than predictive analytics.",
    media: [
      { id: "command-center-overview", type: "screenshot", label: "Daily command center", description: "The live WORK//CTRL dashboard combining portfolio totals, priority work, pressure signals, and the project journal.", caption: "The daily control surface brings project counts, open tasks, focus work, operating pressure, and durable notes into one review.", alt: "Dark WORK//CTRL dashboard with project, task, signal, focus, pressure, and project-journal cards", desktop: { src: "/media/projects/work-control/work-control-dashboard-desktop.png", width: 3263, height: 1911 }, expandable: true, featured: true },
      { id: "project-portfolio", type: "screenshot", label: "Project portfolio", description: "The live project grid with operating category, stack, status, momentum, next action, repository activity, and deployment health.", caption: "Each project record keeps its operating purpose, next action, technical context, and connected-system status together.", alt: "WORK//CTRL project grid showing four project cards with status, momentum, next actions, repositories, and deployments", desktop: { src: "/media/projects/work-control/work-control-projects-desktop.png", width: 3263, height: 1905 }, expandable: true },
      { id: "task-activity", type: "screenshot", label: "Tasks and activity", description: "The live task, quick-launch, capture-inbox, and activity areas used to move work and retain an operating trail.", caption: "Concrete next actions sit beside quick-launch tools, loose-idea capture, and an automatic history of meaningful workspace changes.", alt: "WORK//CTRL task view with priority tasks, quick-launch actions, capture inbox, and recent activity", desktop: { src: "/media/projects/work-control/work-control-tasks-desktop.png", width: 3264, height: 1899 }, expandable: true },
      { id: "secure-mobile-access", type: "screenshot", label: "Secure mobile access", description: "The mobile Command Center sign-in screen with passkey authentication and recovery access.", caption: "Passkeys provide the primary owner sign-in path, with a separately presented recovery option when needed.", alt: "Mobile Command Center sign-in screen offering passkey and recovery access", desktop: { src: "/media/projects/work-control/work-control-command-mobile.png", width: 1272, height: 2599 }, expandable: true, layout: "phone" },
      { id: "mobile-operating-analytics", type: "screenshot", label: "Mobile operating analytics", description: "The mobile operating-analytics view with throughput, completion, cycle-time, daily-completion, and priority signals.", caption: "A narrow-screen analytics view keeps throughput, completion, cycle time, and open-priority signals readable away from the desktop.", alt: "Mobile WORK//CTRL operating analytics with throughput, completion, cycle time, daily bars, and priority levels", desktop: { src: "/media/projects/work-control/work-control-analytics-mobile.png", width: 1272, height: 2611 }, expandable: true, layout: "phone" },
    ],
    previewMediaId: "command-center-overview",
    cta: { label: "Discuss an internal command center", href: "/#contact" },
  },
  {
    slug: "signforge",
    number: "02",
    status: "Active concept",
    title: "SignForge",
    kicker: "CNC signage workflow",
    summary: "A configurable sales-to-production workflow for sign, CNC, and custom-fabrication businesses where every order carries options, approvals, material decisions, production steps, and a customer promise.",
    signal: "Configure the order once, then carry the approved intent through production",
    icon: "scan-line",
    industries: ["Sign shops", "CNC router shops", "Custom fabrication", "Exhibits and displays", "Architectural graphics", "Custom woodworking"],
    applications: [
      { title: "Configured quoting", description: "Capture dimensions, materials, finishes, installation, artwork, and option changes in a quote structure that can become the production record." },
      { title: "Proof and revision approval", description: "Keep customer decisions, revisions, approved artwork, and production authorization attached to the same job." },
      { title: "Material and production planning", description: "Translate the approved configuration into material requirements, routing steps, ownership, and readiness checkpoints." },
      { title: "Delivery and installation handoff", description: "Carry packaging, pickup, shipping, site, installation, and completion requirements through the final handoff." },
    ],
    paths: [
      { label: "CNC and signage systems", description: "Explore software and workflow design specifically for configurable sign and CNC work.", href: "/services/cnc-signage-systems" },
      { label: "Manufacturing software", description: "Position the same pattern around job release, material, capacity, and production visibility.", href: "/services/manufacturing-software" },
      { label: "Audit the current handoff", description: "Trace one real order from inquiry through fabrication before choosing what to build.", href: "/workflow-audit#audit-intake" },
    ],
    intendedFor: "Sign companies, CNC router shops, custom wood and metal fabricators, exhibit builders, architectural-graphics teams, and other made-to-order businesses that must turn customer selections into controlled production instructions.",
    problem: "Configured custom work can lose momentum and accuracy between inquiry, estimating, proofing, revision approval, material planning, toolpath preparation, fabrication, finishing, delivery, and installation.",
    previousWorkflow: "Customer details, dimensions, revisions, prices, material notes, and production status are often distributed across messages, paper, spreadsheets, design files, and the knowledge of whoever is running the job.",
    solution: "A proposed configurable-job workflow that keeps customer intent, priced options, approvals, material requirements, production stages, and delivery or installation requirements connected to the same order record.",
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
    summary: "A mobile-first inventory visibility pattern for small operations that need to distinguish what is physically on hand, already committed, available for new work, and due for replenishment.",
    signal: "Turn stock counts into job-aware availability and clear next actions",
    icon: "layers",
    industries: ["Small manufacturing", "Machine and fabrication shops", "Sign and CNC shops", "Contractors and field service", "Maintenance operations", "Parts and supply rooms"],
    applications: [
      { title: "Available-to-use inventory", description: "Separate physical on-hand quantity from material already committed to jobs so teams can make more reliable promises." },
      { title: "Receiving and consumption", description: "Give office, stockroom, shop, or field users a lightweight way to record what arrived and what was used." },
      { title: "Job and vehicle allocation", description: "Reserve material for production jobs, service calls, crews, vehicles, or locations without treating every movement as warehouse complexity." },
      { title: "Reorder and shortage attention", description: "Focus buyers and operators on low stock, upcoming shortages, missing receipts, and exceptions that require a decision." },
    ],
    paths: [
      { label: "Manufacturing inventory", description: "Explore material allocation and production visibility for a shop or small manufacturer.", href: "/services/manufacturing-software" },
      { label: "Inventory workflow automation", description: "Connect receiving, purchasing, spreadsheets, job records, and notifications without an all-at-once replacement.", href: "/services/workflow-automation" },
      { label: "Audit inventory flow", description: "Map how stock is received, committed, consumed, checked, and reordered before selecting the first module.", href: "/workflow-audit#audit-intake" },
    ],
    intendedFor: "Small manufacturers, machine and fabrication shops, sign businesses, contractors, field-service fleets, maintenance teams, and parts rooms that need trustworthy stock decisions without adopting an oversized warehouse or ERP platform.",
    problem: "Inventory becomes difficult to trust when receiving, job reservation, vehicle or location transfers, consumption, purchasing, and replenishment are recorded at different times or in different places.",
    previousWorkflow: "Check shelves, ask another person, search a spreadsheet, compare it with open jobs, and manually decide whether stock is available, committed, low, or already on order.",
    solution: "A mobile-first prototype organized around simple item records, stock movements, job or location commitments, available quantity, reorder attention, and an operating view that emphasizes exceptions instead of exhaustive warehouse reporting.",
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

export function getCaseStudyStructuredData(study: CaseStudy) {
  const url = `${brand.siteURL}/work/${study.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": `${url}#project-profile`,
        name: study.title,
        url,
        description: study.summary,
        creator: { "@id": `${brand.siteURL}/#organization`, name: brand.name },
        keywords: [...study.industries, ...study.applications.map(({ title }) => title), ...study.technologies, study.status],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: brand.siteURL },
          { "@type": "ListItem", position: 2, name: "Selected work", item: `${brand.siteURL}/#work` },
          { "@type": "ListItem", position: 3, name: study.title, item: url },
        ],
      },
    ],
  };
}
