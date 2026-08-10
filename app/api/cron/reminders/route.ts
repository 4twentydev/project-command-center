import { neon } from "@neondatabase/serverless";
import type { NextRequest } from "next/server";
import { sendPush, type StoredPushSubscription } from "@/lib/push";
import type { Workspace } from "@/lib/workspace";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.DATABASE_URL) return Response.json({ error: "Database unavailable" }, { status: 503 });
  const sql = neon(process.env.DATABASE_URL);
  const [workspaceRows, subscriptionRows] = await Promise.all([
    sql`SELECT data FROM workspaces WHERE id = 'primary' LIMIT 1`,
    sql`SELECT endpoint, subscription FROM push_subscriptions`,
  ]);
  if (!workspaceRows.length || !subscriptionRows.length) return Response.json({ ok: true, sent: 0, tasks: 0 });
  const workspace = workspaceRows[0].data as Workspace;
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: workspace.settings?.timezone ?? "America/Denver", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const due = workspace.tasks.filter((task) => !task.done && task.dueDate && task.dueDate <= today);
  if (!due.length) return Response.json({ ok: true, sent: 0, tasks: 0 });
  const overdue = due.filter((task) => task.dueDate && task.dueDate < today).length;
  const preview = due.slice(0, 3).map((task) => task.title).join(" · ");
  let sent = 0;
  await Promise.all(subscriptionRows.map(async (row) => {
    try {
      await sendPush(row.subscription as StoredPushSubscription, { title: overdue ? `${overdue} overdue · ${due.length} due` : `${due.length} task${due.length === 1 ? "" : "s"} due today`, body: preview, url: "/dashboard#tasks" });
      sent += 1;
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode;
      if (statusCode === 404 || statusCode === 410) await sql`DELETE FROM push_subscriptions WHERE endpoint = ${row.endpoint}`;
      else console.error("Reminder delivery failed", error);
    }
  }));
  return Response.json({ ok: true, sent, tasks: due.length, date: today });
}
