import { neon } from "@neondatabase/serverless";
import { createOperationalContext, jsonWithRequestId, withOperationTimeout } from "@/lib/operational-observability";
import { requireOwner } from "@/lib/owner-session";
import { sendPush, type StoredPushSubscription } from "@/lib/push";

export async function POST(request: Request) {
  const context = createOperationalContext(request, "/api/push/test");
  const unauthorized = await requireOwner(request.headers);
  if (unauthorized) {
    unauthorized.headers.set("x-request-id", context.requestId);
    context.completed(unauthorized.status, { status: "unauthorized" });
    return unauthorized;
  }
  try {
    if (!process.env.DATABASE_URL) throw new Error("Database is unavailable");
    const { endpoint } = await request.json() as { endpoint?: string };
    if (!endpoint) {
      context.completed(400, { status: "invalid_request" });
      return jsonWithRequestId(context, { error: "Endpoint is required" }, { status: 400 });
    }
    const sql = neon(process.env.DATABASE_URL);
    const rows = await withOperationTimeout(sql`SELECT subscription FROM push_subscriptions WHERE endpoint = ${endpoint} LIMIT 1`);
    if (!rows.length) {
      context.completed(404, { status: "not_found" });
      return jsonWithRequestId(context, { error: "Subscription not found" }, { status: 404 });
    }
    await sendPush(rows[0].subscription as StoredPushSubscription, { title: "WORK//CTRL is online", body: "Daily task reminders are enabled on this device." });
    context.completed(200, { status: "ok" });
    return jsonWithRequestId(context, { ok: true });
  } catch (error) {
    context.failed(503, error, { dependency: "push", operation: "test_notification" });
    return jsonWithRequestId(context, { error: "Test notification failed" }, { status: 503 });
  }
}
