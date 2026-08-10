import { neon } from "@neondatabase/serverless";

const databaseURL = process.env.DATABASE_URL;
if (!databaseURL || databaseURL === "[SENSITIVE]") throw new Error("DATABASE_URL is not configured");

const sql = neon(databaseURL);

await sql`CREATE TABLE IF NOT EXISTS workspaces (id TEXT PRIMARY KEY, data JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
await sql`CREATE TABLE IF NOT EXISTS workspace_snapshots (id BIGSERIAL PRIMARY KEY, workspace_id TEXT NOT NULL, data JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
await sql`CREATE TABLE IF NOT EXISTS push_subscriptions (endpoint TEXT PRIMARY KEY, subscription JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
await sql`CREATE TABLE IF NOT EXISTS contact_inquiries (
  id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, company TEXT,
  project_type TEXT, budget TEXT, message TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new',
  ip_hash TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)`;
await sql`ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS notes TEXT NOT NULL DEFAULT ''`;
await sql`ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS follow_up_at TIMESTAMPTZ`;
await sql`ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS converted_project_id TEXT`;
await sql`ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS notification_id TEXT`;
await sql`ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS notification_status TEXT NOT NULL DEFAULT 'not_configured'`;
await sql`ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`;

console.log("Application database migration completed.");
