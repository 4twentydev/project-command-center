import { describe, expect, test } from "bun:test";
import { applicationSecurityHeaders, contentSecurityPolicy } from "@/lib/security-headers";

function headerMap(environment: "development" | "production") {
  return new Map(applicationSecurityHeaders(environment).map(({ key, value }) => [key, value]));
}

describe("application security headers", () => {
  test("locks production browser capabilities and resource classes to the application", () => {
    const headers = headerMap("production");
    const policy = contentSecurityPolicy("production");

    for (const directive of [
      "default-src 'self'",
      "script-src-attr 'none'",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-src 'none'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ]) expect(policy).toContain(directive);
    expect(policy).not.toContain("'unsafe-eval'");
    expect(policy).not.toContain("https:");
    expect(policy).not.toContain(" wss:");
    expect(headers.get("Strict-Transport-Security")).toBe("max-age=63072000; includeSubDomains; preload");
    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("Cross-Origin-Opener-Policy")).toBe("same-origin");
  });

  test("keeps development tooling usable without weakening the production policy", () => {
    const headers = headerMap("development");
    const policy = contentSecurityPolicy("development");

    expect(policy).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval'");
    expect(policy).toContain("connect-src 'self' ws: wss:");
    expect(policy).not.toContain("upgrade-insecure-requests");
    expect(headers.has("Strict-Transport-Security")).toBe(false);
  });

  test("allows passkeys only for this origin and emits each header once", () => {
    const headers = applicationSecurityHeaders("production");
    const permissions = new Map(headers.map(({ key, value }) => [key, value])).get("Permissions-Policy");

    expect(permissions).toContain("publickey-credentials-create=(self)");
    expect(permissions).toContain("publickey-credentials-get=(self)");
    expect(new Set(headers.map(({ key }) => key)).size).toBe(headers.length);
  });
});
