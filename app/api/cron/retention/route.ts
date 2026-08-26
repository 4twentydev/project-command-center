import type { NextRequest } from "next/server";
import { createOperationalContext, jsonWithRequestId } from "@/lib/operational-observability";
import { runRetentionJob } from "@/lib/scheduled-jobs";

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
    const result = await runRetentionJob();
    context.completed(200, { status: "ok", itemCount: result.inquiriesPurged + result.snapshotsPurged });
    return jsonWithRequestId(context, result);
  } catch (error) {
    context.failed(503, error, { dependency: "database", operation: "data_retention" });
    return jsonWithRequestId(context, { error: "Data retention is unavailable" }, { status: 503 });
  }
}
