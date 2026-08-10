import { describe, expect, test } from "bun:test";
import manifest from "@/app/manifest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { brand } from "@/lib/brand";
import { caseStudies, getCaseStudyStructuredData } from "@/lib/case-studies";
import { conversionEventNames } from "@/lib/conversion-analytics";
import { founderStructuredData, organizationStructuredData } from "@/lib/founder";
import { getServiceStructuredData, publicServices } from "@/lib/services";

describe("technical search foundations", () => {
  test("publishes every public route once and excludes owner routes", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls).toContain(`${brand.siteURL}/privacy`);
    for (const service of publicServices) expect(urls).toContain(`${brand.siteURL}/services/${service.slug}`);
    for (const study of caseStudies) expect(urls).toContain(`${brand.siteURL}/work/${study.slug}`);
    for (const path of ["/login", "/account", "/dashboard", "/api/"]) expect(urls.some((url) => url.includes(path))).toBe(false);
  });

  test("allows the public site and blocks private or machine routes", () => {
    const policy = robots();
    expect(policy.sitemap).toBe(`${brand.siteURL}/sitemap.xml`);
    expect(policy.host).toBe(brand.siteURL);
    expect(JSON.stringify(policy.rules)).toContain("/dashboard");
    expect(JSON.stringify(policy.rules)).toContain("/api/");
  });

  test("keeps install and structured data attached to the canonical brand", () => {
    expect(manifest().id).toBe("/");
    expect(organizationStructuredData["@type"]).toBe("Organization");
    expect(founderStructuredData["@graph"].some((item) => item["@type"] === "Person")).toBe(true);
    for (const service of publicServices) {
      const types = getServiceStructuredData(service)["@graph"].map((item) => item["@type"]);
      expect(types).toEqual(["Service", "FAQPage", "BreadcrumbList"]);
    }
    for (const study of caseStudies) expect(getCaseStudyStructuredData(study)["@graph"].map((item) => item["@type"])).toEqual(["CreativeWork", "BreadcrumbList"]);
  });
});

describe("lead-generation measurement", () => {
  test("supports every required public conversion event", () => {
    for (const event of ["service_page_view", "case_study_view", "workflow_audit_cta_click", "contact_form_start", "contact_form_submission", "email_link_click", "phone_link_click", "external_booking_link_click"] as const) {
      expect(conversionEventNames).toContain(event);
    }
  });
});
