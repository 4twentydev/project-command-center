import { describe, expect, test } from "bun:test";
import {
  createOperationalContext,
  fetchWithTimeout,
  jsonWithRequestId,
  requestCorrelationId,
  sanitizedErrorCode,
  upstreamRateLimit,
  upstreamResponseStatus,
  withOperationTimeout,
} from "@/lib/operational-observability";

describe("operational observability", () => {
  test("uses trusted correlation headers and replaces malformed values", () => {
    expect(requestCorrelationId(new Headers({ "x-vercel-id": "cle1::iad1::abc-123" }))).toBe("cle1::iad1::abc-123");
    expect(requestCorrelationId(new Headers({ "x-request-id": "request_42" }))).toBe("request_42");
    expect(requestCorrelationId(new Headers({ "x-request-id": "secret value" }))).toMatch(/^[0-9a-f-]{36}$/);
  });

  test("writes structured lifecycle logs without serializing error details", async () => {
    const messages: string[] = [];
    const request = new Request("https://example.test/api/example", { headers: { "x-request-id": "request_42" } });
    const context = createOperationalContext(request, "/api/example", { info: (message) => messages.push(message), error: (message) => messages.push(message) });
    context.failed(503, new Error("postgres://user:secret@example.test/database"), { dependency: "database" });
    expect(messages).toHaveLength(2);
    expect(messages.join("\n")).not.toContain("secret");
    expect(JSON.parse(messages[1])).toMatchObject({ level: "error", event: "request.failed", route: "/api/example", requestId: "request_42", dependency: "database", errorCode: "internal_error", httpStatus: 503 });
    expect((await jsonWithRequestId(context, { ok: true })).headers.get("x-request-id")).toBe("request_42");
  });

  test("classifies upstream responses and exposes bounded rate-limit metadata", () => {
    const response = new Response(null, { status: 429, headers: { "x-ratelimit-limit": "5000", "x-ratelimit-remaining": "0", "x-ratelimit-reset": "1786819200", "retry-after": "60" } });
    expect(upstreamResponseStatus(response)).toBe("rate_limited");
    expect(upstreamRateLimit(response)).toEqual({ limit: 5000, remaining: 0, resetAt: "2026-08-15T18:40:00.000Z", retryAfterSeconds: 60 });
    expect(upstreamResponseStatus(new Response(null, { status: 403, headers: { "x-ratelimit-remaining": "0" } }))).toBe("rate_limited");
    expect(upstreamResponseStatus(new Response(null, { status: 401 }))).toBe("unauthorized");
  });

  test("bounds fetches and generic operations", async () => {
    const slowFetch = async (_input: RequestInfo | URL, init?: RequestInit) => {
      await new Promise((resolve) => setTimeout(resolve, 20));
      if (init?.signal?.aborted) throw init.signal.reason;
      return new Response(null, { status: 204 });
    };
    await expect(fetchWithTimeout("https://example.test", {}, 5, slowFetch)).rejects.toThrow();
    await expect(withOperationTimeout(new Promise(() => undefined), 5)).rejects.toThrow("Operation timed out");
    expect(sanitizedErrorCode(new DOMException("timed out", "TimeoutError"))).toBe("timeout");
    expect(sanitizedErrorCode({ code: "ECONNRESET", message: "credential" })).toBe("network_error");
  });
});
