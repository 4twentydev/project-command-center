import { describe, expect, test } from "bun:test";
import { createReminderPlan, deliverReminderNotifications, type ReminderSubscription } from "@/lib/reminder-delivery";
import { defaultWorkspaceSettings, emptyWorkspace, type Workspace } from "@/lib/workspace";

const subscription = (endpoint: string): ReminderSubscription => ({ endpoint, subscription: { endpoint, keys: { p256dh: "key", auth: "auth" } } });

describe("reminder cron delivery", () => {
  test("plans due work using the configured civil date across a UTC rollover", () => {
    const workspace: Workspace = { ...emptyWorkspace, settings: { ...defaultWorkspaceSettings, timezone: "America/Denver" }, tasks: [
      { id: "due", title: "Due today", done: false, dueDate: "2026-08-15", createdAt: "2026-08-14T12:00:00.000Z" },
      { id: "future", title: "Tomorrow", done: false, dueDate: "2026-08-16", createdAt: "2026-08-14T12:00:00.000Z" },
      { id: "done", title: "Already done", done: true, dueDate: "2026-08-15", createdAt: "2026-08-14T12:00:00.000Z" },
    ] };
    const plan = createReminderPlan(workspace, new Date("2026-08-16T01:00:00.000Z"));
    expect(plan).toEqual({ date: "2026-08-15", taskCount: 1, notification: { title: "1 task due today", body: "Due today", url: "/dashboard#tasks" } });
  });

  test("removes expired subscriptions while preserving partial delivery results", async () => {
    const removed: string[] = [];
    const result = await deliverReminderNotifications(
      [subscription("sent"), subscription("expired"), subscription("failed")],
      { title: "One task", body: "Ship it", url: "/dashboard#tasks" },
      {
        send: async (item) => {
          if (item.endpoint === "expired") throw { statusCode: 410 };
          if (item.endpoint === "failed") throw new Error("offline");
        },
        remove: async (endpoint) => { removed.push(endpoint); },
      },
    );
    expect(result).toEqual({ sent: 1, failed: 1, removed: 1 });
    expect(removed).toEqual(["expired"]);
  });
});
