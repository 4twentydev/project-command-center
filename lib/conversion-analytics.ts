import { contactDatabase } from "@/lib/contact-inquiries";

export const conversionEventNames = ["workflow_audit_view", "workflow_audit_form_start", "workflow_audit_validation_error", "workflow_audit_submission_success", "workflow_audit_booking_click"] as const;
export type ConversionEventName = typeof conversionEventNames[number];

export type ConversionEvent = {
  event: ConversionEventName;
  path: string;
  visitorHash: string;
  metadata?: Record<string, string | number | boolean | string[]>;
};

export function isConversionEventName(value: unknown): value is ConversionEventName {
  return conversionEventNames.includes(value as ConversionEventName);
}

export async function recordConversionEvent({ event, path, visitorHash, metadata = {} }: ConversionEvent) {
  const sql = await contactDatabase();
  const recent = await sql`SELECT COUNT(*)::int AS count FROM conversion_events WHERE visitor_hash = ${visitorHash} AND created_at > NOW() - INTERVAL '1 hour'`;
  if (Number(recent[0]?.count ?? 0) >= 100) return false;
  await sql`INSERT INTO conversion_events (event_name, path, metadata, visitor_hash) VALUES (${event}, ${path.slice(0, 200)}, ${JSON.stringify(metadata)}::jsonb, ${visitorHash})`;
  await sql`DELETE FROM conversion_events WHERE created_at < NOW() - INTERVAL '90 days'`;
  return true;
}
