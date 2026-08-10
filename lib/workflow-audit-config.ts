export function workflowAuditBookingURL(value = process.env.WORKFLOW_AUDIT_BOOKING_URL) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}
