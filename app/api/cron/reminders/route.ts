import { neon } from "@neondatabase/serverless";
import type { NextRequest } from "next/server";
import { dateKeyInTimeZone } from "@/lib/date-time";
import { createOperationalContext, jsonWithRequestId, withOperationTimeout } from "@/lib/operational-observability";
import { sendPush, type StoredPushSubscription } from "@/lib/push";
import { parseWorkspace } from "@/lib/workspace-validation";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const context = createOperationalContext(request, "/api/cron/reminders");
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    context.completed(401, { status: "unauthorized" });
    return jsonWithRequestId(context, { error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.DATABASE_URL) {
    context.failed(503, { code: "database_unavailable" }, { dependency: "database" });
    return jsonWithRequestId(context, { error: "Database unavailable" }, { status: 503 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const [workspaceRows, subscriptionRows] = await withOperationTimeout(Promise.all([
      sql`SELECT data FROM workspaces WHERE id = 'primary' LIMIT 1`,
      sql`SELECT endpoint, subscription FROM push_subscriptions`,
    ]));
    if (!workspaceRows.length || !subscriptionRows.length) {
      context.completed(200, { status: "ok", itemCount: 0 });
      return jsonWithRequestId(context, { ok: true, sent: 0, failed: 0, tasks: 0 });
    }
    const workspace = parseWorkspace(workspaceRows[0].data);
    if (!workspace) {
      context.failed(503, { code: "invalid_workspace" }, { dependency: "database" });
      return jsonWithRequestId(context, { error: "Workspace data is invalid" }, { status: 503 });
    }
    const today = dateKeyInTimeZone(new Date(), workspace.settings?.timezone);
    const due = workspace.tasks.filter((task) => !task.done && task.dueDate && task.dueDate <= today);
    if (!due.length) {
      context.completed(200, { status: "ok", itemCount: 0 });
      return jsonWithRequestId(context, { ok: true, sent: 0, failed: 0, tasks: 0, date: today });
    }
    const overdue = due.filter((task) => task.dueDate && task.dueDate < today).length;
    const preview = due.slice(0, 3).map((task) => task.title).join(" · ");
    const outcomes = await Promise.all(subscriptionRows.map(async (row) => {
      try {
        await sendPush(row.subscription as StoredPushSubscription, { title: overdue ? `${overdue} overdue · ${due.length} due` : `${due.length} task${due.length === 1 ? "" : "s"} due today`, body: preview, url: "/dashboard#tasks" });
        return "sent" as const;
      } catch (error) {
        const statusCode = Number((error as { statusCode?: unknown }).statusCode);
        if (statusCode === 404 || statusCode === 410) {
          await withOperationTimeout(sql`DELETE FROM push_subscriptions WHERE endpoint = ${row.endpoint}`);
          return "removed" as const;
        }
        return "failed" as const;
      }
    }));
    const sent = outcomes.filter((outcome) => outcome === "sent").length;
    const failed = outcomes.filter((outcome) => outcome === "failed").length;
    const removed = outcomes.filter((outcome) => outcome === "removed").length;
    context.completed(200, { status: failed ? "partial" : "ok", itemCount: sent });
    return jsonWithRequestId(context, { ok: failed === 0, sent, failed, removed, tasks: due.length, date: today });
  } catch (error) {
    context.failed(503, error, { dependency: "database", operation: "daily_reminders" });
    return jsonWithRequestId(context, { error: "Reminder processing is temporarily unavailable" }, { status: 503 });
  }
}
