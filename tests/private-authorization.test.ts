import { afterAll, beforeAll, describe, expect, mock, test } from "bun:test";
import { emptyMarketingWorkspace } from "@/lib/marketing-workspace";
import { emptyWorkspace } from "@/lib/workspace";

let authorizationChecks = 0;
let ownerAuthorized = false;
const sqlCalls: unknown[][] = [];
let marketingExpectedVersion: string | null | undefined;
const previousDatabaseURL = process.env.DATABASE_URL;

mock.module("@/lib/owner-session", () => ({
  getOwnerSession: async () => ownerAuthorized ? { user: { email: "owner@example.test" } } : null,
  requireOwner: async () => {
    authorizationChecks += 1;
    return ownerAuthorized ? null : Response.json({ error: "Unauthorized" }, { status: 401 });
  },
}));

mock.module("next/headers", () => ({ headers: async () => new Headers() }));
mock.module("next/cache", () => ({ revalidatePath: () => undefined }));
mock.module("@neondatabase/serverless", () => ({
  neon: () => async (_strings: TemplateStringsArray, ...values: unknown[]) => {
    sqlCalls.push(values);
    return [];
  },
}));
mock.module("@/lib/marketing-storage", () => ({
  getMarketingWorkspace: async () => ({ workspace: emptyMarketingWorkspace, updatedAt: "cloud-version" }),
  saveMarketingWorkspace: async (_workspace: unknown, expectedVersion: string | null | undefined) => {
    marketingExpectedVersion = expectedVersion;
    return null;
  },
}));

type Handler = (request: Request) => Promise<Response>;
type PrivateRoute = { name: string; method: string; handler: Handler };

const routes: PrivateRoute[] = [];
let leadActions: Array<{ name: string; action: (formData: FormData) => Promise<void> }> = [];
let workspacePut: Handler;
let marketingPut: Handler;

beforeAll(async () => {
  process.env.DATABASE_URL = "postgres://test.invalid/database";
  const workspace = await import("@/app/api/workspace/route");
  const marketing = await import("@/app/api/marketing-workspace/route");
  const consultations = await import("@/app/api/consultations/route");
  const projectImport = await import("@/app/api/project-import/route");
  const projectStatus = await import("@/app/api/project-status/route");
  const pushSubscription = await import("@/app/api/push/subscription/route");
  const pushTest = await import("@/app/api/push/test/route");
  workspacePut = workspace.PUT;
  marketingPut = marketing.PUT;
  routes.push(
    { name: "workspace read", method: "GET", handler: workspace.GET },
    { name: "workspace snapshot", method: "POST", handler: workspace.POST },
    { name: "workspace restore", method: "PATCH", handler: workspace.PATCH },
    { name: "workspace write", method: "PUT", handler: workspace.PUT },
    { name: "marketing read", method: "GET", handler: marketing.GET },
    { name: "marketing write", method: "PUT", handler: marketing.PUT },
    { name: "consultation create", method: "POST", handler: consultations.POST },
    { name: "consultation update", method: "PUT", handler: consultations.PUT },
    { name: "consultation delete", method: "DELETE", handler: consultations.DELETE },
    { name: "project import", method: "GET", handler: projectImport.GET },
    { name: "project status", method: "GET", handler: projectStatus.GET as Handler },
    { name: "push subscription create", method: "POST", handler: pushSubscription.POST },
    { name: "push subscription delete", method: "DELETE", handler: pushSubscription.DELETE },
    { name: "push test", method: "POST", handler: pushTest.POST },
  );

  const leads = await import("@/app/actions/leads");
  leadActions = [
    { name: "update lead status", action: leads.updateLeadStatus },
    { name: "save lead details", action: leads.saveLeadDetails },
    { name: "convert lead to project", action: leads.convertLeadToProject },
  ];
});

afterAll(() => {
  process.env.DATABASE_URL = previousDatabaseURL;
});

describe("private API authorization", () => {
  test("every private handler rejects before parsing a body or opening storage", async () => {
    ownerAuthorized = false;
    const checksBefore = authorizationChecks;
    for (const route of routes) {
      const response = await route.handler(new Request(`https://example.test/api/${encodeURIComponent(route.name)}`, { method: route.method }));
      expect(response.status, route.name).toBe(401);
      expect(await response.json(), route.name).toEqual({ error: "Unauthorized" });
    }
    expect(authorizationChecks - checksBefore).toBe(routes.length);
  });
});

describe("private Server Action authorization", () => {
  test("every owner-only lead mutation rejects before validating or writing", async () => {
    ownerAuthorized = false;
    for (const item of leadActions) {
      await expect(item.action(new FormData()), item.name).rejects.toThrow("Unauthorized");
    }
  });
});

describe("optimistic concurrency routes", () => {
  test("workspace write returns 409 when the expected database version no longer exists", async () => {
    ownerAuthorized = true;
    const expectedVersion = "2026-08-15T18:30:00.000Z";
    const response = await workspacePut(new Request("https://example.test/api/workspace", {
      method: "PUT",
      headers: { "content-type": "application/json", "x-workspace-version": expectedVersion },
      body: JSON.stringify(emptyWorkspace),
    }));
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: "Workspace changed in another session" });
    expect(sqlCalls.some((values) => values.includes(expectedVersion))).toBe(true);
  });

  test("marketing write passes the expected version to storage and returns 409 on conflict", async () => {
    ownerAuthorized = true;
    const expectedVersion = "2026-08-15T18:45:00.000Z";
    const response = await marketingPut(new Request("https://example.test/api/marketing-workspace", {
      method: "PUT",
      headers: { "content-type": "application/json", "x-workspace-version": expectedVersion },
      body: JSON.stringify(emptyMarketingWorkspace),
    }));
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: "Marketing workspace changed in another session" });
    expect(marketingExpectedVersion).toBe(expectedVersion);
  });
});
