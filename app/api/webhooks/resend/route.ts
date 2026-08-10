import { Resend } from "resend";
import { contactDatabase, type NotificationStatus } from "@/lib/contact-inquiries";

export const runtime = "nodejs";

const trackedEvents = new Map<string, NotificationStatus>([
  ["email.sent", "sent"], ["email.delivered", "delivered"], ["email.bounced", "bounced"],
  ["email.complained", "complained"], ["email.failed", "failed"], ["email.suppressed", "failed"],
]);

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (!apiKey || !webhookSecret) return new Response("Webhook not configured", { status: 503 });
  const payload = await request.text();
  const id = request.headers.get("svix-id");
  const timestamp = request.headers.get("svix-timestamp");
  const signature = request.headers.get("svix-signature");
  if (!id || !timestamp || !signature) return new Response("Missing signature", { status: 400 });
  try {
    const event = new Resend(apiKey).webhooks.verify({ payload, headers: { id, timestamp, signature }, webhookSecret });
    const status = trackedEvents.get(event.type);
    if (status && "email_id" in event.data) {
      const sql = await contactDatabase();
      await sql`UPDATE contact_inquiries SET notification_status = ${status}, updated_at = NOW() WHERE notification_id = ${event.data.email_id}`;
    }
    return Response.json({ received: true });
  } catch (error) {
    console.error("Invalid Resend webhook", error);
    return new Response("Invalid signature", { status: 400 });
  }
}
