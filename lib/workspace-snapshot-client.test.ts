import { describe, expect, test } from "bun:test";
import { createWorkspaceSnapshotRequester, requestWorkspaceSnapshot, requestWorkspaceSnapshotRestore } from "@/lib/workspace-snapshot-client";

describe("workspace snapshot requests", () => {
  test("returns the timestamp from a successful snapshot", async () => {
    expect(await requestWorkspaceSnapshot(async () => Response.json({ ok: true, id: "42", createdAt: "2026-08-15T18:30:00.000Z" }))).toEqual({ status: "created", id: "42", createdAt: "2026-08-15T18:30:00.000Z" });
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
    expect(await requestWorkspaceSnapshot(async () => Response.json({ ok: true, id: "42", createdAt: "not-a-date" }))).toEqual({ status: "invalid-response" });
    expect(await requestWorkspaceSnapshot(async () => Response.json({ ok: true, createdAt: "2026-08-15T18:30:00.000Z" }))).toEqual({ status: "invalid-response" });
  });

  test("shares one request while snapshot creation is already in flight", async () => {
    let requests = 0;
    let release: (() => void) | undefined;
    const blocker = new Promise<void>((resolve) => { release = resolve; });
    const requestSnapshot = createWorkspaceSnapshotRequester(async () => {
      requests += 1;
      await blocker;
      return Response.json({ id: "42", createdAt: "2026-08-15T18:30:00.000Z" });
    });

    const first = requestSnapshot();
    const second = requestSnapshot();
    expect(first).toBe(second);
    expect(requests).toBe(1);
    release?.();
    await expect(first).resolves.toEqual({ status: "created", id: "42", createdAt: "2026-08-15T18:30:00.000Z" });
  });

  test("restores a snapshot and returns the replacement workspace version", async () => {
    const calls: Array<{ input: RequestInfo | URL; init?: RequestInit }> = [];
    const workspace = { projects: [], tasks: [], activity: [] };
    const result = await requestWorkspaceSnapshotRestore("42", async (input, init) => {
      calls.push({ input, init });
      return Response.json({ workspace, updatedAt: "2026-08-15T19:00:00.000Z", safetySnapshot: { id: "43", createdAt: "2026-08-15T18:59:59.000Z" } });
    });
    expect(result).toEqual({ status: "restored", workspace, updatedAt: "2026-08-15T19:00:00.000Z", safetySnapshot: { id: "43", createdAt: "2026-08-15T18:59:59.000Z" } });
    expect(calls).toHaveLength(1);
    expect(calls[0]?.input).toBe("/api/workspace");
    expect(calls[0]?.init?.method).toBe("PATCH");
    expect(JSON.parse(String(calls[0]?.init?.body))).toEqual({ snapshotId: "42" });
  });

  test("distinguishes restore failures and malformed success payloads", async () => {
    expect(await requestWorkspaceSnapshotRestore("42", async () => new Response(null, { status: 401 }))).toEqual({ status: "authentication-required" });
    expect(await requestWorkspaceSnapshotRestore("42", async () => new Response(null, { status: 404 }))).toEqual({ status: "snapshot-not-found" });
    expect(await requestWorkspaceSnapshotRestore("42", async () => new Response(null, { status: 409 }))).toEqual({ status: "snapshot-not-restorable" });
    expect(await requestWorkspaceSnapshotRestore("42", async () => new Response(null, { status: 503 }))).toEqual({ status: "storage-unavailable" });
    expect(await requestWorkspaceSnapshotRestore("42", async () => Response.json({ workspace: {}, updatedAt: "invalid" }))).toEqual({ status: "invalid-response" });
  });
});
