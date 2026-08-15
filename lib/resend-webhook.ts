import type { NotificationStatus } from "@/lib/contact-inquiries";

const trackedEvents = new Map<string, NotificationStatus>([
  ["email.sent", "sent"],
  ["email.delivered", "delivered"],
  ["email.bounced", "bounced"],
  ["email.complained", "complained"],
  ["email.failed", "failed"],
  ["email.suppressed", "failed"],
]);

export function notificationStatusForResendEvent(eventType: string) {
  return trackedEvents.get(eventType) ?? null;
}
