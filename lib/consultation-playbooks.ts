import { getPublicService, type ServiceSlug } from "@/lib/services";

export type ConsultationField = {
  id: string;
  label: string;
  prompt: string;
  kind: "short" | "long" | "select";
  required?: boolean;
  options?: readonly string[];
};

export type ConsultationSection = {
  id: string;
  title: string;
  description: string;
  fields: readonly ConsultationField[];
};

export type ConsultationPlaybook = {
  serviceSlug: ServiceSlug;
  objective: string;
  callPlan: readonly string[];
  evidenceToRequest: readonly string[];
  cautionSignals: readonly string[];
  sections: readonly ConsultationSection[];
  developmentGate: readonly string[];
};

const commonContextFields = [
  { id: "trigger", label: "Why now?", prompt: "What changed, broke, grew, or became too costly to keep handling the same way?", kind: "long", required: true },
  { id: "decision-makers", label: "Decision makers and users", prompt: "Who approves the work, who owns the process, and who will use the result day to day?", kind: "long", required: true },
  { id: "priority", label: "Business priority", prompt: "How does this compare with the other work competing for time and budget?", kind: "select", required: true, options: ["Immediate operational issue", "This quarter", "Planned improvement", "Early exploration"] },
] as const satisfies readonly ConsultationField[];

const commonOutcomeFields = [
  { id: "desired-outcome", label: "Desired operating outcome", prompt: "Describe what should be easier, faster, clearer, or less dependent on one person after this works.", kind: "long", required: true },
  { id: "success-evidence", label: "Evidence of success", prompt: "What observable behavior or reliable measure would show the workflow improved?", kind: "long", required: true },
  { id: "first-release", label: "Smallest useful release", prompt: "What is the narrowest version that would create real value without requiring the whole system?", kind: "long", required: true },
] as const satisfies readonly ConsultationField[];

const commonDeliveryFields = [
  { id: "data-owner", label: "Data ownership", prompt: "Where does the authoritative information live, who maintains it, and how clean is it?", kind: "long", required: true },
  { id: "access-constraints", label: "Access and constraints", prompt: "List vendor access, devices, permissions, compliance needs, network limits, and unavailable integrations.", kind: "long" },
  { id: "review-process", label: "Review and acceptance", prompt: "Who reviews prototypes, how quickly can they respond, and what must be true for acceptance?", kind: "long", required: true },
  { id: "support-owner", label: "Launch and support owner", prompt: "Who owns training, data corrections, exceptions, and support after handoff?", kind: "long" },
] as const satisfies readonly ConsultationField[];

