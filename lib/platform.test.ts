import { describe, expect, it } from "bun:test";
import { platformModules, rolePerspectives } from "./platform";

describe("Public Platform Architecture & Role Catalog", () => {
  it("defines core foundation modules and operational modules", () => {
    expect(platformModules.length).toBe(8);

    const core = platformModules.filter((m) => m.category === "core_foundation");
    const operational = platformModules.filter((m) => m.category === "operational_module");

    expect(core.length).toBe(2);
    expect(operational.length).toBe(6);

    for (const mod of platformModules) {
      expect(mod.name.length).toBeGreaterThan(3);
      expect(mod.summary.length).toBeGreaterThan(20);
      expect(mod.keyCapabilities.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("defines comprehensive role perspectives with focused visibility rules", () => {
    expect(rolePerspectives.length).toBe(5);

    for (const role of rolePerspectives) {
      expect(role.roleTitle.length).toBeGreaterThan(3);
      expect(role.operatingFocus.length).toBeGreaterThan(15);
      expect(role.interfaceView.length).toBeGreaterThan(20);
      expect(role.whatTheySee.length).toBeGreaterThanOrEqual(3);
      expect(role.whatIsHidden.length).toBeGreaterThan(10);
    }
  });
});
