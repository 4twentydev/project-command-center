import { describe, expect, test } from "bun:test";
import { isWorkspaceData, normalizeWorkspace } from "@/lib/workspace-validation";

describe("workspace validation", () => {
  test("accepts legacy workspaces without reviews", () => expect(isWorkspaceData({ projects: [], tasks: [], activity: [] })).toBe(true));
  test("rejects incomplete data", () => expect(isWorkspaceData({ projects: [], tasks: [] })).toBe(false));
  test("rejects envelopes whose collections contain no valid records", () => {
    const normalized = normalizeWorkspace({ projects: [null], tasks: [{ nope: true }], activity: [null] });
    expect(normalized.projects).toEqual([]);
    expect(normalized.tasks).toEqual([]);
    expect(normalized.activity).toEqual([]);
  });
  test("sanitizes project URLs, progress, and orphan relations", () => {
    const normalized = normalizeWorkspace({
      projects: [{ id: "p1", name: "Project", status: "unknown", kind: "unknown", progress: 999, accent: "unknown", repo: "javascript:alert(1)", stack: ["Next.js", 4] }],
      tasks: [{ id: "t1", title: "Task", projectId: "missing", done: false, createdAt: "bad" }],
      activity: [], notes: [{ id: "n1", projectId: "missing", type: "Note", content: "orphan" }],
    });
    expect(normalized.projects[0].status).toBe("Planning");
    expect(normalized.projects[0].progress).toBe(100);
    expect(normalized.projects[0].repo).toBeUndefined();
    expect(normalized.tasks[0].projectId).toBeUndefined();
    expect(normalized.notes).toEqual([]);
  });
  test("requires HTTPS project links and impossible calendar dates", () => {
    const normalized = normalizeWorkspace({
      projects: [{ id: "p1", name: "Project", repo: "http://example.com/repo", deployment: "https://example.com/app" }],
      tasks: [{ id: "t1", title: "Impossible", dueDate: "2026-02-30", done: false, createdAt: "2026-02-30T12:00:00.000Z" }],
      activity: [],
    });
    expect(normalized.projects[0].repo).toBeUndefined();
    expect(normalized.projects[0].deployment).toBe("https://example.com/app");
    expect(normalized.tasks[0].dueDate).toBeUndefined();
    expect(normalized.tasks[0].createdAt.startsWith("2026-02-30")).toBeFalse();
  });
  test("keeps the first valid record for duplicate collection identifiers", () => {
    const normalized = normalizeWorkspace({
      projects: [{ id: "p1", name: "First" }, { id: "p1", name: "Second" }],
      tasks: [{ id: "t1", title: "First", done: false }, { id: "t1", title: "Second", done: false }],
      activity: [{ id: "a1", message: "First" }, { id: "a1", message: "Second" }],
      reviews: [{ id: "r1", wins: "First" }, { id: "r1", wins: "Second" }],
      inbox: [{ id: "i1", text: "First" }, { id: "i1", text: "Second" }],
      notes: [{ id: "n1", projectId: "p1", content: "First" }, { id: "n1", projectId: "p1", content: "Second" }],
    });
    expect(normalized.projects.map((item) => item.name)).toEqual(["First"]);
    expect(normalized.tasks.map((item) => item.title)).toEqual(["First"]);
    expect(normalized.activity.map((item) => item.message)).toEqual(["First"]);
    expect(normalized.reviews?.map((item) => item.wins)).toEqual(["First"]);
    expect(normalized.inbox?.map((item) => item.text)).toEqual(["First"]);
    expect(normalized.notes?.map((item) => item.content)).toEqual(["First"]);
  });
  test("normalizes optional collections and task priority", () => {
    const workspace = normalizeWorkspace({ projects: [], tasks: [{ id: "1", title: "Test", done: false, createdAt: "2026-08-09" }], activity: [] });
    expect(workspace.reviews).toEqual([]);
    expect(workspace.inbox).toEqual([]);
    expect(workspace.settings?.timezone).toBe("America/Denver");
    expect(workspace.notes).toEqual([]);
    expect(workspace.tasks[0].priority).toBe("Medium");
  });
  test("accepts valid IANA timezones and replaces invalid imported values", () => {
    expect(normalizeWorkspace({ projects: [], tasks: [], activity: [], settings: { timezone: "Asia/Tokyo" } }).settings?.timezone).toBe("Asia/Tokyo");
    expect(normalizeWorkspace({ projects: [], tasks: [], activity: [], settings: { timezone: "Not/A_Zone" } }).settings?.timezone).toBe("America/Denver");
  });
});
