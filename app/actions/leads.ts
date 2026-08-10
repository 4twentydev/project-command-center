"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { contactDatabase, type LeadStatus } from "@/lib/contact-inquiries";
import { getOwnerSession } from "@/lib/owner-session";

const statuses = new Set<LeadStatus>(["new", "contacted", "qualified", "proposal", "won", "lost", "archived"]);

async function ownerSql() {
  const session = await getOwnerSession(await headers());
  if (!session) throw new Error("Unauthorized");
  return contactDatabase();
}

function leadId(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isSafeInteger(id) || id < 1) throw new Error("Invalid lead");
  return id;
}

export async function updateLeadStatus(formData: FormData) {
  const sql = await ownerSql();
  const id = leadId(formData);
  const status = String(formData.get("status")) as LeadStatus;
  if (!statuses.has(status)) throw new Error("Invalid lead update");
  await sql`UPDATE contact_inquiries SET status = ${status}, updated_at = NOW() WHERE id = ${id}`;
  revalidatePath("/dashboard"); revalidatePath("/dashboard/leads");
}

export async function saveLeadDetails(formData: FormData) {
  const sql = await ownerSql();
  const id = leadId(formData);
  const notes = String(formData.get("notes") ?? "").trim().slice(0, 5000);
  const followUp = String(formData.get("followUpAt") ?? "").trim();
  const followUpAt = /^\d{4}-\d{2}-\d{2}$/.test(followUp) ? `${followUp}T17:00:00-06:00` : null;
  await sql`UPDATE contact_inquiries SET notes = ${notes}, follow_up_at = ${followUpAt}, updated_at = NOW() WHERE id = ${id}`;
  revalidatePath("/dashboard"); revalidatePath("/dashboard/leads");
}

export async function convertLeadToProject(formData: FormData) {
  const sql = await ownerSql();
  const id = leadId(formData);
  const leads = await sql`SELECT * FROM contact_inquiries WHERE id = ${id} LIMIT 1`;
  const lead = leads[0];
  if (!lead || lead.converted_project_id) return;
  const workspaceRows = await sql`SELECT data FROM workspaces WHERE id = 'primary' LIMIT 1`;
  const workspace = (workspaceRows[0]?.data ?? { projects: [], tasks: [], activity: [] }) as { projects?: unknown[]; tasks?: unknown[]; activity?: unknown[] };
  const projectId = randomUUID();
  const now = new Date().toISOString();
  const project = { id: projectId, name: String(lead.company || lead.name), eyebrow: "Client project", description: String(lead.message), status: "Planning", kind: "Business", stack: [], updatedAt: now, updatedLabel: "Just converted", note: `Lead ${id} · ${lead.email}`, progress: 5, accent: "cyan", pinned: true };
  const nextWorkspace = { ...workspace, projects: [...(workspace.projects ?? []), project], tasks: workspace.tasks ?? [], activity: [{ id: randomUUID(), message: `Converted ${lead.name} into a client project`, createdAt: now }, ...(workspace.activity ?? [])] };
  await sql`INSERT INTO workspaces (id, data, updated_at) VALUES ('primary', ${JSON.stringify(nextWorkspace)}::jsonb, NOW()) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`;
  await sql`UPDATE contact_inquiries SET status = 'won', converted_project_id = ${projectId}, updated_at = NOW() WHERE id = ${id}`;
  revalidatePath("/dashboard"); revalidatePath("/dashboard/leads");
}
