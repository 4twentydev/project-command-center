import { describe, expect, test } from "bun:test";
import { readVersionedWorkspace, saveVersionedWorkspace } from "@/lib/versioned-workspace-client";

type ExampleWorkspace = { title: string };

describe("versioned workspace synchronization", () => {
  test("preserves both tab copies through an explicit conflict decision", async () => {
    let cloud: ExampleWorkspace = { title: "Original" };
    let version = 1;
    const fetcher = async (_input: RequestInfo | URL, init?: RequestInit) => {
      if (!init?.method || init.method === "GET") return Response.json({ workspace: cloud, updatedAt: `v${version}` });
      const expected = new Headers(init.headers).get("x-workspace-version");
      if (expected !== `v${version}`) return Response.json({ error: "Conflict" }, { status: 409 });
      cloud = JSON.parse(String(init.body)) as ExampleWorkspace;
      version += 1;
      return Response.json({ ok: true, updatedAt: `v${version}` });
    };

    const tabALocal = { title: "Saved by tab A" };
    const tabBLocal = { title: "Unsaved in tab B" };
    expect(await saveVersionedWorkspace("/workspace", tabALocal, "v1", fetcher)).toEqual({ status: "saved", updatedAt: "v2" });
    expect(await saveVersionedWorkspace("/workspace", tabBLocal, "v1", fetcher)).toEqual({ status: "conflict" });

    const currentCloud = await readVersionedWorkspace("/workspace", (value) => value as ExampleWorkspace, fetcher);
    expect(currentCloud).toEqual({ status: "loaded", workspace: tabALocal, updatedAt: "v2" });
    expect(tabBLocal).toEqual({ title: "Unsaved in tab B" });

    expect(await saveVersionedWorkspace("/workspace", tabBLocal, "v2", fetcher)).toEqual({ status: "saved", updatedAt: "v3" });
    expect(cloud).toEqual(tabBLocal);
  });

  test("reports malformed reads and unavailable writes without throwing", async () => {
    expect(await readVersionedWorkspace("/workspace", () => null, async () => Response.json({ unexpected: true }))).toEqual({ status: "error" });
    expect(await saveVersionedWorkspace("/workspace", {}, null, async () => new Response(null, { status: 503 }))).toEqual({ status: "error" });
  });
});
