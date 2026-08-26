import { describe, expect, it } from "bun:test";
import { publicLabExperiments } from "./labs";

describe("Yorkstead Labs Catalog & Truth Rules", () => {
  it("defines all four exploratory lab experiments and spikes", () => {
    expect(publicLabExperiments.length).toBe(4);

    const slugs = publicLabExperiments.map((e) => e.slug);
    expect(slugs).toContain("sic-pizza-pos");
    expect(slugs).toContain("shop-inventory-allocation");
    expect(slugs).toContain("iot-telemetry-bridge");
    expect(slugs).toContain("offline-pwa-sync-engine");
  });

  it("ensures every lab experiment honestly discloses purpose, hypothesis, and limitations", () => {
    for (const exp of publicLabExperiments) {
      expect(exp.purpose.length).toBeGreaterThan(20);
      expect(exp.operationalHypothesis.length).toBeGreaterThan(20);
      expect(exp.limitations.length).toBeGreaterThan(20);
      expect(exp.dataSource.length).toBeGreaterThan(10);
      expect(exp.findings.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("supports archived spikes with proper status and interaction descriptions", () => {
    const archived = publicLabExperiments.filter((e) => e.status === "archived");
    expect(archived.length).toBeGreaterThanOrEqual(1);

    for (const arch of archived) {
      expect(arch.maturity).toBe("Archived Spike");
      expect(arch.interactionType).toBe("Read-only archive");
    }
  });
});
