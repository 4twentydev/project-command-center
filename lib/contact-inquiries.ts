import { neon } from "@neondatabase/serverless";
import type { WorkflowAuditIntake } from "@/lib/workflow-audit";

export type LeadStatus = "new" | "contacted" | "qualified" | "proposal" | "won" | "lost" | "archived";
export type NotificationStatus = "not_configured" | "queued" | "sent" | "delivered" | "bounced" | "complained" | "failed";

export type ContactInquiry = {
  id: number;
  name: string;
  email: string;
  company: string | null;
  projectType: string | null;
  budget: string | null;
  message: string;
  status: LeadStatus;
  notes: string;
  followUpAt: string | null;
  convertedProjectId: string | null;
  notificationId: string | null;
  notificationStatus: NotificationStatus;
  intake: WorkflowAuditIntake | null;
  createdAt: string;
  updatedAt: string;
};

export async function contactDatabase() {
  const databaseURL = process.env.DATABASE_URL;
  if (!databaseURL || databaseURL === "[SENSITIVE]") throw new Error("DATABASE_URL is not configured");
  return neon(databaseURL);
}

export async function listContactInquiries(status?: LeadStatus) {
  const sql = await contactDatabase();
  const rows = status
    ? await sql`SELECT * FROM contact_inquiries WHERE status = ${status} ORDER BY created_at DESC LIMIT 100`
    : await sql`SELECT * FROM contact_inquiries ORDER BY created_at DESC LIMIT 100`;
  return rows.map(mapInquiry) satisfies ContactInquiry[];
}

export async function countDueFollowUps() {
  const sql = await contactDatabase();
  const rows = await sql`SELECT COUNT(*)::int AS count FROM contact_inquiries WHERE (follow_up_at AT TIME ZONE 'America/Denver')::date <= (NOW() AT TIME ZONE 'America/Denver')::date AND status NOT IN ('won', 'lost', 'archived')`;
  return Number(rows[0]?.count ?? 0);
}

export async function listDueFollowUps() {
  const sql = await contactDatabase();
  const rows = await sql`SELECT * FROM contact_inquiries WHERE (follow_up_at AT TIME ZONE 'America/Denver')::date <= (NOW() AT TIME ZONE 'America/Denver')::date AND status NOT IN ('won', 'lost', 'archived') ORDER BY follow_up_at ASC LIMIT 100`;
  return rows.map(mapInquiry) satisfies ContactInquiry[];
}

function mapInquiry(row: Record<string, unknown>): ContactInquiry {
  return {
    id: Number(row.id), name: String(row.name), email: String(row.email),
    company: row.company ? String(row.company) : null,
    projectType: row.project_type ? String(row.project_type) : null,
    budget: row.budget ? String(row.budget) : null,
    message: String(row.message), status: row.status as LeadStatus,
    notes: String(row.notes ?? ""),
    followUpAt: row.follow_up_at ? new Date(String(row.follow_up_at)).toISOString() : null,
    convertedProjectId: row.converted_project_id ? String(row.converted_project_id) : null,
    notificationId: row.notification_id ? String(row.notification_id) : null,
    notificationStatus: String(row.notification_status ?? "not_configured") as NotificationStatus,
    intake: row.intake && typeof row.intake === "object" ? row.intake as WorkflowAuditIntake : null,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at ?? row.created_at)).toISOString(),
  };
}
