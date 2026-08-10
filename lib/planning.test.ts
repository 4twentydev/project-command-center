import { describe, expect, test } from "bun:test";
import { selectFocusTasks, selectTasksForView } from "@/lib/planning";
import type { Task } from "@/lib/workspace";

const task = (id: string, overrides: Partial<Task> = {}): Task => ({ id, title: id, done: false, createdAt: "2026-08-01T00:00:00.000Z", priority: "Medium", ...overrides });

describe("planning rules", () => {
  test("focus puts earlier deadlines first and then priority", () => {
    const result = selectFocusTasks([task("later", { dueDate: "2026-08-20", priority: "High" }), task("low", { dueDate: "2026-08-10", priority: "Low" }), task("high", { dueDate: "2026-08-10", priority: "High" })]);
    expect(result.map((item) => item.id)).toEqual(["high", "low", "later"]);
  });

  test("today includes overdue but excludes completed tasks", () => {
    const result = selectTasksForView([task("overdue", { dueDate: "2026-08-08" }), task("today", { dueDate: "2026-08-09" }), task("future", { dueDate: "2026-08-10" }), task("done", { dueDate: "2026-08-09", done: true })], "Today", "2026-08-09");
    expect(result.map((item) => item.id)).toEqual(["overdue", "today"]);
  });

  test("next includes undated and future open work", () => {
    const result = selectTasksForView([task("undated"), task("future", { dueDate: "2026-08-10" }), task("overdue", { dueDate: "2026-08-08" })], "Next", "2026-08-09");
    expect(result.map((item) => item.id).sort()).toEqual(["future", "undated"]);
  });
});
