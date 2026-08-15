import { afterEach, describe, expect, test } from "bun:test";
import { POST } from "@/app/api/webhooks/resend/route";

const previousApiKey = process.env.RESEND_API_KEY;
const previousWebhookSecret = process.env.RESEND_WEBHOOK_SECRET;

afterEach(() => {
  process.env.RESEND_API_KEY = previousApiKey;
  process.env.RESEND_WEBHOOK_SECRET = previousWebhookSecret;
});

describe("Resend webhook route", () => {
  test("rejects an invalid signed request without reaching database storage", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_WEBHOOK_SECRET = "whsec_dGVzdHNlY3JldA==";
    const request = new Request("https://example.test/api/webhooks/resend", {
      method: "POST",
      headers: { "svix-id": "msg_test", "svix-timestamp": String(Math.floor(Date.now() / 1000)), "svix-signature": "v1,invalid", "x-request-id": "webhook-test" },
      body: JSON.stringify({ type: "email.delivered", data: { email_id: "email_test" } }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(response.headers.get("x-request-id")).toBe("webhook-test");
    expect(await response.json()).toEqual({ error: "Invalid signature" });
  });
});
