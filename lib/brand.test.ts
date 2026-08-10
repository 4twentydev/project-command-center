import { describe, expect, test } from "bun:test";
import manifest from "@/app/manifest";
import { brand } from "@/lib/brand";
import { founderStructuredData } from "@/lib/founder";
import { getServiceStructuredData, publicServices } from "@/lib/services";

describe("public brand positioning", () => {
  test("makes the software and automation category explicit", () => {
    expect(brand.descriptor).toBe("Industrial software and workflow automation");
    expect(brand.positioning.toLowerCase()).toContain("software");
    expect(brand.positioning.toLowerCase()).toContain("automation");
    expect(brand.audienceLine.toLowerCase()).toContain("manufacturers");
    expect(brand.socialTitle.startsWith(brand.name)).toBe(true);
  });

  test("keeps the identity clear of cannabis category language", () => {
    const identity = JSON.stringify(brand).toLowerCase();
    for (const term of ["cannabis", "marijuana", "dispensary", "weed", "hemp", "leaf"]) expect(identity).not.toContain(term);
  });

  test("uses the public brand in the install manifest and structured data", () => {
    const appManifest = manifest();
    expect(appManifest.name).toContain(brand.descriptor);
    expect(appManifest.short_name).toBe(brand.name);
    expect(appManifest.description).toBe(brand.positioning);
    const organization = founderStructuredData["@graph"].find((item) => item["@type"] === "Organization");
    expect(organization?.description).toBe(brand.positioning);
    expect(organization?.email).toBe(brand.email);
    for (const service of publicServices) expect(JSON.stringify(getServiceStructuredData(service))).toContain(brand.name);
  });
});
