import { neon } from "@neondatabase/serverless";
import type { NextRequest } from "next/server";
import { createOperationalContext, jsonWithRequestId, withOperationTimeout } from "@/lib/operational-observability";
import { sendPush, type StoredPushSubscription } from "@/lib/push";
import { createReminderPlan, deliverReminderNotifications } from "@/lib/reminder-delivery";
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
    const plan = createReminderPlan(workspace);
    if (!plan) {
      context.completed(200, { status: "ok", itemCount: 0 });
      return jsonWithRequestId(context, { ok: true, sent: 0, failed: 0, tasks: 0 });
    }
    const { sent, failed, removed } = await deliverReminderNotifications(
      subscriptionRows.map((row) => ({ endpoint: String(row.endpoint), subscription: row.subscription as StoredPushSubscription })),
      plan.notification,
      { send: sendPush, remove: (endpoint) => withOperationTimeout(sql`DELETE FROM push_subscriptions WHERE endpoint = ${endpoint}`) },
    );
    context.completed(200, { status: failed ? "partial" : "ok", itemCount: sent });
    return jsonWithRequestId(context, { ok: failed === 0, sent, failed, removed, tasks: plan.taskCount, date: plan.date });
  } catch (error) {
    context.failed(503, error, { dependency: "database", operation: "daily_reminders" });
    return jsonWithRequestId(context, { error: "Reminder processing is temporarily unavailable" }, { status: 503 });
  }
}
