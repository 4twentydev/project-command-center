import { neon } from "@neondatabase/serverless";
import type { NextRequest } from "next/server";
import { archivedInquiryPurgeBefore, workspaceSnapshotRetentionCount } from "@/lib/data-retention";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.DATABASE_URL) return Response.json({ error: "Database unavailable" }, { status: 503 });

  try {
    const sql = neon(process.env.DATABASE_URL);
    const purgeBefore = archivedInquiryPurgeBefore().toISOString();
    const [inquiries, snapshots] = await Promise.all([
      sql`DELETE FROM contact_inquiries WHERE status = 'archived' AND archived_at < ${purgeBefore}::timestamptz RETURNING id`,
      sql`
        DELETE FROM workspace_snapshots
        WHERE id IN (
          SELECT id FROM workspace_snapshots
          WHERE workspace_id = 'primary'
          ORDER BY created_at DESC, id DESC
          OFFSET ${workspaceSnapshotRetentionCount}
        )
        RETURNING id
      `,
    ]);
    return Response.json({ ok: true, inquiriesPurged: inquiries.length, snapshotsPurged: snapshots.length });
  } catch (error) {
    console.error("Data retention failed", error);
    return Response.json({ error: "Data retention is unavailable" }, { status: 503 });
  }
}
