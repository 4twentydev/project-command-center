import { describe, expect, test } from "bun:test";
import { createWorkspaceSnapshotRequester, requestWorkspaceSnapshot } from "@/lib/workspace-snapshot-client";

describe("workspace snapshot requests", () => {
  test("returns the timestamp from a successful snapshot", async () => {
    expect(await requestWorkspaceSnapshot(async () => Response.json({ ok: true, createdAt: "2026-08-15T18:30:00.000Z" }))).toEqual({ status: "created", createdAt: "2026-08-15T18:30:00.000Z" });
  });

  test("distinguishes authentication, unsaved workspace, and storage failures", async () => {
    expect(await requestWorkspaceSnapshot(async () => new Response(null, { status: 401 }))).toEqual({ status: "authentication-required" });
    expect(await requestWorkspaceSnapshot(async () => Response.json({ error: "Save first" }, { status: 409 }))).toEqual({ status: "workspace-not-saved" });
    expect(await requestWorkspaceSnapshot(async () => Response.json({ error: "Unavailable" }, { status: 503 }))).toEqual({ status: "storage-unavailable" });
  });

  test("handles network failures and unexpected non-success statuses", async () => {
    expect(await requestWorkspaceSnapshot(async () => { throw new Error("offline"); })).toEqual({ status: "request-failed" });
    expect(await requestWorkspaceSnapshot(async () => new Response(null, { status: 429 }))).toEqual({ status: "request-failed" });
  });

  test("rejects malformed JSON and invalid success timestamps", async () => {
    expect(await requestWorkspaceSnapshot(async () => new Response("<html>upstream error</html>", { status: 200, headers: { "content-type": "text/html" } }))).toEqual({ status: "invalid-response" });
    expect(await requestWorkspaceSnapshot(async () => Response.json({ ok: true, createdAt: "not-a-date" }))).toEqual({ status: "invalid-response" });
  });

  test("shares one request while snapshot creation is already in flight", async () => {
    let requests = 0;
    let release: (() => void) | undefined;
    const blocker = new Promise<void>((resolve) => { release = resolve; });
    const requestSnapshot = createWorkspaceSnapshotRequester(async () => {
      requests += 1;
      await blocker;
      return Response.json({ createdAt: "2026-08-15T18:30:00.000Z" });
    });

    const first = requestSnapshot();
    const second = requestSnapshot();
    expect(first).toBe(second);
    expect(requests).toBe(1);
    release?.();
    await expect(first).resolves.toEqual({ status: "created", createdAt: "2026-08-15T18:30:00.000Z" });
  });
});
