import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks = { database: false, vapid: Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY), cron: Boolean(process.env.CRON_SECRET) };
  try {
    if (process.env.DATABASE_URL) { const sql = neon(process.env.DATABASE_URL); await sql`SELECT 1`; checks.database = true; }
  } catch { /* Health response reports the failed dependency. */ }
  const healthy = checks.database;
  return Response.json({ status: healthy ? "ok" : "degraded", checks, checkedAt: new Date().toISOString() }, { status: healthy ? 200 : 503 });
}
