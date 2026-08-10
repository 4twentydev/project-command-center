import { contactDatabase } from "@/lib/contact-inquiries";
import { emptyMarketingWorkspace, normalizeMarketingWorkspace, type MarketingWorkspace } from "@/lib/marketing-workspace";

const workspaceId = "primary";

export async function getMarketingWorkspace() {
  const sql = await contactDatabase();
  const rows = await sql`SELECT data, updated_at FROM marketing_workspaces WHERE id = ${workspaceId} LIMIT 1`;
  if (!rows.length) return { workspace: emptyMarketingWorkspace, updatedAt: null };
  return { workspace: normalizeMarketingWorkspace(rows[0].data) ?? emptyMarketingWorkspace, updatedAt: new Date(String(rows[0].updated_at)).toISOString() };
}

export async function saveMarketingWorkspace(workspace: MarketingWorkspace) {
  const sql = await contactDatabase();
  const data = JSON.stringify(workspace);
  const rows = await sql`
    INSERT INTO marketing_workspaces (id, data, updated_at) VALUES (${workspaceId}, ${data}::jsonb, NOW())
    ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
    RETURNING updated_at
  `;
  return new Date(String(rows[0].updated_at)).toISOString();
}
