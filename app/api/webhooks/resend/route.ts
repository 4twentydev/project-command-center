import { Resend } from "resend";
import { contactDatabase } from "@/lib/contact-inquiries";
import { createOperationalContext, jsonWithRequestId, withOperationTimeout } from "@/lib/operational-observability";
import { readRequestTextWithLimit } from "@/lib/request-body";
import { notificationStatusForResendEvent } from "@/lib/resend-webhook";

export const runtime = "nodejs";

const webhookBodyLimit = 256_000;
export async function POST(request: Request) {
  const context = createOperationalContext(request, "/api/webhooks/resend");
  const apiKey = process.env.RESEND_API_KEY;
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (!apiKey || !webhookSecret) {
    context.failed(503, { code: "not_configured" }, { dependency: "resend" });
    return jsonWithRequestId(context, { error: "Webhook not configured" }, { status: 503 });
  }
  const body = await readRequestTextWithLimit(request, webhookBodyLimit);
  if (!body.ok) {
    context.completed(413, { status: "body_too_large" });
    return jsonWithRequestId(context, { error: "Webhook payload is too large" }, { status: 413 });
  }
  const id = request.headers.get("svix-id");
  const timestamp = request.headers.get("svix-timestamp");
  const signature = request.headers.get("svix-signature");
  if (!id || !timestamp || !signature) {
    context.completed(400, { status: "missing_signature" });
    return jsonWithRequestId(context, { error: "Missing signature" }, { status: 400 });
  }

  let event: ReturnType<Resend["webhooks"]["verify"]>;
  try {
    event = new Resend(apiKey).webhooks.verify({ payload: body.value, headers: { id, timestamp, signature }, webhookSecret });
  } catch (error) {
    context.failed(400, error, { dependency: "resend", operation: "verify_webhook" });
    return jsonWithRequestId(context, { error: "Invalid signature" }, { status: 400 });
  }

  try {
    const status = notificationStatusForResendEvent(event.type);
    if (status && "email_id" in event.data) {
      const sql = await contactDatabase();
      await withOperationTimeout(sql`UPDATE contact_inquiries SET notification_status = ${status}, updated_at = NOW() WHERE notification_id = ${event.data.email_id}`);
    }
    context.completed(200, { status: "ok" });
    return jsonWithRequestId(context, { received: true });
  } catch (error) {
    context.failed(503, error, { dependency: "database", operation: "record_email_status" });
    return jsonWithRequestId(context, { error: "Webhook status could not be recorded" }, { status: 503 });
  }
}
