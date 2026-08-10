import { describe, expect, test } from "bun:test";
import { workflowAuditBookingURL } from "@/lib/workflow-audit-config";
import { validateWorkflowAudit, workflowAuditPayload, type WorkflowAuditPayload } from "@/lib/workflow-audit";
import { processWorkflowAudit, workflowAuditSubmissionKey } from "@/lib/workflow-audit-submission";

const valid: WorkflowAuditPayload = {
  name: "Alex Rivera", business: "Rivera Fabrication", email: "alex@example.com", phone: "303-555-0182",
  industry: "CNC / fabrication", employees: "6–15", currentTools: "QuickBooks, spreadsheets, and paper travelers",
  frustratingWorkflow: "Quotes and production status are re-entered across separate tools every day.",
  hoursLost: "8", desiredOutcome: "A reliable handoff from approved quote to scheduled shop work.", preferredContact: "Email", website: "",
};

describe("workflow audit intake", () => {
  test("normalizes and validates a complete intake", () => {
    const payload = workflowAuditPayload({ ...valid, email: "  ALEX@EXAMPLE.COM  " });
    expect(payload.email).toBe("alex@example.com");
    expect(validateWorkflowAudit(payload)).toEqual({});
  });

  test("rejects invalid required values and incompatible phone preference", () => {
    const errors = validateWorkflowAudit({ ...valid, name: "", email: "bad", phone: "", preferredContact: "Phone", frustratingWorkflow: "short" });
    expect(errors.name).toBeDefined();
    expect(errors.email).toBeDefined();
    expect(errors.phone).toBeDefined();
    expect(errors.frustratingWorkflow).toBeDefined();
  });

  test("creates a deterministic daily duplicate key", () => {
    const date = new Date("2026-08-10T10:00:00Z");
    expect(workflowAuditSubmissionKey(valid, date)).toBe(workflowAuditSubmissionKey(valid, date));
    expect(workflowAuditSubmissionKey(valid, date)).not.toBe(workflowAuditSubmissionKey({ ...valid, frustratingWorkflow: `${valid.frustratingWorkflow} Extra detail.` }, date));
  });

  test("covers successful, duplicate, spam, rate-limited, and failed storage paths", async () => {
    expect(await processWorkflowAudit(valid, { countRecent: async () => 0, insert: async () => 42 })).toMatchObject({ status: "success", id: 42 });
    expect(await processWorkflowAudit(valid, { countRecent: async () => 0, insert: async () => null })).toEqual({ status: "duplicate" });
    expect(await processWorkflowAudit({ ...valid, website: "bot.example" }, { countRecent: async () => 0, insert: async () => 1 })).toEqual({ status: "spam" });
    expect(await processWorkflowAudit(valid, { countRecent: async () => 3, insert: async () => 1 })).toEqual({ status: "rate_limited" });
    expect(await processWorkflowAudit(valid, { countRecent: async () => { throw new Error("offline"); }, insert: async () => 1 })).toEqual({ status: "server_error" });
  });

  test("accepts only configured HTTPS booking links", () => {
    expect(workflowAuditBookingURL("https://calendar.example.com/audit")).toBe("https://calendar.example.com/audit");
    expect(workflowAuditBookingURL("http://calendar.example.com/audit")).toBeNull();
    expect(workflowAuditBookingURL("not-a-url")).toBeNull();
  });
});
