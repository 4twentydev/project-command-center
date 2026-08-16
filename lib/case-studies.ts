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
  paths: { label: string; description: string; href: string; external?: boolean }[];
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
    slug: "jwld-store",
    number: "02",
    status: "Live system",
    title: "jwld.store",
    kicker: "Commerce and marketplace platform",
    summary: "A live, mobile-first commerce platform for a specialty-goods brand, demonstrating how product discovery, inventory, cart activity, custom requests, and a distinctive buying experience can become the foundation for an online marketplace.",
    signal: "Connect discovery, product truth, purchasing intent, and fulfillment in one branded experience",
    icon: "layers",
    industries: ["Independent brands", "Artists and makers", "Curated retail", "Specialty goods", "Beauty and accessories", "Local producers"],
    applications: [
      { title: "Direct-to-consumer storefront", description: "Give an independent brand a fast, focused catalog, product-detail experience, cart, and purchasing path without flattening its visual identity into a generic template." },
      { title: "Curated online marketplace", description: "Use the same catalog and merchandising foundation for a curated assortment, then add seller onboarding, commissions, moderation, and payouts when the operating model requires multiple vendors." },
      { title: "Limited and one-of-one inventory", description: "Keep product availability, featured items, categories, media, and price attached to the product record so scarce or handmade goods are represented accurately." },
      { title: "Custom-order intake", description: "Create a separate path for commissions and made-to-order requests when the buyer needs to describe an object, select options, or begin a conversation before purchase." },
    ],
    paths: [
      { label: "Visit the live store", description: "Explore the current branded catalog, product pages, featured assortment, shopping bag, and custom-commission path.", href: "https://jwld.store", external: true },
      { label: "Websites and online marketplaces", description: "Explore storefront, catalog, marketplace, intake, and operational-integration options for a product-led business.", href: "/services/small-business-websites" },
      { label: "Discuss a marketplace build", description: "Scope the smallest complete buying journey, then identify which catalog, seller, payment, fulfillment, or administration capabilities belong in the first release.", href: "/?service=small-business-websites&engagement=custom-operations-system#contact" },
    ],
    intendedFor: "Independent brands, artists, makers, curated retailers, specialty-product businesses, and marketplace operators that need a buying experience connected to accurate products, inventory, customer intent, and fulfillment responsibilities.",
    problem: "A product business needs more than attractive pages. Catalog structure, product media, availability, pricing, cart behavior, payment boundaries, custom requests, and fulfillment expectations must stay coherent as customers move from discovery to action.",
    previousWorkflow: "Before a dedicated commerce system, products may be promoted through social posts, messages, generic payment links, and manually updated listings, leaving buyers to ask what is available and the operator to reconcile orders by hand.",
    solution: "A branded commerce application that turns structured product records into responsive discovery, category browsing, detailed product views, quick-add and shopping-bag interactions, stock-aware merchandising, and a dedicated commission path.",
    capabilities: ["Responsive product catalog and detail pages", "Category browsing and featured merchandising", "Inventory-aware product availability", "Quick-add and shopping-bag interactions", "Custom-commission inquiry path", "Hosted product-media delivery"],
    technologies: ["Next.js App Router", "Neon Postgres", "Stripe integration", "Vercel Blob", "Vercel"],
    outcomeLabel: "Operational outcome",
    outcome: "The live system gives jwld a distinct, owned storefront where customers can browse available pieces, inspect individual products, build a shopping bag, and begin a custom commission. No sales, conversion-rate, or revenue improvement is claimed without verified analytics.",
    limitations: "The current implementation is a single-brand storefront, not a live multi-vendor marketplace. Seller accounts, catalog approval, commissions, split payments, payouts, disputes, moderation, and marketplace search would be scoped as additional operating systems before supporting outside vendors.",
    media: [{ id: "storefront-overview", type: "placeholder", label: "Live storefront overview", description: "Verified desktop and mobile views of the live jwld.store catalog, product, cart, and custom-commission experience.", caption: "Portfolio screenshots of the live storefront have not been supplied yet; visit jwld.store to view the current system.", requestedAsset: "Supply a desktop catalog or product view plus a mobile shopping-bag or custom-commission screen." }],
    previewMediaId: "storefront-overview",
    cta: { label: "Discuss an online marketplace", href: "/#contact" },
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
  {
    slug: "sic-pizza-pos",
    number: "04",
    status: "Working prototype",
    title: "SIC Pizza POS",
    kicker: "Sarcastic restaurant operations",
    summary: "A mobile-first tableside POS and collaborative-ordering prototype that carries diners, configured items, guest proposals, kitchen status, split payments, and an intentionally sarcastic brand voice through one restaurant workflow.",
    signal: "Keep the personality loud while pricing, approvals, kitchen state, and payment boundaries stay literal",
    icon: "scan-line",
    industries: ["Independent restaurants", "Pizza shops", "Bars and taprooms", "Food halls", "Pop-ups and events", "Multi-location concepts"],
    applications: [
      { title: "Tableside point of sale", description: "Give servers a responsive floor, table, diner, modifier, pricing, review, and kitchen-submission path that works across handheld and desktop-sized screens." },
      { title: "Collaborative guest ordering", description: "Let guests join a table without an account, view the shared order, and propose items while preserving employee approval before anything reaches production." },
      { title: "Kitchen display workflow", description: "Carry confirmed items into a constrained submitted, making, ready, and served lifecycle so front- and back-of-house views share the same operational state." },
      { title: "Split payment and audit trail", description: "Model diner-level allocations, tips, payment-provider boundaries, and append-only actor history before introducing certified payment processing or reconciliation." },
    ],
    paths: [
      { label: "Open the interactive prototype", description: "Use the current browser-runnable vertical slice to explore employee access, floor, ordering, kitchen, guest, payment, and history views.", href: "https://sic-pizza.vercel.app", external: true },
      { label: "Workflow automation", description: "Explore how ordering, approvals, kitchen transitions, notifications, and exception handling can become one controlled operating flow.", href: "/services/workflow-automation" },
      { label: "Review the source and architecture", description: "Inspect the public repository, domain rules, persistence schema, implementation boundaries, and phased production backlog.", href: "https://github.com/4twentydev/sic-pizza", external: true },
    ],
    intendedFor: "Independent restaurants, pizza shops, bars, food halls, pop-up operators, and growing hospitality concepts that want an owned ordering experience shaped around their service model rather than a generic terminal workflow.",
    problem: "Restaurant orders cross staff access, tables, diners, modifiers, pricing, guest requests, kitchen production, payment, and support history. When those states drift, the team must reconcile what was requested, approved, fired, served, and paid during active service.",
    previousWorkflow: "A small operation may combine handwritten tickets, verbal kitchen calls, generic terminals, separate QR menus, payment hardware, and manager memory, leaving customer context and production status distributed across people and devices.",
    solution: "A browser-runnable vertical slice that models employee entry, a multi-table floor, custom pizza pricing, guest item proposals with server approval, kitchen lifecycle transitions, equal-split mock payments, configurable voice, and append-only event history.",
    capabilities: ["Responsive staff floor and table workflow", "Custom items with integer-cent pricing", "Guest join and employee approval boundary", "Kitchen display lifecycle", "Equal-split mocked payment authorization", "Configurable sarcastic voice with neutral safety contexts", "Multi-location PostgreSQL persistence schema", "Append-only audit-event model"],
    technologies: ["Next.js 16 App Router", "React 19", "TypeScript", "Drizzle ORM", "PostgreSQL schema", "Zod", "Bun", "Tailwind CSS"],
    outcomeLabel: "Intended outcome",
    outcome: "The intended outcome is a restaurant system that keeps floor, guest, kitchen, payment, and audit context connected while allowing a memorable brand voice in non-sensitive moments. The current prototype demonstrates the workflow but has not produced verified service-speed, order-accuracy, or revenue results.",
    limitations: "This is an in-progress prototype using in-memory interaction, a seeded development PIN, a decorative same-browser QR flow, mocked kitchen updates, and mocked card authorization. Production persistence, hashed authentication, rotating join tokens, real-time projections, certified payments, refunds, reconciliation, offline recovery, printers, cash drawers, device testing, and security review remain future milestones.",
    media: [{ id: "pos-prototype-overview", type: "placeholder", label: "POS prototype overview", description: "Verified desktop and mobile views of the SIC Pizza floor, ordering, kitchen, guest, payment, and history workflow.", caption: "Portfolio screenshots of the working POS prototype have not been supplied yet; the live demo remains available for review.", requestedAsset: "Supply a desktop floor or kitchen view plus a mobile ordering, guest-join, or split-payment screen." }],
    previewMediaId: "pos-prototype-overview",
    cta: { label: "Discuss a custom POS workflow", href: "/#contact" },
  },
  {
    slug: "employee-barcodes",
    number: "05",
    status: "Live system",
    title: "Employee Barcodes",
    kicker: "Production identity and traceability",
    summary: "A live internal-tool pattern for assigning unique employee numbers, generating standardized Code 128 labels, printing label sheets, and sharing barcode images for downstream production, completion, quality, packaging, or handoff scans.",
    signal: "Make the employee identifier easy to issue, carry, share, and scan wherever work is completed",
    icon: "scan-line",
    industries: ["Architectural panel production", "Manufacturing and fabrication", "CNC and sign shops", "Warehousing and fulfillment", "Packaging and shipping", "Field service and maintenance"],
    applications: [
      { title: "Production completion attribution", description: "Issue a consistent employee barcode that can be scanned by a separate production system when panels, parts, assemblies, or jobs reach a defined completion point." },
      { title: "Quality and inspection handoff", description: "Reuse the same employee identity at inspection, rework, approval, or release stations so a downstream system can associate the responsible operator with an event." },
      { title: "Packing and shipping identification", description: "Give packaging, staging, and shipping teams portable employee labels for scan-based handoffs without repeatedly typing employee numbers at shared workstations." },
      { title: "Rapid label distribution", description: "Search active employees, preview a standardized label, print individual or multi-label sheets, and share a generated PNG when a physical label is needed quickly." },
    ],
    paths: [
      { label: "Open the live barcode tool", description: "Use the deployed employee-label workflow for directory management, barcode preview, print-sheet composition, and label sharing.", href: "https://barcodes.4twenty.dev", external: true },
      { label: "Manufacturing software", description: "Connect operator identity to job, panel, part, quality, inventory, packaging, or completion records inside a broader production system.", href: "/services/manufacturing-software" },
      { label: "Workflow automation", description: "Design the downstream scan event, validation, exception, notification, and reporting flow that gives the barcode operational meaning.", href: "/services/workflow-automation" },
    ],
    intendedFor: "Manufacturers, panel and fabrication shops, warehouses, packaging teams, field-service operations, and other employers that need a simple, repeatable employee identifier for scan-based attribution or workstation handoffs.",
    problem: "Production teams may know who completed, checked, packed, moved, or released work, but entering employee identities manually at shared terminals is slow and inconsistent. Labels also become difficult to replace or distribute when their source records and print format are scattered.",
    previousWorkflow: "Look up or remember an employee number, type it into another system, build labels manually, reformat a spreadsheet, or depend on a supervisor to print and redistribute identifiers when an employee starts, changes, or needs a replacement.",
    solution: "A focused employee-label system with searchable active and inactive records, unique numeric identifiers, Code 128 generation, standardized live preview, up-to-eight-label print sheets, activation controls, and shareable PNG output for mobile or remote distribution.",
    capabilities: ["Employee directory with unique numeric identifiers", "Active, inactive, edit, and reactivation controls", "Code 128 barcode generation", "Searchable multi-label sheet composition", "Avery-format print layout for up to eight labels", "Shareable PNG label output", "Device share and clipboard fallbacks", "Neon-backed employee records"],
    technologies: ["Next.js App Router", "React 19", "TypeScript", "Neon Postgres", "Drizzle ORM", "Zod", "bwip-js", "Next.js ImageResponse", "Tailwind CSS"],
    outcomeLabel: "Operational outcome",
    outcome: "The live system centralizes employee barcode assignment and makes standardized labels available for preview, printing, and digital sharing. Its operational value is enabling faster identity entry in downstream scan workflows; no verified throughput, accuracy, or labor-savings metric is claimed.",
    limitations: "The application generates and manages employee barcode labels but does not itself record scanner events, completed panels, quality checks, timekeeping, or production history. Barcode values are identifiers, not authentication credentials. The current repository does not demonstrate login, authorization, or role controls, so access and employee-data exposure require review before the deployment is treated as a protected production system.",
    media: [{ id: "barcode-tool-overview", type: "placeholder", label: "Employee barcode workflow", description: "Verified desktop and mobile views of the employee directory, label builder, live barcode preview, print sheet, and share workflow.", caption: "Portfolio screenshots of the live employee-barcode tool have not been supplied yet; the deployed system remains available for review.", requestedAsset: "Supply a desktop label-builder or employee-directory view plus a mobile preview or share-sheet view with employee information safely redacted." }],
    previewMediaId: "barcode-tool-overview",
    cta: { label: "Discuss a scan-based workflow", href: "/#contact" },
  },
  {
    slug: "acm-weekly",
    number: "06",
    status: "Live system",
    title: "ACM Weekly",
    kicker: "Authenticated production intelligence",
    summary: "A live, login-protected analytics portal for reviewing ACM and Seal & Stack throughput, crew mix, operator reviews, and recurring production signals without distributing sensitive operating data through static reports.",
    signal: "Turn weekly production records into a controlled view of throughput, staffing context, and review activity",
    icon: "gauge",
    industries: ["Architectural panel manufacturing", "Manufacturing and fabrication", "Shift-based production", "Production management", "Quality and process improvement", "Plant operations"],
    applications: [
      { title: "Weekly throughput review", description: "Bring ACM and Seal & Stack production activity into a consistent weekly view so leaders can compare output, spot changes, and begin the next operating conversation from shared evidence." },
      { title: "Crew-mix analysis", description: "Place staffing composition beside production results so supervisors can review operational context without rebuilding the relationship manually from separate schedules and reports." },
      { title: "Operator review workflow", description: "Organize operator-level review signals inside the same production-intelligence system while keeping interpretation and personnel decisions with authorized managers." },
      { title: "Controlled dashboard distribution", description: "Give approved users individual logons to a current web dashboard instead of emailing spreadsheets, screenshots, or static reports that are difficult to revoke or keep synchronized." },
    ],
    paths: [
      { label: "Open the ACM Weekly login", description: "Visit the deployed production-intelligence portal; authenticated access keeps its operational dashboards behind the user-logon boundary.", href: "https://acmweekly.com", external: true },
      { label: "Manufacturing software", description: "Explore custom production dashboards that connect throughput, staffing, quality, completion, and exception data to the decisions a plant already makes.", href: "/services/manufacturing-software" },
      { label: "Workflow automation", description: "Connect source records, recurring calculations, review steps, notifications, and dashboard refreshes without rebuilding the weekly report by hand.", href: "/services/workflow-automation" },
    ],
    intendedFor: "Architectural panel manufacturers, fabrication teams, shift-based plants, production managers, supervisors, and process-improvement teams that need recurring operational analytics available only to approved users.",
    problem: "Weekly operating decisions become slower and less reliable when production totals, crew assignments, and operator-review context live in separate spreadsheets, messages, or manager-maintained reports. Sensitive production and personnel information also needs a more deliberate distribution boundary than an emailed file.",
    previousWorkflow: "Collect production records from several sources, reconcile ACM and Seal & Stack output by hand, match results to the relevant crew or operator context, rebuild charts for each review, and redistribute another static copy to stakeholders.",
    solution: "A responsive production-intelligence portal that presents recurring throughput, crew-mix, and operator-review analytics behind user logons, giving authorized stakeholders one current destination for weekly review instead of another manually circulated report.",
    capabilities: ["User-logon protected dashboard access", "ACM and Seal & Stack throughput views", "Crew-mix operating context", "Operator-review analytics", "Recurring weekly production reporting", "Responsive web dashboard delivery"],
    technologies: ["Next.js App Router", "Vercel", "Authenticated web access", "Operational analytics design"],
    outcomeLabel: "Operational outcome",
    outcome: "The live deployment provides an authenticated destination for recurring production-intelligence review and keeps its dashboards out of the public site surface. No throughput improvement, labor reduction, adoption rate, or decision-speed gain is claimed without verified baseline and usage data.",
    limitations: "The public surface verifies the login boundary and identifies throughput, crew mix, and operator reviews as the dashboard scope, but the protected views are not publicly inspectable. Role granularity, source-system integrations, refresh frequency, export controls, calculation definitions, adoption, and measured business impact require private validation before they are presented as established capabilities or results.",
    media: [{ id: "acm-weekly-dashboard", type: "placeholder", label: "Authenticated production dashboard", description: "A privacy-safe desktop or mobile view of ACM Weekly throughput, crew-mix, and operator-review analytics after authentication.", caption: "Portfolio screenshots of the protected analytics dashboard have not been supplied yet; the public deployment currently presents its user-login boundary.", requestedAsset: "Supply a desktop dashboard overview and one mobile or focused analytics view with employee names, credentials, production-sensitive totals, and other private identifiers safely redacted." }],
    previewMediaId: "acm-weekly-dashboard",
    cta: { label: "Discuss an analytics dashboard", href: "/#contact" },
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
