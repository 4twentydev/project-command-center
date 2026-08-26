import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Netlify scheduled job deployment contract", () => {
  const root = resolve(import.meta.dir, "..");
  const config = readFileSync(resolve(root, "netlify.toml"), "utf8");

  test("deploys both daily jobs through the production hosting provider", () => {
    expect(config).toContain("[functions.reminders]");
    expect(config).toContain('schedule = "0 14 * * *"');
    expect(config).toContain("[functions.retention]");
    expect(config).toContain('schedule = "30 14 * * *"');
    expect(existsSync(resolve(root, "netlify/functions/reminders.mts"))).toBe(true);
    expect(existsSync(resolve(root, "netlify/functions/retention.mts"))).toBe(true);
  });

  test("does not retain an inactive Vercel scheduler declaration", () => {
    expect(existsSync(resolve(root, "vercel.json"))).toBe(false);
  });
});
