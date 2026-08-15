import { describe, expect, test } from "bun:test";
import { hasStrongSecret, resolveAuthConfiguration } from "@/lib/auth-config";

const productionEnvironment = {
  BETTER_AUTH_URL: "https://www.4twenty.dev",
  DATABASE_URL: "postgresql://user:password@ep-example.us-east-2.aws.neon.tech/work_ctrl?sslmode=require",
  OWNER_EMAIL: "Owner@4twenty.dev",
  PASSKEY_RP_ID: "4twenty.dev",
  BETTER_AUTH_SECRET: "8f44d0c0f3dc40f9b587a9c47a9e35d77a66be9c518242de",
  OWNER_BOOTSTRAP_TOKEN: "d18bf69e0ab44f3ba77b4ce5e661c959db87b43cc69a4d1f",
};

describe("authentication configuration", () => {
  test("normalizes a complete production configuration", () => {
    expect(resolveAuthConfiguration(productionEnvironment, "production")).toEqual({
      baseURL: "https://www.4twenty.dev",
      databaseURL: productionEnvironment.DATABASE_URL,
      ownerEmail: "owner@4twenty.dev",
      relyingPartyId: "4twenty.dev",
      secret: productionEnvironment.BETTER_AUTH_SECRET,
      bootstrapToken: productionEnvironment.OWNER_BOOTSTRAP_TOKEN,
    });
  });

  test("preserves local development defaults without weakening production", () => {
    const configuration = resolveAuthConfiguration({}, "development");
    expect(configuration.baseURL).toBe("http://localhost:3000");
    expect(configuration.relyingPartyId).toBe("localhost");
    expect(configuration.bootstrapToken).toBeUndefined();
    expect(() => resolveAuthConfiguration({}, "production")).toThrow("BETTER_AUTH_URL must be configured in production");
  });

  test("requires a strong production secret and optional bootstrap token", () => {
    for (const secret of ["short", "a".repeat(64), "replace-with-at-least-32-random-characters", "correct horse battery staple correct horse"]) {
      expect(hasStrongSecret(secret)).toBeFalse();
      expect(() => resolveAuthConfiguration({ ...productionEnvironment, BETTER_AUTH_SECRET: secret }, "production")).toThrow("BETTER_AUTH_SECRET");
    }
    expect(hasStrongSecret(productionEnvironment.BETTER_AUTH_SECRET)).toBeTrue();
    expect(() => resolveAuthConfiguration({ ...productionEnvironment, OWNER_BOOTSTRAP_TOKEN: "bootstrap-secret" }, "production")).toThrow("OWNER_BOOTSTRAP_TOKEN");
  });

  test("requires an HTTPS production origin without URL decorations", () => {
    for (const baseURL of ["http://www.4twenty.dev", "https://user:pass@www.4twenty.dev", "https://www.4twenty.dev/auth", "https://www.4twenty.dev:8443"]) {
      expect(() => resolveAuthConfiguration({ ...productionEnvironment, BETTER_AUTH_URL: baseURL }, "production")).toThrow("BETTER_AUTH_URL");
    }
  });

  test("requires the passkey relying party to match the authentication domain", () => {
    expect(() => resolveAuthConfiguration({ ...productionEnvironment, PASSKEY_RP_ID: "example.com" }, "production")).toThrow("PASSKEY_RP_ID");
    expect(() => resolveAuthConfiguration({ ...productionEnvironment, PASSKEY_RP_ID: "dev" }, "production")).toThrow("registrable domain");
    expect(resolveAuthConfiguration({ ...productionEnvironment, PASSKEY_RP_ID: "www.4twenty.dev" }, "production").relyingPartyId).toBe("www.4twenty.dev");
  });

  test("validates owner identity and PostgreSQL configuration", () => {
    expect(() => resolveAuthConfiguration({ ...productionEnvironment, OWNER_EMAIL: "owner@localhost" }, "production")).toThrow("OWNER_EMAIL");
    expect(() => resolveAuthConfiguration({ ...productionEnvironment, DATABASE_URL: "https://database.example.com/work_ctrl" }, "production")).toThrow("DATABASE_URL");
  });
});
