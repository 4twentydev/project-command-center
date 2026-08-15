import { dateKeyInTimeZone } from "@/lib/date-time";
import type { StoredPushSubscription } from "@/lib/push";
import type { Workspace } from "@/lib/workspace";

export type ReminderPlan = {
  date: string;
  taskCount: number;
  notification: { title: string; body: string; url: string };
};

export type ReminderSubscription = { endpoint: string; subscription: StoredPushSubscription };

export function createReminderPlan(workspace: Workspace, now = new Date()): ReminderPlan | null {
  const date = dateKeyInTimeZone(now, workspace.settings?.timezone);
  const due = workspace.tasks.filter((task) => !task.done && task.dueDate && task.dueDate <= date);
  if (!due.length) return null;
  const overdue = due.filter((task) => task.dueDate && task.dueDate < date).length;
  return {
    date,
    taskCount: due.length,
    notification: {
      title: overdue ? `${overdue} overdue · ${due.length} due` : `${due.length} task${due.length === 1 ? "" : "s"} due today`,
      body: due.slice(0, 3).map((task) => task.title).join(" · "),
      url: "/dashboard#tasks",
    },
  };
}

export async function deliverReminderNotifications(
  subscriptions: ReminderSubscription[],
  notification: ReminderPlan["notification"],
  dependencies: {
    send: (subscription: StoredPushSubscription, notification: ReminderPlan["notification"]) => Promise<unknown>;
    remove: (endpoint: string) => Promise<unknown>;
  },
) {
  const outcomes = await Promise.all(subscriptions.map(async ({ endpoint, subscription }) => {
    try {
      await dependencies.send(subscription, notification);
      return "sent" as const;
    } catch (error) {
      const statusCode = Number((error as { statusCode?: unknown }).statusCode);
      if (statusCode === 404 || statusCode === 410) {
        await dependencies.remove(endpoint);
        return "removed" as const;
      }
      return "failed" as const;
    }
  }));
  return {
    sent: outcomes.filter((outcome) => outcome === "sent").length,
    failed: outcomes.filter((outcome) => outcome === "failed").length,
    removed: outcomes.filter((outcome) => outcome === "removed").length,
  };
}
