import { describe, expect, test } from "bun:test";
import { caseStudies } from "@/lib/case-studies";
import { getPublicService, getServiceContactHref, getServiceStructuredData, publicServices } from "@/lib/services";

describe("public service pages", () => {
  test("defines the four intended static routes with the primary specialties first", () => {
    expect(publicServices.map(({ slug }) => slug)).toEqual(["manufacturing-software", "workflow-automation", "small-business-websites", "cnc-signage-systems"]);
    expect(publicServices.map(({ primary }) => primary)).toEqual([true, true, false, false]);
  });

  test("promotes commerce and marketplace delivery through the website service", () => {
    const service = getPublicService("small-business-websites");
    expect(service?.name).toBe("Websites & Online Marketplaces");
    expect(service?.caseStudyLinks.some(({ slug }) => slug === "jwld-store")).toBeTrue();
    expect(service?.deliverables.join(" ").toLowerCase()).toContain("marketplace");
    expect(service?.faqs.some(({ question }) => question.toLowerCase().includes("marketplace"))).toBeTrue();
  });

  test("keeps each service page complete and genuinely distinct", () => {
    expect(new Set(publicServices.map(({ headline }) => headline)).size).toBe(4);
    expect(new Set(publicServices.map(({ summary }) => summary)).size).toBe(4);
    for (const service of publicServices) {
      expect(service.targetCustomer.length).toBeGreaterThan(60);
      expect(service.problems.length).toBeGreaterThanOrEqual(4);
      expect(service.deliverables.length).toBeGreaterThanOrEqual(6);
      expect(service.process.length).toBeGreaterThanOrEqual(5);
      expect(service.faqs.length).toBeGreaterThanOrEqual(4);
      expect(service.typicalEngagement.label).toContain("$");
      expect(service.typicalEngagement.note).toContain("Planning range only");
      expect(service.futureCaseStudies.length).toBeGreaterThanOrEqual(3);
    }
  });

  test("references only honest, existing project profiles", () => {
    const projectSlugs = new Set(caseStudies.map(({ slug }) => slug));
    for (const service of publicServices) {
      expect(service.caseStudyLinks.length).toBeGreaterThan(0);
      for (const reference of service.caseStudyLinks) {
        expect(projectSlugs.has(reference.slug)).toBe(true);
        expect(reference.relevance.length).toBeGreaterThan(50);
      }
    }
  });

  test("attributes every contact path to a service and engagement", () => {
    expect(new Set(publicServices.map(({ contactProjectType }) => contactProjectType)).size).toBe(4);
    for (const service of publicServices) {
      expect(String(service.cta.href)).toBe(getServiceContactHref(service));
      expect(service.cta.href).toContain(`service=${service.slug}`);
      expect(service.cta.href).toContain(`engagement=${service.defaultEngagementId}`);
    }
  });

  test("builds canonical Service, FAQ, and breadcrumb structured data", () => {
    for (const service of publicServices) {
      const data = getServiceStructuredData(service);
      expect(data["@graph"].map((item) => item["@type"])).toEqual(["Service", "FAQPage", "BreadcrumbList"]);
      expect(JSON.stringify(data)).toContain(`https://www.4twenty.dev/services/${service.slug}`);
      expect(getPublicService(service.slug)?.name).toBe(service.name);
    }
    expect(getPublicService("not-a-service")).toBeNull();
  });
});
