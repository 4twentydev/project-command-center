"use server";

import { headers } from "next/headers";
import { after } from "next/server";
import { brand } from "@/lib/brand";
import { contactDatabase } from "@/lib/contact-inquiries";
import { recordConversionEvent } from "@/lib/conversion-analytics";
import { workflowAuditEngagement } from "@/lib/engagements";
import { sendLeadNotification } from "@/lib/lead-notification";
import { hashedRequestAddress } from "@/lib/request-privacy";
import { workflowAuditIntake, workflowAuditPayload, type WorkflowAuditErrors } from "@/lib/workflow-audit";
import { processWorkflowAudit } from "@/lib/workflow-audit-submission";
import { logOperationalError, requestCorrelationId, withOperationTimeout } from "@/lib/operational-observability";

export type WorkflowAuditState = {
  status: "idle" | "success" | "duplicate" | "error";
  message: string;
  errors?: WorkflowAuditErrors;
};

export async function submitWorkflowAudit(_: WorkflowAuditState, formData: FormData): Promise<WorkflowAuditState> {
  const payload = workflowAuditPayload(formData);
  const requestHeaders = await headers();
  const requestId = requestCorrelationId(requestHeaders);
  const ipHash = hashedRequestAddress(requestHeaders, "workflow-audit");
  const visitorHash = hashedRequestAddress(requestHeaders, "conversion-analytics", true);
  let sql: Awaited<ReturnType<typeof contactDatabase>>;
  try {
    sql = await contactDatabase();
  } catch (error) {
    logOperationalError("workflow_audit_database.failed", requestId, error, { dependency: "database", operation: "initialize_workflow_audit" });
    return { status: "error", message: `The secure intake channel is temporarily unavailable. Email ${brand.email} instead.` };
  }

  const result = await processWorkflowAudit(payload, {
    countRecent: async () => {
      const rows = await withOperationTimeout(sql`SELECT COUNT(*)::int AS count FROM contact_inquiries WHERE ip_hash = ${ipHash} AND LOWER(project_type) = 'workflow audit' AND created_at > NOW() - INTERVAL '1 hour'`);
      return Number(rows[0]?.count ?? 0);
    },
    insert: async (values, submissionKey) => {
      const structuredIntake = workflowAuditIntake(values);
      const rows = await withOperationTimeout(sql`INSERT INTO contact_inquiries (name, email, company, project_type, budget, message, ip_hash, intake, submission_key) VALUES (${values.name}, ${values.email}, ${values.business}, ${workflowAuditEngagement.title}, ${workflowAuditEngagement.priceLabel}, ${values.frustratingWorkflow}, ${ipHash}, ${JSON.stringify(structuredIntake)}::jsonb, ${submissionKey}) ON CONFLICT DO NOTHING RETURNING id`);
      return rows[0]?.id ? Number(rows[0].id) : null;
    },
  });

  if (result.status === "spam") return { status: "success", message: "Thanks—your request is in the review queue." };
  if (result.status === "invalid") {
    after(() => recordConversionEvent({ event: "workflow_audit_validation_error", path: "/workflow-audit", visitorHash, metadata: { fields: Object.keys(result.errors) } }).catch(() => undefined));
    return { status: "error", message: "Check the highlighted fields and try again.", errors: result.errors };
  }
  if (result.status === "rate_limited") return { status: "error", message: `Several audit requests have come from this connection recently. Try again later or email ${brand.email}.` };
  if (result.status === "duplicate") return { status: "duplicate", message: "This audit request is already in the queue. There is no need to submit it again." };
  if (result.status === "server_error") return { status: "error", message: `The secure intake channel is temporarily unavailable. Email ${brand.email} instead.` };

  after(async () => {
    const notificationTask = (async () => {
      try {
        const notification = await sendLeadNotification({ id: result.id, name: result.values.name, email: result.values.email, company: result.values.business, projectType: workflowAuditEngagement.title, budget: workflowAuditEngagement.priceLabel, message: result.values.frustratingWorkflow, intake: workflowAuditIntake(result.values) });
        await withOperationTimeout(sql`UPDATE contact_inquiries SET notification_id = ${notification.sent ? notification.id : null}, notification_status = ${notification.sent ? "sent" : "not_configured"}, updated_at = NOW() WHERE id = ${result.id}`);
      } catch (error) {
        await withOperationTimeout(sql`UPDATE contact_inquiries SET notification_status = 'failed', updated_at = NOW() WHERE id = ${result.id}`).catch(() => undefined);
        logOperationalError("workflow_audit_notification.failed", requestId, error, { dependency: "resend", operation: "workflow_audit_notification" });
      }
    })();
    await Promise.allSettled([notificationTask, recordConversionEvent({ event: "workflow_audit_submission_success", path: "/workflow-audit", visitorHash })]);
  });
  return { status: "success", message: "Your workflow audit request is in. Brandon will review the operating problem and follow up directly with fit, scope, fee, and the next available step." };
}
