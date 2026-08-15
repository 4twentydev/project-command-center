import { neon } from "@neondatabase/serverless";
import { createPagination } from "@/lib/pagination";
import type { WorkflowAuditIntake } from "@/lib/workflow-audit";

export type LeadStatus = "new" | "contacted" | "qualified" | "proposal" | "won" | "lost" | "archived";
export type NotificationStatus = "not_configured" | "queued" | "sent" | "delivered" | "bounced" | "complained" | "failed";

export type LeadSummary = {
  open: number;
  due: number;
  won: number;
};

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
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function contactDatabase() {
  const databaseURL = process.env.DATABASE_URL;
  if (!databaseURL || databaseURL === "[SENSITIVE]") throw new Error("DATABASE_URL is not configured");
  return neon(databaseURL);
}

export const LEAD_PAGE_SIZE = 20;

export async function listContactInquiryPage({ status, due = false, page = 1 }: { status?: LeadStatus; due?: boolean; page?: number } = {}) {
  const sql = await contactDatabase();
  const countRows = due
    ? await sql`SELECT COUNT(*)::int AS count FROM contact_inquiries WHERE (follow_up_at AT TIME ZONE 'America/Denver')::date <= (NOW() AT TIME ZONE 'America/Denver')::date AND status NOT IN ('won', 'lost', 'archived')`
    : status
      ? await sql`SELECT COUNT(*)::int AS count FROM contact_inquiries WHERE status = ${status}`
      : await sql`SELECT COUNT(*)::int AS count FROM contact_inquiries`;
  const pagination = createPagination(countRows[0]?.count, page, LEAD_PAGE_SIZE);
  const offset = (pagination.page - 1) * pagination.pageSize;
  const rows = due
    ? await sql`SELECT * FROM contact_inquiries WHERE (follow_up_at AT TIME ZONE 'America/Denver')::date <= (NOW() AT TIME ZONE 'America/Denver')::date AND status NOT IN ('won', 'lost', 'archived') ORDER BY follow_up_at ASC, id ASC LIMIT ${pagination.pageSize} OFFSET ${offset}`
    : status
      ? await sql`SELECT * FROM contact_inquiries WHERE status = ${status} ORDER BY created_at DESC, id DESC LIMIT ${pagination.pageSize} OFFSET ${offset}`
      : await sql`SELECT * FROM contact_inquiries ORDER BY created_at DESC, id DESC LIMIT ${pagination.pageSize} OFFSET ${offset}`;
  return { records: rows.map(mapInquiry) satisfies ContactInquiry[], pagination };
}

export async function getContactInquiry(id: number) {
  if (!Number.isSafeInteger(id) || id < 1) return null;
  const sql = await contactDatabase();
  const rows = await sql`SELECT * FROM contact_inquiries WHERE id = ${id} LIMIT 1`;
  return rows.length ? mapInquiry(rows[0]) : null;
}

export async function countDueFollowUps() {
  const sql = await contactDatabase();
  const rows = await sql`SELECT COUNT(*)::int AS count FROM contact_inquiries WHERE (follow_up_at AT TIME ZONE 'America/Denver')::date <= (NOW() AT TIME ZONE 'America/Denver')::date AND status NOT IN ('won', 'lost', 'archived')`;
  return Number(rows[0]?.count ?? 0);
}

export async function getLeadSummary() {
  const sql = await contactDatabase();
  const rows = await sql`SELECT
    COUNT(*) FILTER (WHERE status NOT IN ('won', 'lost', 'archived'))::int AS open_count,
    COUNT(*) FILTER (
      WHERE (follow_up_at AT TIME ZONE 'America/Denver')::date <= (NOW() AT TIME ZONE 'America/Denver')::date
        AND status NOT IN ('won', 'lost', 'archived')
    )::int AS due_count,
    COUNT(*) FILTER (WHERE status = 'won')::int AS won_count
    FROM contact_inquiries`;
  return normalizeLeadSummary(rows[0] ?? {});
}

export function normalizeLeadSummary(row: Record<string, unknown>): LeadSummary {
  return {
    open: normalizeCount(row.open_count),
    due: normalizeCount(row.due_count),
    won: normalizeCount(row.won_count),
  };
}

function normalizeCount(value: unknown) {
  const count = Number(value);
  return Number.isSafeInteger(count) && count >= 0 ? count : 0;
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
    archivedAt: row.archived_at ? new Date(String(row.archived_at)).toISOString() : null,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at ?? row.created_at)).toISOString(),
  };
}
