"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { contactDatabase, type LeadStatus } from "@/lib/contact-inquiries";
import { getOwnerSession } from "@/lib/owner-session";

const statuses = new Set<LeadStatus>(["new", "contacted", "archived"]);

export async function updateLeadStatus(formData: FormData) {
  const session = await getOwnerSession(await headers());
  if (!session) throw new Error("Unauthorized");
  const id = Number(formData.get("id"));
  const status = String(formData.get("status")) as LeadStatus;
  if (!Number.isSafeInteger(id) || id < 1 || !statuses.has(status)) throw new Error("Invalid lead update");
  const sql = await contactDatabase();
  await sql`UPDATE contact_inquiries SET status = ${status} WHERE id = ${id}`;
  revalidatePath("/dashboard/leads");
}
