import { contactDatabase } from "@/lib/contact-inquiries";
import { emptyMarketingWorkspace, normalizeMarketingWorkspace, type MarketingWorkspace } from "@/lib/marketing-workspace";

const workspaceId = "primary";

export async function getMarketingWorkspace() {
  const sql = await contactDatabase();
  const rows = await sql`SELECT data, updated_at::text AS version FROM marketing_workspaces WHERE id = ${workspaceId} LIMIT 1`;
  if (!rows.length) return { workspace: emptyMarketingWorkspace, updatedAt: null };
  return { workspace: normalizeMarketingWorkspace(rows[0].data) ?? emptyMarketingWorkspace, updatedAt: String(rows[0].version) };
}

export async function saveMarketingWorkspace(workspace: MarketingWorkspace, expectedVersion: string | null) {
  const sql = await contactDatabase();
  const data = JSON.stringify(workspace);
  if (expectedVersion) {
    const rows = await sql`
      UPDATE marketing_workspaces SET data = ${data}::jsonb, updated_at = NOW()
      WHERE id = ${workspaceId} AND updated_at = ${expectedVersion}::timestamptz
      RETURNING updated_at::text AS version
    `;
    return rows.length ? String(rows[0].version) : null;
  }
  const rows = await sql`
    INSERT INTO marketing_workspaces (id, data, updated_at) VALUES (${workspaceId}, ${data}::jsonb, NOW())
    ON CONFLICT (id) DO NOTHING
    RETURNING updated_at::text AS version
  `;
  return rows.length ? String(rows[0].version) : null;
}
