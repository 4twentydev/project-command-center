import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

export async function GET() {
  let database = false;
  try {
    if (process.env.DATABASE_URL) { const sql = neon(process.env.DATABASE_URL); await sql`SELECT 1`; database = true; }
  } catch { /* Health response reports the failed dependency. */ }
  return Response.json(
    { status: database ? "ok" : "degraded", checkedAt: new Date().toISOString() },
    { status: database ? 200 : 503, headers: { "Cache-Control": "private, no-store" } },
  );
}