export const consultationPlaybooks: readonly ConsultationPlaybook[] = [
  {
    serviceSlug: "manufacturing-software",
    objective: "Leave with one traceable production workflow, a trustworthy operating record, and a bounded first module.",
    callPlan: ["Set the operational boundary", "Trace one representative job", "Mark handoffs, decisions, and exceptions", "Identify the system of record", "Choose the first useful module and validation plan"],
    evidenceToRequest: ["A representative traveler, order, or job packet", "Current schedule or production board", "Inventory, purchasing, packing, and shipping records", "Examples of late, blocked, expedited, and remade jobs"],
    cautionSignals: ["The requested solution starts as a full ERP replacement", "No one can name the authoritative job status", "Floor users are absent from discovery", "Machine integration is assumed before equipment and responsibility are verified"],
    sections: [
      { id: "context", title: "Operating context", description: "Establish why the production workflow matters and who owns it.", fields: commonContextFields },
      { id: "workflow", title: "Current job flow", description: "Trace a real job rather than discussing an idealized process.", fields: [
        { id: "job-start", label: "Job entry point", prompt: "What creates a job, which information is required, and what is commonly missing?", kind: "long", required: true },
        { id: "production-stages", label: "Production stages", prompt: "List the actual stages, queues, approvals, holds, and handoffs through shipment.", kind: "long", required: true },
        { id: "status-source", label: "Current status source", prompt: "How does someone determine ready, running, blocked, late, complete, packed, or shipped today?", kind: "long", required: true },
        { id: "volume-mix", label: "Volume and product mix", prompt: "What is the normal job volume, variation, lead time, and exception rate?", kind: "long" },
      ] },
      { id: "materials", title: "Materials and information", description: "Find where inventory, job, and production records stop agreeing.", fields: [
        { id: "inventory-states", label: "Inventory states", prompt: "How are on-hand, committed, consumed, scrap, receiving, and reorder quantities handled?", kind: "long", required: true },
        { id: "duplicate-entry", label: "Duplicate entry", prompt: "Where is the same job information retyped, copied, reconciled, or reformatted?", kind: "long" },
        { id: "exceptions", label: "Critical exceptions", prompt: "Which missing materials, approvals, files, quality issues, or priority changes need immediate visibility?", kind: "long", required: true },
      ] },
      { id: "outcome", title: "Scope and outcome", description: "Define the smallest operational result worth shipping.", fields: commonOutcomeFields },
      { id: "delivery", title: "Development handoff", description: "Expose the constraints that determine architecture, rollout, and support.", fields: commonDeliveryFields },
    ],
    developmentGate: ["A current-state job map is approved", "Job, material, status, ownership, and exception records are defined", "The first module has explicit in/out-of-scope boundaries", "Floor interaction is tested with representative users and devices", "Migration, fallback, acceptance, and support ownership are documented"],
  },
  {
    serviceSlug: "workflow-automation",
    objective: "Define one repeatable handoff with a clear trigger, finish line, human checkpoints, and visible failure path.",
    callPlan: ["Choose one repeated path", "Walk through the last real example", "Separate rules from judgment", "Map systems and permissions", "Design success, exception, and recovery paths"],
    evidenceToRequest: ["The last three real inputs and outputs", "Templates, emails, spreadsheets, and checklists used", "Screenshots or exports from each involved tool", "Examples of duplicates, failures, missing information, and manual recovery"],
    cautionSignals: ["The trigger or finish line cannot be defined", "Automation is expected to hide exceptions", "A vendor connection is assumed without supported access", "The workflow changes every time because the underlying policy is undefined"],
    sections: [
      { id: "context", title: "Automation context", description: "Establish the repeated work and the reason it deserves attention.", fields: commonContextFields },
      { id: "workflow", title: "Trigger to finish", description: "Map what happens today, including waiting and rework.", fields: [
        { id: "trigger-input", label: "Trigger and input", prompt: "What starts the workflow, where does it arrive, and what minimum information is needed?", kind: "long", required: true },
        { id: "steps-owners", label: "Steps and owners", prompt: "List each transformation, decision, approval, wait, and owner until completion.", kind: "long", required: true },
        { id: "finish-output", label: "Finish and output", prompt: "What proves the workflow finished successfully and who needs the result?", kind: "long", required: true },
        { id: "frequency-volume", label: "Frequency and volume", prompt: "How often does it run, how many items move through it, and when are the peaks?", kind: "long" },
      ] },
      { id: "rules", title: "Rules and exceptions", description: "Protect the decisions that should remain human and make failure recoverable.", fields: [
        { id: "deterministic-rules", label: "Deterministic rules", prompt: "Which decisions are explicit, repeatable, and safe to execute automatically?", kind: "long", required: true },
        { id: "human-review", label: "Human review", prompt: "Which pricing, commitment, quality, or unusual cases require approval?", kind: "long", required: true },
        { id: "failure-recovery", label: "Failure and recovery", prompt: "How should missing inputs, vendor outages, duplicates, retries, and partial completion appear?", kind: "long", required: true },
      ] },
      { id: "outcome", title: "Scope and outcome", description: "Choose a bounded automation that improves a real handoff.", fields: commonOutcomeFields },
      { id: "delivery", title: "Development handoff", description: "Confirm systems, access, testing, monitoring, and operational ownership.", fields: commonDeliveryFields },
    ],
    developmentGate: ["Trigger, successful finish, and idempotency behavior are explicit", "Rules and human approvals are separated", "Every vendor connection and permission is verified", "Normal, duplicate, timeout, retry, and manual recovery paths are testable", "Monitoring, exception ownership, and change control are assigned"],
  },
  {
    serviceSlug: "small-business-websites",
    objective: "Define one primary customer action and the complete operational handoff from visit to inquiry, order, custom request, or marketplace activity.",
    callPlan: ["Define the primary conversion or transaction", "Identify the best-fit visitor or seller", "Map their decision questions", "Design intake, purchase, and response paths", "Confirm content, catalog, proof, measurement, and launch ownership"],
    evidenceToRequest: ["Current site, store, catalog, and analytics access when available", "Real service or product descriptions, inventory rules, policies, and pricing context", "Approved photos, credentials, testimonials, and case evidence", "Recent inquiry or order examples and the actual follow-up or fulfillment process"],
    cautionSignals: ["No primary conversion or transaction is chosen", "Unverified claims or placeholder proof are treated as final", "Forms, orders, or seller activity end in an unowned queue", "Marketplace roles, commissions, payouts, moderation, tax, or fulfillment are assumed rather than assigned", "Search rankings, sales, or lead volume are expected to be guaranteed"],
    sections: [
      { id: "context", title: "Business context", description: "Identify the audience, offer, commerce model, and business reason for the site or marketplace.", fields: commonContextFields },
      { id: "conversion", title: "Visitor decision path", description: "Build around the next useful action or transaction, not a generic page list.", fields: [
        { id: "primary-conversion", label: "Primary conversion", prompt: "Should the right visitor call, book, request a quote, order, submit a custom request, apply as a seller, or take another specific action?", kind: "select", required: true, options: ["Phone call", "Appointment request", "Quote request", "Order or purchase", "Custom request", "Seller application", "Qualified contact", "Other"] },
        { id: "best-fit-customer", label: "Best-fit customer", prompt: "Who should recognize themselves immediately, which buyers or sellers are a fit, and which activity should be screened out?", kind: "long", required: true },
        { id: "decision-questions", label: "Decision questions", prompt: "What does a qualified prospect need to understand about fit, process, price, timing, and risk?", kind: "long", required: true },
        { id: "lead-handoff", label: "Operational handoff", prompt: "What happens after submission or purchase, who responds or fulfills, how quickly, and what information makes the activity useful?", kind: "long", required: true },
      ] },
      { id: "content", title: "Content and evidence", description: "Separate approved source material from content still needed.", fields: [
        { id: "content-inventory", label: "Available content", prompt: "List existing copy, product records, photos, logo files, service details, seller or purchase policies, locations, and FAQs.", kind: "long" },
        { id: "proof", label: "Approved proof", prompt: "Which testimonials, projects, credentials, metrics, or claims can be published and verified?", kind: "long", required: true },
        { id: "search-area", label: "Search and service area", prompt: "Which services and legitimate service areas should be described without fabricating locations?", kind: "long" },
      ] },
      { id: "outcome", title: "Scope and outcome", description: "Define the smallest complete site, storefront, or marketplace flow and its measurable customer action.", fields: commonOutcomeFields },
      { id: "delivery", title: "Development handoff", description: "Confirm domains, services, catalog and content approvals, integrations, measurement, and ownership.", fields: commonDeliveryFields },
    ],
    developmentGate: ["Primary conversion and best-fit visitor or seller are approved", "Page, catalog, and content inventory maps to real decision questions", "Every public claim, product record, and asset has an owner and approval state", "Form, cart, payment, notification, response, attribution, fulfillment, and failure paths are defined as applicable", "Marketplace roles, commissions, payouts, moderation, disputes, and tax ownership are explicit when multiple vendors are in scope", "Domain, analytics, search, accessibility, launch, and maintenance ownership are assigned"],
  },
  {
    serviceSlug: "cnc-signage-systems",
    objective: "Trace one product family from customer choices through approval, material readiness, fabrication, finishing, and delivery.",
    callPlan: ["Choose a representative product family", "Walk from inquiry through delivery", "Capture quote and approval rules", "Model material and production readiness", "Define floor interaction and validation limits"],
    evidenceToRequest: ["Recent quote, proof, revision, and job packet", "Material price lists, stock records, and yield assumptions", "Representative design/CAD/CAM file handoffs", "Examples of remakes, rush work, installation changes, and unusual materials"],
    cautionSignals: ["Custom work is described as fully formulaic when judgment is still required", "Proof approval is disconnected from the released production file", "Toolpaths or machine control are assumed without equipment-specific responsibility", "Shop-floor connectivity and device conditions are ignored"],
    sections: [
      { id: "context", title: "Product and shop context", description: "Choose a bounded class of work and the people responsible for it.", fields: commonContextFields },
      { id: "job-flow", title: "Quote to delivery", description: "Keep customer decisions connected to production requirements.", fields: [
        { id: "product-family", label: "Product family", prompt: "Which repeatable sign, panel, routed part, or fabricated product should be modeled first?", kind: "long", required: true },
        { id: "quote-inputs", label: "Quote inputs and judgment", prompt: "Which dimensions, materials, finishes, labor, setup, tooling, installation, and exception decisions affect price?", kind: "long", required: true },
        { id: "approval-record", label: "Approval record", prompt: "What exactly must be approved, by whom, and how are revisions tied to the released file?", kind: "long", required: true },
        { id: "production-stages", label: "Production stages", prompt: "List design, programming, material, cutting, fabrication, finishing, packing, delivery, and installation states.", kind: "long", required: true },
      ] },
      { id: "readiness", title: "Material and machine readiness", description: "Make prerequisites and exceptions visible before time is committed.", fields: [
        { id: "material-rules", label: "Material planning", prompt: "How are stock, purchasing, yield, offcuts, commitments, scrap, and substitutions decided?", kind: "long", required: true },
        { id: "file-handoff", label: "File handoff", prompt: "Which file types, naming, revisions, checks, posts, and signoffs exist between design and machine?", kind: "long" },
        { id: "floor-use", label: "Floor interaction", prompt: "Which devices, scanning, labels, gloves, dust, interruptions, and network conditions shape use?", kind: "long" },
      ] },
      { id: "outcome", title: "Scope and outcome", description: "Define a safe, testable first workflow for the selected product family.", fields: commonOutcomeFields },
      { id: "delivery", title: "Development handoff", description: "Confirm rules, responsibility, test cases, hardware, and rollout ownership.", fields: commonDeliveryFields },
    ],
    developmentGate: ["The first product family and its variation limits are explicit", "Quote rules distinguish formulas from judgment", "Approved proof, revision, material, and released file stay traceable", "Representative normal, rush, remake, and exception jobs form the test set", "Machine safety, post-processing, floor devices, fallback, and support responsibility are documented"],
  },
];

export function getConsultationPlaybook(slug: string | null | undefined) {
  return consultationPlaybooks.find((playbook) => playbook.serviceSlug === slug) ?? null;
}

export function getConsultationService(playbook: ConsultationPlaybook) {
  const service = getPublicService(playbook.serviceSlug);
  if (!service) throw new Error(`Missing public service for ${playbook.serviceSlug}`);
  return service;
}

export function consultationFieldCount(playbook: ConsultationPlaybook) {
  return playbook.sections.reduce((total, section) => total + section.fields.length, 0);
}
