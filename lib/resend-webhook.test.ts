import { describe, expect, test } from "bun:test";
import { notificationStatusForResendEvent } from "@/lib/resend-webhook";

describe("Resend webhook event mapping", () => {
  test("maps every delivery lifecycle event and ignores unrelated events", () => {
    expect(notificationStatusForResendEvent("email.sent")).toBe("sent");
    expect(notificationStatusForResendEvent("email.delivered")).toBe("delivered");
    expect(notificationStatusForResendEvent("email.bounced")).toBe("bounced");
    expect(notificationStatusForResendEvent("email.complained")).toBe("complained");
    expect(notificationStatusForResendEvent("email.failed")).toBe("failed");
    expect(notificationStatusForResendEvent("email.suppressed")).toBe("failed");
    expect(notificationStatusForResendEvent("contact.created")).toBeNull();
  });
});
