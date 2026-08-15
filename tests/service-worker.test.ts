import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

type Listener = (event: {
  request: { method: string; url: string; mode: string };
  respondWith: (response: Promise<unknown>) => void;
  waitUntil: (work: Promise<unknown>) => void;
}) => void;

function serviceWorkerHarness() {
  const listeners = new Map<string, Listener>();
  const cacheWrites: string[] = [];
  const self = {
    location: { origin: "https://example.test" },
    addEventListener: (name: string, listener: Listener) => listeners.set(name, listener),
    skipWaiting: async () => undefined,
    clients: { claim: async () => undefined, matchAll: async () => [], openWindow: async () => undefined },
    registration: { showNotification: async () => undefined },
  };
  const caches = {
    open: async () => ({
      addAll: async () => undefined,
      put: async (request: { url: string }) => { cacheWrites.push(new URL(request.url).pathname); },
    }),
    keys: async () => [],
    delete: async () => true,
    match: async () => undefined,
  };
  const fetcher = async () => ({ ok: true, type: "basic", clone() { return this; } });
  const source = readFileSync(join(process.cwd(), "public", "sw.js"), "utf8");
  new Function("self", "caches", "fetch", source)(self, caches, fetcher);

  async function dispatchFetch(pathname: string) {
    let response: Promise<unknown> | null = null;
    const background: Promise<unknown>[] = [];
    listeners.get("fetch")?.({
      request: { method: "GET", mode: "navigate", url: `https://example.test${pathname}` },
      respondWith: (value) => { response = value; },
      waitUntil: (value) => { background.push(value); },
    });
    if (response) await response;
    await Promise.all(background);
    return response !== null;
  }

  return { cacheWrites, dispatchFetch };
}

describe("service-worker cache isolation", () => {
  test("never intercepts or caches private dashboard and API navigation", async () => {
    const worker = serviceWorkerHarness();
    expect(await worker.dispatchFetch("/api/workspace")).toBe(false);
    expect(await worker.dispatchFetch("/dashboard")).toBe(false);
    expect(await worker.dispatchFetch("/dashboard/leads")).toBe(false);
    expect(worker.cacheWrites).toEqual([]);
  });

  test("continues to cache explicitly public navigation", async () => {
    const worker = serviceWorkerHarness();
    expect(await worker.dispatchFetch("/about")).toBe(true);
    expect(await worker.dispatchFetch("/services/workflow-automation")).toBe(true);
    expect(worker.cacheWrites).toEqual(["/about", "/services/workflow-automation"]);
  });
});
