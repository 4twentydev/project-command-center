export type EngagementId = "workflow-audit" | "workflow-sprint" | "custom-operations-system";

export type Engagement = {
  id: EngagementId;
  title: string;
  priceLabel: string;
  summary: string;
  timing: string;
  includes: readonly string[];
  cta: { label: string; href: string };
};

export const engagements = [
  {
    id: "workflow-audit",
    title: "Workflow Audit",
    priceLabel: "Starting at $350",
    summary: "A focused evaluation when the operating problem is visible but the right fix is not yet clear.",
    timing: "Focused review and prioritized handoff",
    includes: [
      "Workflow interview or walkthrough",
      "Bottleneck analysis",
      "Recommended solution",
      "Rough implementation range",
      "Audit fee credited toward an approved build when appropriate",
    ],
    cta: { label: "Book a workflow audit", href: "/workflow-audit#audit-intake" },
  },
  {
    id: "workflow-sprint",
    title: "Workflow Sprint",
    priceLabel: "Typically $1,500–$3,500",
    summary: "One tightly scoped operational improvement taken from friction to a usable result.",
    timing: "Approximately one to two weeks",
    includes: [
      "One defined workflow and clear finish line",
      "Examples include a quote calculator, intake flow, packing-list generator, inventory scanner, dashboard, scheduling flow, or spreadsheet conversion",
      "Focused implementation, review, and handoff",
    ],
    cta: { label: "Scope a workflow sprint", href: "/?engagement=workflow-sprint#contact" },
  },
  {
    id: "custom-operations-system",
    title: "Custom Operations System",
    priceLabel: "Typically starting at $5,000",
    summary: "A connected system for multiple operational workflows that need to work as one.",
    timing: "Scope and delivery plan established after discovery",
    includes: [
      "May involve quoting, inventory, production tracking, scheduling, customer communication, or reporting",
      "Final pricing depends on scope, integrations, data migration, and support requirements",
      "Phased delivery when that reduces operating risk",
    ],
    cta: { label: "Discuss a custom system", href: "/?engagement=custom-operations-system#contact" },
  },
] as const satisfies readonly Engagement[];

export const engagementPlanningNote = "These are planning ranges, not automatic quotes. Final scope, price, timing, integrations, migration, and support are confirmed before work begins.";
export const workflowAuditEngagement = engagements[0];

export function getEngagement(id: string | null | undefined) {
  return engagements.find((engagement) => engagement.id === id) ?? null;
}
