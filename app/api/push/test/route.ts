import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { sendPush, type StoredPushSubscription } from "@/lib/push";

export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
    const { endpoint } = await request.json() as { endpoint?: string };
    if (!endpoint) return NextResponse.json({ error: "Endpoint is required" }, { status: 400 });
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`SELECT subscription FROM push_subscriptions WHERE endpoint = ${endpoint} LIMIT 1`;
    if (!rows.length) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    await sendPush(rows[0].subscription as StoredPushSubscription, { title: "WORK//CTRL is online", body: "Daily task reminders are enabled on this device." });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Test notification failed", error);
    return NextResponse.json({ error: "Test notification failed" }, { status: 503 });
  }
}
