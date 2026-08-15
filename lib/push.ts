import webpush from "web-push";
import { outboundRequestTimeoutMs } from "@/lib/operational-observability";

export type StoredPushSubscription = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) throw new Error("VAPID environment variables are not configured");
  webpush.setVapidDetails(subject, publicKey, privateKey);
  return webpush;
}

export async function sendPush(subscription: StoredPushSubscription, payload: { title: string; body: string; url?: string }) {
  return configureWebPush().sendNotification(subscription, JSON.stringify({ icon: "/icon", badge: "/icon", url: payload.url ?? "/#tasks", ...payload }), { timeout: outboundRequestTimeoutMs });
}
