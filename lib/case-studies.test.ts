import { describe, expect, test } from "bun:test";
import { caseStudies, getAdjacentCaseStudies, getCaseStudy } from "@/lib/case-studies";
import { projectStatusDefinitions, projectStatuses } from "@/lib/project-status";

describe("case study data", () => {
  test("defines the initial selected-work routes", () => {
    expect(caseStudies.map((study) => study.slug)).toEqual(["work-control", "signforge", "shop-inventory"]);
    expect(caseStudies.every((study) => Boolean(getCaseStudy(study.slug)))).toBeTrue();
  });

  test("assigns an explicit, supported status to every current project", () => {
    expect(Object.fromEntries(caseStudies.map((study) => [study.title, study.status]))).toEqual({
      "WORK//CTRL": "Live system",
      SignForge: "Active concept",
      "Shop Inventory": "Working prototype",
    });
    expect(projectStatuses).toEqual(["Live system", "Working prototype", "Active concept", "Case study"]);
    expect(caseStudies.every((study) => Boolean(projectStatusDefinitions[study.status]))).toBeTrue();
    expect(caseStudies.some((study) => study.status === "Case study")).toBeFalse();
  });

  test("provides every required case-study section", () => {
    for (const study of caseStudies) {
      expect(study.problem.length).toBeGreaterThan(20);
      expect(study.intendedFor.length).toBeGreaterThan(20);
      expect(study.previousWorkflow.length).toBeGreaterThan(20);
      expect(study.solution.length).toBeGreaterThan(20);
      expect(study.capabilities.length).toBeGreaterThan(2);
      expect(study.technologies.length).toBeGreaterThan(1);
      expect(study.outcome.length).toBeGreaterThan(20);
      expect(study.limitations.length).toBeGreaterThan(20);
      expect(study.cta.href).toBe("/#contact");
    }
  });

  test("labels non-live results as intended outcomes", () => {
    for (const study of caseStudies.filter((item) => item.status !== "Live system")) {
      expect(study.outcomeLabel).toBe("Intended outcome");
      expect(study.outcome.toLowerCase()).toContain("intended outcome");
      expect(study.limitations.toLowerCase()).toMatch(/prototype|concept/);
    }
  });

  test("links each study to distinct adjacent studies", () => {
    for (const study of caseStudies) {
      const adjacent = getAdjacentCaseStudies(study.slug);
      expect(adjacent.previous?.slug).not.toBe(study.slug);
      expect(adjacent.next?.slug).not.toBe(study.slug);
    }
  });
});
