import { describe, expect, it } from "bun:test";
import { publicSolutions } from "./solutions";

describe("Public Solutions & Capabilities Catalog", () => {
  it("defines all five core operational solution outcomes", () => {
    expect(publicSolutions.length).toBe(5);

    const slugs = publicSolutions.map((s) => s.slug);
    expect(slugs).toContain("quoting-and-estimating");
    expect(slugs).toContain("shopfloor-and-traveler-control");
    expect(slugs).toContain("field-service-and-mobile-operations");
    expect(slugs).toContain("inventory-and-material-ledger");
    expect(slugs).toContain("packaging-and-shipping-logistics");
  });

  it("ensures every solution has actionable composable capabilities and diagnostic focus", () => {
    for (const sol of publicSolutions) {
      expect(sol.coreProblem.length).toBeGreaterThan(20);
      expect(sol.howWeSolveIt.length).toBeGreaterThan(20);
      expect(sol.composableCapabilities.length).toBeGreaterThanOrEqual(3);
      expect(sol.diagnosticFocus).toContain("audit");
      if (sol.demoUrl) {
        expect(sol.demoUrl.startsWith("https://ops.yorkstead.com/demo")).toBe(true);
      }
    }
  });
});
