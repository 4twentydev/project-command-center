import { createHash } from "node:crypto";
import { validateWorkflowAudit, type WorkflowAuditErrors, type WorkflowAuditPayload, type WorkflowAuditValues } from "@/lib/workflow-audit";

export function workflowAuditSubmissionKey(values: WorkflowAuditValues, date = new Date()) {
  const day = date.toISOString().slice(0, 10);
  const canonical = [day, values.email, values.business.toLowerCase(), values.frustratingWorkflow.toLowerCase()].join("|");
  return createHash("sha256").update(canonical).digest("hex");
}

export type WorkflowAuditResult =
  | { status: "success"; id: number; values: WorkflowAuditValues }
  | { status: "invalid"; errors: WorkflowAuditErrors }
  | { status: "duplicate" }
  | { status: "spam" }
  | { status: "rate_limited" }
  | { status: "server_error" };

type WorkflowAuditStore = {
  countRecent: () => Promise<number>;
  insert: (values: WorkflowAuditValues, submissionKey: string) => Promise<number | null>;
};

export async function processWorkflowAudit(payload: WorkflowAuditPayload, store: WorkflowAuditStore): Promise<WorkflowAuditResult> {
  if (payload.website) return { status: "spam" };
  const values: WorkflowAuditValues = payload;
  const errors = validateWorkflowAudit(values);
  if (Object.keys(errors).length) return { status: "invalid", errors };
  try {
    if (await store.countRecent() >= 3) return { status: "rate_limited" };
    const id = await store.insert(values, workflowAuditSubmissionKey(values));
    return id ? { status: "success", id, values } : { status: "duplicate" };
  } catch {
    return { status: "server_error" };
  }
}
