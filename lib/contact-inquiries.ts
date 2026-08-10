import { neon } from "@neondatabase/serverless";

export type LeadStatus = "new" | "contacted" | "archived";

export type ContactInquiry = {
  id: number;
  name: string;
  email: string;
  company: string | null;
  projectType: string | null;
  budget: string | null;
  message: string;
  status: LeadStatus;
  createdAt: string;
};

export async function contactDatabase() {
  const databaseURL = process.env.DATABASE_URL;
  if (!databaseURL || databaseURL === "[SENSITIVE]") throw new Error("DATABASE_URL is not configured");
  const sql = neon(databaseURL);
  await sql`CREATE TABLE IF NOT EXISTS contact_inquiries (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    project_type TEXT,
    budget TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    ip_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  return sql;
}

export async function listContactInquiries(status?: LeadStatus) {
  const sql = await contactDatabase();
  const rows = status
    ? await sql`SELECT id, name, email, company, project_type, budget, message, status, created_at FROM contact_inquiries WHERE status = ${status} ORDER BY created_at DESC LIMIT 100`
    : await sql`SELECT id, name, email, company, project_type, budget, message, status, created_at FROM contact_inquiries ORDER BY created_at DESC LIMIT 100`;
  return rows.map((row) => ({
    id: Number(row.id),
    name: String(row.name),
    email: String(row.email),
    company: row.company ? String(row.company) : null,
    projectType: row.project_type ? String(row.project_type) : null,
    budget: row.budget ? String(row.budget) : null,
    message: String(row.message),
    status: row.status as LeadStatus,
    createdAt: new Date(row.created_at).toISOString(),
  })) satisfies ContactInquiry[];
}
