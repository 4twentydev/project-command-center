import type { EngagementId } from "@/lib/engagements";
import { brand } from "@/lib/brand";

export type ServiceSlug =
  | "manufacturing-software"
  | "workflow-automation"
  | "small-business-websites"
  | "cnc-signage-systems";

export type PublicService = {
  slug: ServiceSlug;
  number: string;
  name: string;
  icon: "factory" | "workflow" | "website" | "scan-line";
  primary: boolean;
  eyebrow: string;
  headline: string;
  summary: string;
  targetCustomer: string;
  problems: readonly { title: string; description: string }[];
  deliverables: readonly string[];
  process: readonly { title: string; description: string }[];
  caseStudyLinks: readonly { slug: string; relevance: string }[];
  typicalEngagement: { label: string; note: string };
  faqs: readonly { question: string; answer: string }[];
  cta: { label: string; href: string };
  defaultEngagementId: EngagementId;
  contactProjectType: string;
  seo: { title: string; description: string };
  futureCaseStudies: readonly string[];
};

export const publicServices = [
  {
    slug: "manufacturing-software",
    number: "01",
    name: "Manufacturing Software",
    icon: "factory",
    primary: true,
    eyebrow: "Primary specialty · production systems",
    headline: "Software built around how the job actually moves.",
    summary: "Focused operating systems for manufacturers that need clearer quoting, inventory, production status, scheduling, shipping, or reporting without forcing the floor into a generic platform.",
    targetCustomer: "Small manufacturers, production teams, and fabrication shops whose work crosses the office, material racks, machines, packaging, shipping, and customer handoffs.",
    problems: [
      { title: "Production status is reconstructed", description: "Schedules, paper travelers, messages, and walk-arounds disagree about what is ready, blocked, or late." },
      { title: "Inventory is hard to trust", description: "On-hand, committed, consumed, and reordered material are recorded in different places or at different times." },
      { title: "The owner remains the integration", description: "Quoting rules, priorities, exceptions, and customer promises keep returning to one person for interpretation." },
      { title: "The same job is entered repeatedly", description: "Sales, production, purchasing, shipping, and reporting maintain parallel versions of the same information." },
    ],
    deliverables: ["Production and job-status dashboards", "Quote and estimating tools", "Inventory and material-allocation systems", "Scheduling and capacity views", "Packing, shipping, and handoff workflows", "Operational reporting and exception queues"],
    process: [
      { title: "Trace one real job", description: "Follow a current order from request through shipment and identify every handoff, decision, duplicate entry, and blind spot." },
      { title: "Define the operating record", description: "Agree on the job, material, status, ownership, and exception data the team must be able to trust." },
      { title: "Build the smallest useful module", description: "Start with the constraint creating the most drag rather than attempting an all-at-once ERP replacement." },
      { title: "Test against floor reality", description: "Review the system with the people entering, moving, and acting on the information before expanding it." },
      { title: "Roll out in controlled stages", description: "Document ownership, migration, support, and the next integration only after the first workflow is stable." },
    ],
    caseStudyLinks: [
      { slug: "shop-inventory", relevance: "A working prototype exploring practical on-hand, committed, receiving, and reorder visibility for a small shop." },
      { slug: "work-control", relevance: "A live system showing how scattered operating signals can become one daily control surface; it is owner-operated, not a manufacturing deployment." },
      { slug: "employee-barcodes", relevance: "A live employee-label tool showing how standardized operator identifiers can support downstream production, quality, packing, and completion scans." },
      { slug: "acm-weekly", relevance: "A live authenticated analytics portal showing how throughput, crew mix, and operator-review signals can support a recurring production review." },
    ],
    typicalEngagement: { label: "Typically $1,500–$3,500 for one focused workflow; connected systems typically start at $5,000", note: "Planning range only. Integrations, migration, hardware, support, and the number of workflows materially affect scope." },
    faqs: [
      { question: "Do you replace an ERP or accounting system?", answer: "Usually not as a first move. The better starting point is often the workflow around an existing system: capturing missing information, reducing duplicate entry, or giving the floor a clearer operating view." },
      { question: "Can the software work with spreadsheets we already use?", answer: "Often, yes. A spreadsheet can be a migration source, an export target, or a temporary bridge. The specific approach depends on who owns the data and how reliably it is maintained." },
      { question: "Can you integrate machines, scanners, or accounting tools?", answer: "Potentially, after their APIs, file formats, network constraints, and support requirements are verified. Hardware or vendor integration is never assumed in the initial range." },
      { question: "How do we start without disrupting production?", answer: "Start with a bounded workflow, test it beside the current process, and define a clear fallback. Broader rollout comes only after the operating record and floor interaction prove usable." },
    ],
    cta: { label: "Discuss a manufacturing workflow", href: "/?service=manufacturing-software&engagement=custom-operations-system#contact" },
    defaultEngagementId: "custom-operations-system",
    contactProjectType: "Manufacturing Software",
    seo: { title: "Manufacturing Software", description: "Custom manufacturing software for quoting, inventory, production tracking, scheduling, shipping, and operational visibility." },
    futureCaseStudies: ["A live production-status implementation with verified adoption evidence", "A quoting-to-job handoff with documented before-and-after workflow", "A shipping or packing workflow connected to real production records"],
  },
  {
    slug: "workflow-automation",
    number: "02",
    name: "Workflow Automation",
    icon: "workflow",
    primary: true,
    eyebrow: "Primary specialty · connected work",
    headline: "Remove the re-entry, chasing, and paperwork between tools.",
    summary: "Practical automation for recurring office and field workflows where information is copied, reformatted, approved, scheduled, or followed up by hand.",
    targetCustomer: "Owner-led companies, contractors, field-service teams, and small operations that already have useful tools but still rely on people to carry information between them.",
    problems: [
      { title: "Intake stops at the inbox", description: "Requests arrive without the details needed to quote, schedule, assign, or respond consistently." },
      { title: "Paperwork is recreated", description: "The same job details are reformatted into estimates, work orders, packing lists, reports, and customer updates." },
      { title: "Exceptions disappear", description: "Approvals, missing inputs, failed handoffs, and overdue follow-ups live in personal reminders or message threads." },
      { title: "Scheduling changes do not travel", description: "A delay in one tool does not update the people, documents, and downstream decisions that depend on it." },
    ],
    deliverables: ["Structured intake and qualification flows", "Quote, document, and packing-list generators", "Approval and follow-up automations", "Scheduling and dispatch handoffs", "Cross-tool status dashboards", "Exception queues with human review"],
    process: [
      { title: "Choose one repeated path", description: "Define a workflow with a clear trigger, finish line, frequency, and person currently responsible for carrying it." },
      { title: "Separate rules from judgment", description: "Identify what can be deterministic, what requires approval, and what must stay visible when automation cannot proceed." },
      { title: "Connect only what is necessary", description: "Use supported APIs, files, email, or a small application without adding an integration merely because it exists." },
      { title: "Test normal and failure paths", description: "Verify duplicates, missing information, vendor outages, retries, and the manual recovery path before release." },
      { title: "Measure whether the handoff improved", description: "Review completion, exception, and follow-up behavior qualitatively or with agreed metrics when reliable data exists." },
    ],
    caseStudyLinks: [
      { slug: "work-control", relevance: "A live owner-operated system combining project, deployment, reminder, and lead-follow-up signals in one place." },
      { slug: "shop-inventory", relevance: "A working prototype showing how simple records and exception-focused views can replace repeated stock checks." },
      { slug: "sic-pizza-pos", relevance: "A working restaurant POS prototype connecting tables, configured orders, guest approvals, kitchen states, mocked split payments, and an auditable event trail." },
      { slug: "employee-barcodes", relevance: "A live identity-label workflow that makes employee barcodes searchable, printable, and shareable before a separate production system captures scan events." },
      { slug: "acm-weekly", relevance: "A live weekly-reporting destination that brings recurring production calculations and review context into a controlled dashboard instead of another static report." },
    ],
    typicalEngagement: { label: "Typically $1,500–$3,500 for one tightly scoped automation", note: "Planning range only. Vendor APIs, data cleanup, approval rules, reliability requirements, and ongoing support can change the implementation range." },
    faqs: [
      { question: "What should be automated first?", answer: "A frequent, rule-driven handoff with a clear input and output—not necessarily the workflow people complain about most. A workflow audit can identify the smallest useful starting point." },
      { question: "Will automation remove the human review step?", answer: "Only where the rule is safe and explicit. Pricing judgment, unusual jobs, customer commitments, and failed handoffs often need a visible approval or exception queue." },
      { question: "Can you connect the software we already use?", answer: "Sometimes. Each connection depends on the vendor’s supported API, permissions, rate limits, export options, and commercial terms. Those are verified before an integration is promised." },
      { question: "What happens when an automation fails?", answer: "The workflow should fail visibly, preserve enough context to recover, and avoid silently duplicating work. Failure handling is part of the design, not an afterthought." },
    ],
    cta: { label: "Scope an automation sprint", href: "/?service=workflow-automation&engagement=workflow-sprint#contact" },
    defaultEngagementId: "workflow-sprint",
    contactProjectType: "Workflow Automation",
    seo: { title: "Workflow Automation", description: "Workflow automation for intake, documents, approvals, scheduling, follow-up, and the handoffs between disconnected business tools." },
    futureCaseStudies: ["A document-generation workflow with verified processing evidence", "A contractor intake-to-scheduling automation", "A cross-tool approval flow showing documented exception handling"],
  },
  {
    slug: "small-business-websites",
    number: "03",
    name: "Websites & Online Marketplaces",
    icon: "website",
    primary: false,
    eyebrow: "Customer acquisition · commerce systems",
    headline: "Turn attention into inquiries, orders, or marketplace activity.",
    summary: "Fast, focused websites, storefronts, and online marketplaces designed around a useful customer action—and connected to the catalog, seller, payment, fulfillment, or follow-up process behind it.",
    targetCustomer: "Small service businesses, independent brands, makers, curated retailers, and marketplace operators that need a credible web presence or buying experience tied to an operating process they can actually manage.",
    problems: [
      { title: "The next step is unclear", description: "Visitors see a list of services but do not know whether to call, book, request a quote, or provide project details." },
      { title: "Leads arrive unqualified", description: "Contact forms collect too little context, creating another round of messages before anyone can decide what happens next." },
      { title: "The site and operation are disconnected", description: "A form submission lands in an inbox without attribution, ownership, follow-up status, or a path into scheduling and quoting." },
      { title: "The catalog and operation disagree", description: "Products, availability, seller details, orders, and fulfillment responsibilities drift when the public experience is not connected to an owned operating record." },
      { title: "Claims outrun evidence", description: "Generic marketing copy makes promises the business cannot support instead of explaining the real process and fit." },
    ],
    deliverables: ["Focused service or company websites", "Product catalogs and branded storefronts", "Curated or multi-vendor marketplace foundations", "Quote, booking, order, and custom-request paths", "Catalog, seller, payment, and fulfillment workflows", "Performance, accessibility, analytics, and search foundations"],
    process: [
      { title: "Define the transaction", description: "Choose the primary action—call, booking, quote, order, custom request, or seller activity—and the information needed to make it operationally useful." },
      { title: "Build the decision path", description: "Organize services or products, fit, proof, price, availability, policies, and objections around the questions a qualified visitor actually asks." },
      { title: "Prototype the handoff", description: "Design forms, carts, seller flows, and calls to action together with the internal response, payment, routing, fulfillment, and follow-up process." },
      { title: "Build for speed and access", description: "Implement responsive pages, semantic structure, keyboard access, clear contrast, and restrained motion from the start." },
      { title: "Verify the full handoff", description: "Test direct routes, metadata, forms, catalog truth, cart or payment boundaries, notifications, failure paths, and the next operational step before launch." },
    ],
    caseStudyLinks: [
      { slug: "work-control", relevance: "This live 4TWENTY.DEV system includes the public site, private owner access, inquiry capture, lead follow-up, and service attribution; it is an internal system rather than a client result." },
      { slug: "jwld-store", relevance: "A live specialty-goods storefront demonstrating branded discovery, product records, inventory-aware merchandising, cart interaction, and a custom-commission path." },
    ],
    typicalEngagement: { label: "Typically $1,500–$3,500 for a focused site; commerce and marketplace systems typically start at $5,000", note: "Planning range only. Catalog size, seller roles, payments, migration, fulfillment rules, approved assets, integrations, and ongoing support determine final scope." },
    faqs: [
      { question: "Do you build simple brochure websites?", answer: "A concise informational site can be appropriate, but it still needs a job: generate a call, booking, quote request, order, or another useful next step. The content and structure are built around that action." },
      { question: "Can you build an online marketplace?", answer: "Yes, when the operating model is defined. A single-brand storefront, curated catalog, and multi-vendor marketplace have different needs. Seller onboarding, product approval, commissions, split payments, payouts, moderation, disputes, tax, and fulfillment ownership are scoped explicitly rather than assumed." },
      { question: "Do you provide copy and photography?", answer: "I can structure and edit operationally accurate copy from your source material. Final photography, credentials, testimonials, locations, and performance claims must be supplied or explicitly verified; placeholders remain labeled until then." },
      { question: "Can the site connect to booking or ordering?", answer: "Yes when an existing service is selected and configured, or through a documented adapter. Vendor choice, fees, credentials, and operational ownership are confirmed rather than assumed." },
      { question: "What does search optimization include?", answer: "Technical metadata, semantic headings, crawlable routes, fast delivery, descriptive content, and structured data where appropriate. Rankings, traffic, calls, and revenue are not guaranteed." },
    ],
    cta: { label: "Plan a website or marketplace", href: "/?service=small-business-websites&engagement=workflow-sprint#contact" },
    defaultEngagementId: "workflow-sprint",
    contactProjectType: "Websites & Online Marketplaces",
    seo: { title: "Websites & Online Marketplaces", description: "Websites, storefronts, and online marketplaces built to generate qualified inquiries or orders and connect customer activity to workable catalog, seller, payment, fulfillment, and follow-up processes." },
    futureCaseStudies: ["A service-business website with verified inquiry-quality evidence", "A marketplace with documented seller onboarding and transaction ownership", "A commerce experience connected to verified order and fulfillment operations"],
  },
  {
    slug: "cnc-signage-systems",
    number: "04",
    name: "CNC and Signage Systems",
    icon: "scan-line",
    primary: false,
    eyebrow: "Digital fabrication · job flow",
    headline: "Keep the decisions attached to the sign from quote to cut.",
    summary: "Production-minded tools for custom sign and CNC work where dimensions, options, approvals, materials, files, fabrication stages, finishing, and delivery must stay connected.",
    targetCustomer: "Small sign makers, CNC shops, architectural-fabrication teams, and custom producers handling jobs that combine customer decisions with material and machine constraints.",
    problems: [
      { title: "Quotes depend on tribal knowledge", description: "Material, size, finish, tooling, setup, labor, and installation decisions are priced inconsistently or wait for one experienced person." },
      { title: "Approval history gets separated", description: "The approved dimensions, spelling, artwork, finish, and revision can be hard to distinguish from earlier messages or files." },
      { title: "Material planning starts too late", description: "Stock, yield, offcuts, purchasing, and job commitments are checked after customer decisions have already created a production deadline." },
      { title: "The shop cannot see readiness", description: "A job may be quoted but not approved, approved but missing material, or cut but waiting on finishing or installation." },
    ],
    deliverables: ["Structured sign and fabrication intake", "Option-based estimating and quote tools", "Proof, revision, and approval records", "Material planning and job allocation", "Production-stage and readiness tracking", "Cut-list, packing, delivery, and installation handoffs"],
    process: [
      { title: "Map one product family", description: "Start with a repeatable class of work and document its customer choices, estimating inputs, design decisions, material rules, and production stages." },
      { title: "Define approval boundaries", description: "Make clear what the customer approved, what changed, and what must be resolved before material or machine time is committed." },
      { title: "Model material and readiness", description: "Connect requirements, stock decisions, files, tooling, and prerequisites to a visible job state." },
      { title: "Test with real job variations", description: "Use representative sizes, finishes, revisions, rush conditions, remakes, and installation needs to expose weak rules." },
      { title: "Introduce floor interaction carefully", description: "Keep data entry short, readable, and recoverable around gloves, dust, shared devices, and interrupted work." },
    ],
    caseStudyLinks: [
      { slug: "shop-inventory", relevance: "A working inventory prototype relevant to stock, commitments, receiving, and reorder attention in a fabrication environment." },
    ],
    typicalEngagement: { label: "Typically $1,500–$3,500 for one quoting, intake, or production workflow; connected shop systems typically start at $5,000", note: "Planning range only. Product rules, machine or design-file integration, hardware, material logic, migration, and floor support affect scope." },
    faqs: [
      { question: "Do you generate CNC toolpaths or machine code?", answer: "Not by default. A system can organize job inputs, files, readiness, and handoffs, but post-processors, toolpaths, machine control, and safety-critical output require equipment-specific validation and clearly defined responsibility." },
      { question: "Can quoting account for material and production options?", answer: "Yes, when the shop can define and validate its rules. The tool should expose exceptions and judgment calls rather than pretend every custom job is fully formulaic." },
      { question: "How are customer approvals handled?", answer: "The system can preserve the proof, selected options, revision, approver, and timestamp associated with a decision. Legal terms, signatures, and retention requirements must be agreed for the specific business." },
      { question: "Can this work on a shop-floor tablet or phone?", answer: "Yes, the interface can be mobile-first and touch-friendly. Device mounting, connectivity, scanning hardware, protective equipment, and actual floor conditions are verified during scoping." },
    ],
    cta: { label: "Map a CNC or signage workflow", href: "/?service=cnc-signage-systems&engagement=workflow-sprint#contact" },
    defaultEngagementId: "workflow-sprint",
    contactProjectType: "CNC and Signage Systems",
    seo: { title: "CNC and Signage Systems", description: "CNC and signage workflow systems for quoting, approvals, material planning, production tracking, and digital-fabrication handoffs." },
    futureCaseStudies: ["A working quote calculator validated against a real product family", "A proof-approval workflow with verified revision history", "A shop-floor production tracker tested during live fabrication"],
  },
] as const satisfies readonly PublicService[];

export function getPublicService(slug: string | null | undefined) {
  return publicServices.find((service) => service.slug === slug) ?? null;
}

export function getServiceContactHref(service: PublicService) {
  const params = new URLSearchParams({ service: service.slug, engagement: service.defaultEngagementId });
  return `/?${params.toString()}#contact`;
}

export function getServiceStructuredData(service: PublicService) {
  const url = `${brand.siteURL}/services/${service.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: service.name,
        serviceType: service.name,
        url,
        description: service.seo.description,
        provider: { "@type": "Organization", "@id": `${brand.siteURL}/#organization`, name: brand.name, url: brand.siteURL },
        audience: { "@type": "Audience", audienceType: service.targetCustomer },
        offers: {
          "@type": "Offer",
          description: `${service.typicalEngagement.label}. ${service.typicalEngagement.note}`,
          url: `${url}#engagement`,
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: service.faqs.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: brand.siteURL },
          { "@type": "ListItem", position: 2, name: "Services", item: `${brand.siteURL}/#services` },
          { "@type": "ListItem", position: 3, name: service.name, item: url },
        ],
      },
    ],
  };
}
