import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import type { StoredPushSubscription } from "@/lib/push";
import { requireOwner } from "@/lib/owner-session";

function sqlClient() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  return neon(process.env.DATABASE_URL);
}

async function ensureTable() {
  const sql = sqlClient();
  await sql`CREATE TABLE IF NOT EXISTS push_subscriptions (endpoint TEXT PRIMARY KEY, subscription JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  return sql;
}

function validSubscription(value: unknown): value is StoredPushSubscription {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<StoredPushSubscription>;
  return typeof item.endpoint === "string" && typeof item.keys?.p256dh === "string" && typeof item.keys?.auth === "string";
}

export async function POST(request: Request) {
  const unauthorized = await requireOwner(request.headers);
  if (unauthorized) return unauthorized;
  try {
    const subscription: unknown = await request.json();
    if (!validSubscription(subscription)) return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    const sql = await ensureTable();
    const serialized = JSON.stringify(subscription);
    await sql`INSERT INTO push_subscriptions (endpoint, subscription, updated_at) VALUES (${subscription.endpoint}, ${serialized}::jsonb, NOW()) ON CONFLICT (endpoint) DO UPDATE SET subscription = EXCLUDED.subscription, updated_at = NOW()`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Push subscription save failed", error);
    return NextResponse.json({ error: "Subscription could not be saved" }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  const unauthorized = await requireOwner(request.headers);
  if (unauthorized) return unauthorized;
  try {
    const body = await request.json() as { endpoint?: string };
    if (!body.endpoint) return NextResponse.json({ error: "Endpoint is required" }, { status: 400 });
    const sql = await ensureTable();
    await sql`DELETE FROM push_subscriptions WHERE endpoint = ${body.endpoint}`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Push subscription removal failed", error);
    return NextResponse.json({ error: "Subscription could not be removed" }, { status: 503 });
  }
}
