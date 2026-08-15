import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { parseWorkspace } from "@/lib/workspace-validation";
import { requireOwner } from "@/lib/owner-session";
import { readRequestTextWithLimit } from "@/lib/request-body";
import { workspaceSnapshotHistoryCount, workspaceSnapshotRetentionCount } from "@/lib/data-retention";

export const runtime = "nodejs";
const workspaceId = "primary";
const workspaceBodyLimit = 2_000_000;
const snapshotRestoreBodyLimit = 1_000;

function getSql() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is not configured");
  return neon(databaseUrl);
}

export async function GET(request: Request) {
  const unauthorized = await requireOwner(request.headers);
  if (unauthorized) return unauthorized;
  try {
    const sql = getSql();
    const rows = await sql`SELECT data, updated_at::text AS version FROM workspaces WHERE id = ${workspaceId} LIMIT 1`;
    const snapshots = await sql`
      SELECT id::text, created_at
      FROM workspace_snapshots
      WHERE workspace_id = ${workspaceId}
      ORDER BY created_at DESC, id DESC
      LIMIT ${workspaceSnapshotHistoryCount}
    `;
    const history = snapshots.map((snapshot) => ({ id: String(snapshot.id), createdAt: snapshot.created_at }));
    if (!rows.length) return NextResponse.json({ workspace: null, updatedAt: null, lastSnapshotAt: history[0]?.createdAt ?? null, snapshots: history });
    return NextResponse.json({ workspace: rows[0].data, updatedAt: rows[0].version, lastSnapshotAt: history[0]?.createdAt ?? null, snapshots: history });
  } catch (error) {
    console.error("Workspace read failed", error);
    return NextResponse.json({ error: "Cloud storage is unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireOwner(request.headers);
  if (unauthorized) return unauthorized;
  try {
    const sql = getSql();
    const rows = await sql`
      INSERT INTO workspace_snapshots (workspace_id, data)
      SELECT id, data FROM workspaces WHERE id = ${workspaceId}
      RETURNING id::text, created_at
    `;
    if (!rows.length) return NextResponse.json({ error: "Save the workspace before creating a snapshot" }, { status: 409 });
    try {
      await sql`
        DELETE FROM workspace_snapshots
        WHERE id IN (
          SELECT id FROM workspace_snapshots
          WHERE workspace_id = ${workspaceId}
          ORDER BY created_at DESC, id DESC
          OFFSET ${workspaceSnapshotRetentionCount}
        )
      `;
    } catch (error) {
      console.error("Workspace snapshot retention failed", error);
    }
    return NextResponse.json({ ok: true, id: String(rows[0].id), createdAt: rows[0].created_at });
  } catch (error) {
    console.error("Workspace snapshot failed", error);
    return NextResponse.json({ error: "Snapshot could not be created" }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  const unauthorized = await requireOwner(request.headers);
  if (unauthorized) return unauthorized;

  try {
    const body = await readRequestTextWithLimit(request, snapshotRestoreBodyLimit);
    if (!body.ok) return NextResponse.json({ error: "Snapshot restore request is too large" }, { status: 413 });
    let snapshotId: unknown;
    try {
      const payload: unknown = JSON.parse(body.value);
      snapshotId = payload && typeof payload === "object" && "snapshotId" in payload ? (payload as { snapshotId?: unknown }).snapshotId : null;
    } catch {
      return NextResponse.json({ error: "Invalid snapshot restore request" }, { status: 400 });
    }
    if (typeof snapshotId !== "string" || !/^[1-9]\d*$/.test(snapshotId)) {
      return NextResponse.json({ error: "Invalid snapshot" }, { status: 400 });
    }

    const sql = getSql();
    const snapshots = await sql`SELECT data FROM workspace_snapshots WHERE id = ${snapshotId}::bigint AND workspace_id = ${workspaceId} LIMIT 1`;
    if (!snapshots.length) return NextResponse.json({ error: "Snapshot not found" }, { status: 404 });
    const workspace = parseWorkspace(snapshots[0].data);
    if (!workspace) return NextResponse.json({ error: "Snapshot data is not restorable" }, { status: 409 });
    const serialized = JSON.stringify(workspace);
    const rows = await sql`
      WITH safety_snapshot AS (
        INSERT INTO workspace_snapshots (workspace_id, data)
        SELECT id, data FROM workspaces WHERE id = ${workspaceId}
        RETURNING id::text, created_at
      ), updated_workspace AS (
        UPDATE workspaces SET data = ${serialized}::jsonb, updated_at = NOW()
        WHERE id = ${workspaceId}
        RETURNING updated_at::text AS version
      )
      SELECT updated_workspace.version, safety_snapshot.id, safety_snapshot.created_at
      FROM updated_workspace CROSS JOIN safety_snapshot
    `;
    if (!rows.length) return NextResponse.json({ error: "Workspace not found" }, { status: 409 });
    try {
      await sql`
        DELETE FROM workspace_snapshots
        WHERE id IN (
          SELECT id FROM workspace_snapshots
          WHERE workspace_id = ${workspaceId}
          ORDER BY created_at DESC, id DESC
          OFFSET ${workspaceSnapshotRetentionCount}
        )
      `;
    } catch (error) {
      console.error("Workspace snapshot retention failed after restore", error);
    }
    return NextResponse.json({
      ok: true,
      workspace,
      updatedAt: rows[0].version,
      restoredFrom: snapshotId,
      safetySnapshot: { id: String(rows[0].id), createdAt: rows[0].created_at },
    });
  } catch (error) {
    console.error("Workspace snapshot restore failed", error);
    return NextResponse.json({ error: "Snapshot could not be restored" }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  const unauthorized = await requireOwner(request.headers);
  if (unauthorized) return unauthorized;
  try {
    const body = await readRequestTextWithLimit(request, workspaceBodyLimit);
    if (!body.ok) return NextResponse.json({ error: "Workspace is too large" }, { status: 413 });
    const workspace = parseWorkspace(JSON.parse(body.value));
    if (!workspace) return NextResponse.json({ error: "Invalid workspace data" }, { status: 400 });
    const sql = getSql();
    const serialized = JSON.stringify(workspace);
    const expectedVersion = request.headers.get("x-workspace-version");
    if (expectedVersion) {
      const rows = await sql`
        UPDATE workspaces SET data = ${serialized}::jsonb, updated_at = NOW()
        WHERE id = ${workspaceId} AND updated_at = ${expectedVersion}::timestamptz
        RETURNING updated_at::text AS version
      `;
      if (!rows.length) return NextResponse.json({ error: "Workspace changed in another session" }, { status: 409 });
      return NextResponse.json({ ok: true, updatedAt: rows[0].version });
    }
    const rows = await sql`
      INSERT INTO workspaces (id, data, updated_at)
      VALUES (${workspaceId}, ${serialized}::jsonb, NOW())
      ON CONFLICT (id) DO NOTHING
      RETURNING updated_at::text AS version
    `;
    if (!rows.length) return NextResponse.json({ error: "Workspace version is required" }, { status: 409 });
    return NextResponse.json({ ok: true, updatedAt: rows[0].version });
  } catch (error) {
    console.error("Workspace write failed", error);
    return NextResponse.json({ error: "Cloud storage is unavailable" }, { status: 503 });
  }
}
