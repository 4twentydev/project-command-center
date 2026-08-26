import { describe, expect, test } from "bun:test";
import { founder, founderExperience, founderStructuredData } from "@/lib/founder";

describe("public founder profile", () => {
  test("uses the approved founder identity and verified experience areas", () => {
    expect(founder.name).toBe("Brandon York");
    expect(founderExperience).toEqual([
      "Manufacturing and production management",
      "CNC operation and digital fabrication",
      "Exterior architectural panel production",
      "Inventory, shipping, packaging, and shop-floor workflows",
      "Operational metrics and process improvement",
      "Custom software, web applications, and automation",
      "Translating real production problems into usable systems",
    ]);
  });

  test("documents the expected portrait without claiming a placeholder is Brandon", () => {
    expect(founder.portrait.publicPath).toBe("/media/founder/brandon-york.jpg");
    expect(founder.portrait.aspectRatio).toBe("4:5");
    expect([founder.portrait.sourceWidth, founder.portrait.sourceHeight]).toEqual([853, 1280]);
  });

  test("connects Person and Organization structured data without invented credentials", () => {
    const [person, organization] = founderStructuredData["@graph"];
    expect(person["@type"]).toBe("Person");
    expect(person.name).toBe("Brandon York");
    expect(person.image).toBe("https://yorkstead.com/media/founder/brandon-york.jpg");
    expect(organization["@type"]).toBe("Organization");
    expect(organization.founder["@id"]).toBe(person["@id"]);
    expect(JSON.stringify(founderStructuredData)).not.toMatch(/employer|award|alumniOf|credential/i);
  });
});
