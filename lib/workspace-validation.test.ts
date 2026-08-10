import { describe, expect, test } from "bun:test";
import { isWorkspaceData, normalizeWorkspace } from "@/lib/workspace-validation";

describe("workspace validation", () => {
  test("accepts legacy workspaces without reviews", () => expect(isWorkspaceData({ projects: [], tasks: [], activity: [] })).toBe(true));
  test("rejects incomplete data", () => expect(isWorkspaceData({ projects: [], tasks: [] })).toBe(false));
  test("normalizes optional collections and task priority", () => {
    const workspace = normalizeWorkspace({ projects: [], tasks: [{ id: "1", title: "Test", done: false, createdAt: "2026-08-09" }], activity: [] });
    expect(workspace.reviews).toEqual([]);
    expect(workspace.inbox).toEqual([]);
    expect(workspace.tasks[0].priority).toBe("Medium");
  });
});
