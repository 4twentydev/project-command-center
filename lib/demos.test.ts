import { describe, expect, it } from "bun:test";
import { publicDemos } from "./demos";

describe("Public Demos Directory & Integration Contract", () => {
  it("defines all four canonical public demo scenarios", () => {
    expect(publicDemos.length).toBe(4);

    const slugs = publicDemos.map((d) => d.slug);
    expect(slugs).toContain("front-range-manufacturing");
    expect(slugs).toContain("summit-facility-services");
    expect(slugs).toContain("mile-high-signworks");
    expect(slugs).toContain("peak-mobile-detail");
  });

  it("ensures every demo points to canonical https://ops.yorkstead.com deep links", () => {
    for (const demo of publicDemos) {
      expect(demo.canonicalLaunchUrl).toBe(`https://ops.yorkstead.com/demo?scenario=${demo.slug}`);
      expect(demo.canonicalLaunchUrl.startsWith("https://ops.yorkstead.com/demo")).toBe(true);
    }
  });

  it("verifies operational problem and workflow steps are defined honestly for each demo", () => {
    for (const demo of publicDemos) {
      expect(demo.operationalProblem.length).toBeGreaterThan(20);
      expect(demo.solutionNarrative.length).toBeGreaterThan(20);
      expect(demo.workflowsShown.length).toBeGreaterThanOrEqual(3);
      expect(demo.metrics.length).toBeGreaterThanOrEqual(3);
      expect(demo.dataDisclaimer.toLowerCase()).toContain("synthetic");
    }
  });
});
