"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { contactDatabase, type LeadStatus } from "@/lib/contact-inquiries";
import { followUpTimestamp, leadStatuses } from "@/lib/lead-rules";
import { getOwnerSession } from "@/lib/owner-session";

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
  if (!leadStatuses.has(status)) throw new Error("Invalid lead update");
  await sql`
    UPDATE contact_inquiries
    SET status = ${status}, archived_at = CASE WHEN ${status} = 'archived' THEN COALESCE(archived_at, NOW()) ELSE NULL END, updated_at = NOW()
    WHERE id = ${id}
  `;
  revalidatePath("/dashboard"); revalidatePath("/dashboard/leads");
}

export async function saveLeadDetails(formData: FormData) {
  const sql = await ownerSql();
  const id = leadId(formData);
  const notes = String(formData.get("notes") ?? "").trim().slice(0, 5000);
  const followUpAt = followUpTimestamp(formData.get("followUpAt"));
  await sql`UPDATE contact_inquiries SET notes = ${notes}, follow_up_at = ${followUpAt}, updated_at = NOW() WHERE id = ${id}`;
  revalidatePath("/dashboard"); revalidatePath("/dashboard/leads");
}

export async function convertLeadToProject(formData: FormData) {
  const sql = await ownerSql();
  const id = leadId(formData);
  const projectId = randomUUID();
  const now = new Date().toISOString();
  const activityId = randomUUID();
  await sql`
    WITH claimed AS (
      UPDATE contact_inquiries
      SET status = 'won', archived_at = NULL, converted_project_id = ${projectId}, updated_at = NOW()
      WHERE id = ${id} AND converted_project_id IS NULL
      RETURNING name, email, company, message
    ), project_data AS (
      SELECT jsonb_build_object(
        'id', ${projectId}, 'name', COALESCE(company, name), 'eyebrow', 'Client project',
        'description', message, 'status', 'Planning', 'kind', 'Business', 'stack', '[]'::jsonb,
        'updatedAt', ${now}, 'updatedLabel', 'Just converted', 'note', 'Lead ' || ${id} || ' · ' || email,
        'progress', 5, 'accent', 'cyan', 'pinned', true
      ) AS project,
      jsonb_build_object('id', ${activityId}, 'message', 'Converted ' || name || ' into a client project', 'createdAt', ${now}) AS activity
      FROM claimed
    )
    INSERT INTO workspaces (id, data, updated_at)
    SELECT 'primary', jsonb_build_object('projects', jsonb_build_array(project), 'tasks', '[]'::jsonb, 'activity', jsonb_build_array(activity)), NOW()
    FROM project_data
    ON CONFLICT (id) DO UPDATE SET
      data = jsonb_set(
        jsonb_set(workspaces.data, '{projects}', COALESCE(workspaces.data->'projects', '[]'::jsonb) || EXCLUDED.data->'projects'),
        '{activity}', EXCLUDED.data->'activity' || COALESCE(workspaces.data->'activity', '[]'::jsonb)
      ),
      updated_at = NOW()
  `;
  revalidatePath("/dashboard"); revalidatePath("/dashboard/leads");
}
