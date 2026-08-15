import { neon } from "@neondatabase/serverless";
import type { NextRequest } from "next/server";
import { archivedInquiryPurgeBefore, workspaceSnapshotRetentionCount } from "@/lib/data-retention";
import { createOperationalContext, jsonWithRequestId, withOperationTimeout } from "@/lib/operational-observability";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const context = createOperationalContext(request, "/api/cron/retention");
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    context.completed(401, { status: "unauthorized" });
    return jsonWithRequestId(context, { error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.DATABASE_URL) {
    context.failed(503, { code: "database_unavailable" }, { dependency: "database" });
    return jsonWithRequestId(context, { error: "Database unavailable" }, { status: 503 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const purgeBefore = archivedInquiryPurgeBefore().toISOString();
    const [inquiries, snapshots] = await withOperationTimeout(Promise.all([
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
    ]));
    context.completed(200, { status: "ok", itemCount: inquiries.length + snapshots.length });
    return jsonWithRequestId(context, { ok: true, inquiriesPurged: inquiries.length, snapshotsPurged: snapshots.length });
  } catch (error) {
    context.failed(503, error, { dependency: "database", operation: "data_retention" });
    return jsonWithRequestId(context, { error: "Data retention is unavailable" }, { status: 503 });
  }
}
