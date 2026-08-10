import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { isWorkspaceData } from "@/lib/workspace-validation";

export const runtime = "nodejs";
const workspaceId = "primary";

function getSql() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is not configured");
  return neon(databaseUrl);
}

async function ensureSchema() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS workspace_snapshots (
      id BIGSERIAL PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  return sql;
}

export async function GET() {
  try {
    const sql = await ensureSchema();
    const rows = await sql`SELECT data, updated_at FROM workspaces WHERE id = ${workspaceId} LIMIT 1`;
    const snapshots = await sql`SELECT created_at FROM workspace_snapshots WHERE workspace_id = ${workspaceId} ORDER BY created_at DESC LIMIT 1`;
    if (!rows.length) return NextResponse.json({ workspace: null, updatedAt: null, lastSnapshotAt: snapshots[0]?.created_at ?? null });
    return NextResponse.json({ workspace: rows[0].data, updatedAt: rows[0].updated_at, lastSnapshotAt: snapshots[0]?.created_at ?? null });
  } catch (error) {
    console.error("Workspace read failed", error);
    return NextResponse.json({ error: "Cloud storage is unavailable" }, { status: 503 });
  }
}

export async function POST() {
  try {
    const sql = await ensureSchema();
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
  try {
    const workspace = await request.json();
    if (!isWorkspaceData(workspace)) return NextResponse.json({ error: "Invalid workspace data" }, { status: 400 });
    const sql = await ensureSchema();
    const serialized = JSON.stringify(workspace);
    const rows = await sql`
      INSERT INTO workspaces (id, data, updated_at)
      VALUES (${workspaceId}, ${serialized}::jsonb, NOW())
      ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
      RETURNING updated_at
    `;
    return NextResponse.json({ ok: true, updatedAt: rows[0].updated_at });
  } catch (error) {
    console.error("Workspace write failed", error);
    return NextResponse.json({ error: "Cloud storage is unavailable" }, { status: 503 });
  }
}
