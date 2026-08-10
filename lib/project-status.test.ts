import { describe, expect, test } from "bun:test";
import { projectStatusDefinitions } from "@/lib/project-status";

describe("public project statuses", () => {
  test("uses the approved definitions", () => {
    expect(projectStatusDefinitions["Live system"].description).toBe("Implemented and currently operational");
    expect(projectStatusDefinitions["Working prototype"].description).toBe("Functional enough to demonstrate or test");
    expect(projectStatusDefinitions["Active concept"].description).toBe("Defined product or workflow still under development");
    expect(projectStatusDefinitions["Case study"].description).toBe("Completed work supported by real evidence");
  });

  test("gives every status a distinct visual treatment", () => {
    const styles = Object.values(projectStatusDefinitions).map((definition) => definition.className);
    expect(new Set(styles).size).toBe(styles.length);
  });
});
