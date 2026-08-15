import { randomUUID } from "node:crypto";
import { contactDatabase } from "@/lib/contact-inquiries";
import { getConsultationPlaybook } from "@/lib/consultation-playbooks";
import { isValidDateKey } from "@/lib/date-time";
import { createPagination, normalizeCount } from "@/lib/pagination";
import { isValidEmailAddress } from "@/lib/semantic-validation";
import type { ServiceSlug } from "@/lib/services";

export const consultationStatuses = ["draft", "discovery", "scoped", "archived"] as const;
export type ConsultationStatus = typeof consultationStatuses[number];

export type ConsultationRecord = {
  id: string;
  leadId: number | null;
  serviceSlug: ServiceSlug;
  clientName: string;
  business: string;
  email: string;
  consultationDate: string;
  status: ConsultationStatus;
  responses: Record<string, string>;
  createdAt: string;
  updatedAt: string;
};

export type ConsultationInput = Omit<ConsultationRecord, "id" | "createdAt" | "updatedAt">;

function shortText(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function parseConsultationInput(value: unknown): ConsultationInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  const playbook = getConsultationPlaybook(shortText(candidate.serviceSlug, 80));
  if (!playbook) return null;
  const allowedFields = new Set(playbook.sections.flatMap((section) => section.fields.map((field) => field.id)));
  const rawResponses = candidate.responses;
  if (!rawResponses || typeof rawResponses !== "object" || Array.isArray(rawResponses)) return null;
  const responses: Record<string, string> = {};
  for (const [key, answer] of Object.entries(rawResponses)) {
    if (allowedFields.has(key) && typeof answer === "string") responses[key] = answer.trim().slice(0, 10000);
  }
  const status = shortText(candidate.status, 20);
  const consultationDate = shortText(candidate.consultationDate, 10);
  const clientName = shortText(candidate.clientName, 160);
  const business = shortText(candidate.business, 200);
  const email = typeof candidate.email === "string" ? candidate.email.trim().toLowerCase() : "";
  const leadId = candidate.leadId === null || candidate.leadId === undefined ? null : Number(candidate.leadId);
  if (!consultationStatuses.includes(status as ConsultationStatus)) return null;
  if (consultationDate && !isValidDateKey(consultationDate)) return null;
  if (!clientName && !business) return null;
  if (email && !isValidEmailAddress(email)) return null;
  if (leadId !== null && (!Number.isSafeInteger(leadId) || leadId < 1)) return null;
  return {
    leadId,
    serviceSlug: playbook.serviceSlug,
    clientName,
    business,
    email,
    consultationDate,
    status: status as ConsultationStatus,
    responses,
  };
}

export const CONSULTATION_PAGE_SIZE = 12;

export async function listConsultationsPage(page = 1) {
  const sql = await contactDatabase();
  const countRows = await sql`SELECT COUNT(*)::int AS total_count, COUNT(*) FILTER (WHERE status <> 'archived')::int AS active_count FROM consultations`;
  const pagination = createPagination(countRows[0]?.total_count, page, CONSULTATION_PAGE_SIZE);
  const offset = (pagination.page - 1) * pagination.pageSize;
  const rows = await sql`SELECT * FROM consultations ORDER BY updated_at DESC, id DESC LIMIT ${pagination.pageSize} OFFSET ${offset}`;
  return {
    records: rows.map(mapConsultation) satisfies ConsultationRecord[],
    activeTotal: normalizeCount(countRows[0]?.active_count),
    pagination,
  };
}

export async function createConsultation(input: ConsultationInput) {
  const sql = await contactDatabase();
  const id = randomUUID();
  const responses = JSON.stringify(input.responses);
  const rows = await sql`
    INSERT INTO consultations (id, lead_id, service_slug, client_name, business, email, consultation_date, status, responses)
    VALUES (${id}, ${input.leadId}, ${input.serviceSlug}, ${input.clientName}, ${input.business}, ${input.email}, ${input.consultationDate || null}, ${input.status}, ${responses}::jsonb)
    RETURNING *
  `;
  return mapConsultation(rows[0]);
}

export async function updateConsultation(id: string, input: ConsultationInput) {
  const sql = await contactDatabase();
  const responses = JSON.stringify(input.responses);
  const rows = await sql`
    UPDATE consultations SET
      lead_id = ${input.leadId}, service_slug = ${input.serviceSlug}, client_name = ${input.clientName},
      business = ${input.business}, email = ${input.email}, consultation_date = ${input.consultationDate || null},
      status = ${input.status}, responses = ${responses}::jsonb, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return rows.length ? mapConsultation(rows[0]) : null;
}

export async function deleteConsultation(id: string) {
  const sql = await contactDatabase();
  const rows = await sql`DELETE FROM consultations WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

function mapConsultation(row: Record<string, unknown>): ConsultationRecord {
  return {
    id: String(row.id),
    leadId: row.lead_id === null || row.lead_id === undefined ? null : Number(row.lead_id),
    serviceSlug: String(row.service_slug) as ServiceSlug,
    clientName: String(row.client_name ?? ""),
    business: String(row.business ?? ""),
    email: String(row.email ?? ""),
    consultationDate: row.consultation_date ? new Date(String(row.consultation_date)).toISOString().slice(0, 10) : "",
    status: String(row.status) as ConsultationStatus,
    responses: row.responses && typeof row.responses === "object" ? row.responses as Record<string, string> : {},
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}
