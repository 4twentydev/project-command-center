import { neon } from "@neondatabase/serverless";
import { createOperationalContext, jsonWithRequestId, withOperationTimeout } from "@/lib/operational-observability";
import { requireOwner } from "@/lib/owner-session";
import type { StoredPushSubscription } from "@/lib/push";

function sqlClient() {
  if (!process.env.DATABASE_URL) throw new Error("Database is unavailable");
  return neon(process.env.DATABASE_URL);
}

function validSubscription(value: unknown): value is StoredPushSubscription {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<StoredPushSubscription>;
  return typeof item.endpoint === "string" && typeof item.keys?.p256dh === "string" && typeof item.keys?.auth === "string";
}

async function authorize(request: Request, context: ReturnType<typeof createOperationalContext>) {
  const unauthorized = await requireOwner(request.headers);
  if (unauthorized) {
    unauthorized.headers.set("x-request-id", context.requestId);
    context.completed(unauthorized.status, { status: "unauthorized" });
  }
  return unauthorized;
}

export async function POST(request: Request) {
  const context = createOperationalContext(request, "/api/push/subscription");
  const unauthorized = await authorize(request, context);
  if (unauthorized) return unauthorized;
  try {
    const subscription: unknown = await request.json();
    if (!validSubscription(subscription)) {
      context.completed(400, { status: "invalid_request" });
      return jsonWithRequestId(context, { error: "Invalid subscription" }, { status: 400 });
    }
    const sql = sqlClient();
    const serialized = JSON.stringify(subscription);
    await withOperationTimeout(sql`INSERT INTO push_subscriptions (endpoint, subscription, updated_at) VALUES (${subscription.endpoint}, ${serialized}::jsonb, NOW()) ON CONFLICT (endpoint) DO UPDATE SET subscription = EXCLUDED.subscription, updated_at = NOW()`);
    context.completed(200, { status: "ok" });
    return jsonWithRequestId(context, { ok: true });
  } catch (error) {
    context.failed(503, error, { dependency: "database", operation: "save_push_subscription" });
    return jsonWithRequestId(context, { error: "Subscription could not be saved" }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  const context = createOperationalContext(request, "/api/push/subscription");
  const unauthorized = await authorize(request, context);
  if (unauthorized) return unauthorized;
  try {
    const body = await request.json() as { endpoint?: string };
    if (!body.endpoint) {
      context.completed(400, { status: "invalid_request" });
      return jsonWithRequestId(context, { error: "Endpoint is required" }, { status: 400 });
    }
    const sql = sqlClient();
    await withOperationTimeout(sql`DELETE FROM push_subscriptions WHERE endpoint = ${body.endpoint}`);
    context.completed(200, { status: "ok" });
    return jsonWithRequestId(context, { ok: true });
  } catch (error) {
    context.failed(503, error, { dependency: "database", operation: "remove_push_subscription" });
    return jsonWithRequestId(context, { error: "Subscription could not be removed" }, { status: 503 });
  }
}
