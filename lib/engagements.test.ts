import { describe, expect, test } from "bun:test";
import { engagementPlanningNote, engagements, getEngagement } from "@/lib/engagements";

describe("public engagement offers", () => {
  test("keeps the three planning offers in one typed catalog", () => {
    expect(engagements.map(({ id, priceLabel }) => ({ id, priceLabel }))).toEqual([
      { id: "workflow-audit", priceLabel: "Starting at $350" },
      { id: "workflow-sprint", priceLabel: "Typically $1,500–$3,500" },
      { id: "custom-operations-system", priceLabel: "Typically starting at $5,000" },
    ]);
    expect(engagementPlanningNote).toContain("planning ranges, not automatic quotes");
  });

  test("connects every offer to the appropriate qualification path", () => {
    expect(getEngagement("workflow-audit")?.cta.href).toBe("/workflow-audit#audit-intake");
    expect(getEngagement("workflow-sprint")?.cta.href).toBe("/?engagement=workflow-sprint#contact");
    expect(getEngagement("custom-operations-system")?.cta.href).toBe("/?engagement=custom-operations-system#contact");
  });

  test("only accepts known engagement preselection values", () => {
    expect(getEngagement("workflow-sprint")?.title).toBe("Workflow Sprint");
    expect(getEngagement("something-made-up")).toBeNull();
    expect(getEngagement(null)).toBeNull();
  });
});
