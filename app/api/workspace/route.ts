import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { parseWorkspace } from "@/lib/workspace-validation";
import { requireOwner } from "@/lib/owner-session";

export const runtime = "nodejs";
const workspaceId = "primary";

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
    const snapshots = await sql`SELECT created_at FROM workspace_snapshots WHERE workspace_id = ${workspaceId} ORDER BY created_at DESC LIMIT 1`;
    if (!rows.length) return NextResponse.json({ workspace: null, updatedAt: null, lastSnapshotAt: snapshots[0]?.created_at ?? null });
    return NextResponse.json({ workspace: rows[0].data, updatedAt: rows[0].version, lastSnapshotAt: snapshots[0]?.created_at ?? null });
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
      RETURNING created_at
    `;
    if (!rows.length) return NextResponse.json({ error: "Save the workspace before creating a snapshot" }, { status: 409 });
    return NextResponse.json({ ok: true, createdAt: rows[0].created_at });
  } catch (error) {
    console.error("Workspace snapshot failed", error);
    return NextResponse.json({ error: "Snapshot could not be created" }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  const unauthorized = await requireOwner(request.headers);
  if (unauthorized) return unauthorized;
  if (Number(request.headers.get("content-length") ?? 0) > 2_000_000) return NextResponse.json({ error: "Workspace is too large" }, { status: 413 });
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 2_000_000) return NextResponse.json({ error: "Workspace is too large" }, { status: 413 });
    const workspace = parseWorkspace(JSON.parse(raw));
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
