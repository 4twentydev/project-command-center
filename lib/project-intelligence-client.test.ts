import { describe, expect, test } from "bun:test";
import { fetchProjectIntelligence, markProjectIntelligenceRefreshing, mergeProjectIntelligenceResults, parseProjectIntelligence, type ProjectIntelligence } from "@/lib/project-intelligence-client";

const intelligence = (fetchedAt = "2026-08-15T18:30:00.000Z"): ProjectIntelligence => ({
  github: { available: true, latestCommit: { sha: "abc1234", message: "Ship it", url: "https://github.com/example/repo/commit/abc1234" }, pullRequests: [], issues: [] },
  vercel: { reachable: true, state: "READY", url: "example.vercel.app", checkedAt: fetchedAt },
  integrations: { github: { status: "ok", authenticated: true }, vercel: { status: "ok", authenticated: true } },
  fetchedAt,
});

describe("project intelligence refresh", () => {
  test("builds the request and validates a successful payload", async () => {
    let requested = "";
    const result = await fetchProjectIntelligence({ id: "one", repo: "https://github.com/example/repo", deployment: "https://example.vercel.app" }, async (input) => {
      requested = String(input);
      return Response.json(intelligence());
    });
    expect(requested).toContain("repo=https%3A%2F%2Fgithub.com%2Fexample%2Frepo");
    expect(requested).toContain("deployment=https%3A%2F%2Fexample.vercel.app");
    expect(result.github?.available).toBe(true);
  });

  test("rejects failed and malformed responses", async () => {
    await expect(fetchProjectIntelligence({ id: "one", repo: "https://github.com/example/repo" }, async () => new Response(null, { status: 503 }))).rejects.toThrow();
    await expect(fetchProjectIntelligence({ id: "one", repo: "https://github.com/example/repo" }, async () => Response.json({ github: { pullRequests: "invalid" }, fetchedAt: "today" }))).rejects.toThrow();
    expect(parseProjectIntelligence({ github: null, vercel: null, fetchedAt: "not-a-date" })).toBeNull();
    expect(parseProjectIntelligence({ github: null, vercel: null, integrations: { github: { status: "mystery", authenticated: false }, vercel: { status: "ok", authenticated: true } }, fetchedAt: new Date().toISOString() })).toBeNull();
  });

  test("retains last-known data for failed projects while accepting successful siblings", () => {
    const previous = intelligence("2026-08-15T17:00:00.000Z");
    const current = { failed: { data: previous, status: "fresh" as const } };
    expect(markProjectIntelligenceRefreshing(current, ["failed", "new"])).toEqual({ failed: { data: previous, status: "refreshing" }, new: { status: "refreshing" } });

    const updated = intelligence();
    const merged = mergeProjectIntelligenceResults(current, ["failed", "successful", "new"], [
      { status: "rejected", reason: new Error("offline") },
      { status: "fulfilled", value: updated },
      { status: "rejected", reason: new Error("unavailable") },
    ]);
    expect(merged.failed).toEqual({ data: previous, status: "stale" });
    expect(merged.successful).toEqual({ data: updated, status: "fresh" });
    expect(merged.new).toEqual({ status: "error" });
  });

  test("marks partial upstream results as degraded instead of fresh", () => {
    const partial = intelligence();
    partial.integrations.github = { status: "rate_limited", authenticated: true, rateLimit: { remaining: 0, retryAfterSeconds: 60 } };
    const merged = mergeProjectIntelligenceResults({}, ["partial"], [{ status: "fulfilled", value: partial }]);
    expect(merged.partial).toEqual({ data: partial, status: "degraded" });
  });
});
