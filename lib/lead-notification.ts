import { Resend } from "resend";
import type { WorkflowAuditIntake } from "@/lib/workflow-audit";

type LeadNotification = { id: number; name: string; email: string; company: string; projectType: string; budget: string; message: string; intake?: WorkflowAuditIntake };

function escapeHTML(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

export async function sendLeadNotification(lead: LeadNotification) {
  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.CONTACT_NOTIFICATION_EMAIL ?? process.env.OWNER_EMAIL;
  if (!apiKey || !recipient) return { sent: false as const, reason: "not-configured" as const };
  const resend = new Resend(apiKey);
  const from = process.env.CONTACT_FROM_EMAIL ?? "4TWENTY.DEV <onboarding@resend.dev>";
  const auditDetails = lead.intake ? `<h2 style="font-size:18px;margin:24px 0 8px">Workflow audit intake</h2><p style="line-height:1.7"><strong>Phone:</strong> ${escapeHTML(lead.intake.phone || "Not provided")}<br><strong>Industry:</strong> ${escapeHTML(lead.intake.industry)}<br><strong>Employees:</strong> ${escapeHTML(lead.intake.employees || "Not provided")}<br><strong>Current tools:</strong> ${escapeHTML(lead.intake.currentTools)}<br><strong>Estimated hours lost:</strong> ${escapeHTML(lead.intake.hoursLost || "Not provided")}<br><strong>Preferred contact:</strong> ${escapeHTML(lead.intake.preferredContact)}</p><div style="margin:18px 0;padding:18px;background:#f4f4f5;border-radius:10px;white-space:pre-wrap;line-height:1.6"><strong>Desired outcome</strong><br>${escapeHTML(lead.intake.desiredOutcome)}</div>` : "";
  const { data, error } = await resend.emails.send({
    from,
    to: recipient,
    replyTo: lead.email,
    subject: `New project inquiry · ${lead.name}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#171717"><p style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#0891b2">4TWENTY.DEV · New inquiry</p><h1 style="font-size:26px;margin:12px 0">${escapeHTML(lead.name)}</h1><p><strong>Email:</strong> <a href="mailto:${escapeHTML(lead.email)}">${escapeHTML(lead.email)}</a><br><strong>Company:</strong> ${escapeHTML(lead.company || "Not provided")}<br><strong>Project:</strong> ${escapeHTML(lead.projectType || "Not selected")}<br><strong>Budget:</strong> ${escapeHTML(lead.budget || "Not selected")}</p><div style="margin:24px 0;padding:18px;background:#f4f4f5;border-radius:10px;white-space:pre-wrap;line-height:1.6">${escapeHTML(lead.message)}</div>${auditDetails}<p><a href="https://www.4twenty.dev/dashboard/leads">Open Client Leads</a></p></div>`,
  }, { headers: { "Idempotency-Key": `contact-inquiry-${lead.id}` } });
  if (error) throw new Error(error.message);
  return { sent: true as const, id: data?.id ?? null };
}
