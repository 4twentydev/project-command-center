"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { after } from "next/server";
import { contactDatabase } from "@/lib/contact-inquiries";
import { sendLeadNotification } from "@/lib/lead-notification";

export type ContactState = {
  status: "idle" | "success" | "error";
  message: string;
  errors?: Partial<Record<"name" | "email" | "message", string>>;
};

function text(formData: FormData, key: string, maximum: number) {
  return String(formData.get(key) ?? "").trim().slice(0, maximum);
}

export async function submitContact(_: ContactState, formData: FormData): Promise<ContactState> {
  const website = text(formData, "website", 200);
  if (website) return { status: "success", message: "Thanks—your message is in the queue." };

  const name = text(formData, "name", 100);
  const email = text(formData, "email", 180).toLowerCase();
  const company = text(formData, "company", 120);
  const projectType = text(formData, "projectType", 80);
  const budget = text(formData, "budget", 80);
  const message = text(formData, "message", 4000);
  const errors: ContactState["errors"] = {};

  if (name.length < 2) errors.name = "Tell me what to call you.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";
  if (message.length < 20) errors.message = "Give me at least a few details about the problem.";
  if (Object.keys(errors).length) return { status: "error", message: "Check the highlighted fields.", errors };

  const databaseURL = process.env.DATABASE_URL;
  if (!databaseURL || databaseURL === "[SENSITIVE]") return { status: "error", message: "The contact channel is temporarily unavailable. Email hello@4twenty.dev instead." };

  try {
    const requestHeaders = await headers();
    const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const hashSalt = process.env.CONTACT_HASH_SALT ?? process.env.BETTER_AUTH_SECRET ?? "contact";
    const ipHash = createHash("sha256").update(`${hashSalt}:${forwarded}`).digest("hex");
    const sql = await contactDatabase();
    const recent = await sql`SELECT COUNT(*)::int AS count FROM contact_inquiries WHERE ip_hash = ${ipHash} AND created_at > NOW() - INTERVAL '1 hour'`;
    if (Number(recent[0]?.count ?? 0) >= 5) return { status: "error", message: "That channel has received several messages recently. Try again later or email directly." };
    const inserted = await sql`INSERT INTO contact_inquiries (name, email, company, project_type, budget, message, ip_hash) VALUES (${name}, ${email}, ${company || null}, ${projectType || null}, ${budget || null}, ${message}, ${ipHash}) RETURNING id`;
    const inquiryId = Number(inserted[0].id);
    after(async () => { try { await sendLeadNotification({ id: inquiryId, name, email, company, projectType, budget, message }); } catch (error) { console.error("Lead notification failed", error); } });
    return { status: "success", message: "Message received. I’ll review it and get back to you directly." };
  } catch (error) {
    console.error("Contact inquiry failed", error);
    return { status: "error", message: "The contact channel is temporarily unavailable. Email hello@4twenty.dev instead." };
  }
}
