import { describe, expect, test } from "bun:test";
import { bootstrapTokenMatches, ownerBootstrapAllowed } from "@/lib/owner-bootstrap";

describe("owner bootstrap token", () => {
  test("accepts only an exact configured token", () => {
    const token = "d18bf69e0ab44f3ba77b4ce5e661c959db87b43cc69a4d1f";
    expect(bootstrapTokenMatches(token, token)).toBeTrue();
    expect(bootstrapTokenMatches(token, `${token}x`)).toBeFalse();
    expect(bootstrapTokenMatches(token, token.replace("d", "e"))).toBeFalse();
    expect(bootstrapTokenMatches(undefined, token)).toBeFalse();
    expect(bootstrapTokenMatches(token, null)).toBeFalse();
  });

  test("refuses bootstrap after any auth user exists", () => {
    const token = "d18bf69e0ab44f3ba77b4ce5e661c959db87b43cc69a4d1f";
    const request = { ownerEmail: "owner@4twenty.dev", requestedEmail: "owner@4twenty.dev", expectedToken: token, providedToken: token };
    expect(ownerBootstrapAllowed({ ...request, ownerExists: false })).toBeTrue();
    expect(ownerBootstrapAllowed({ ...request, ownerExists: true })).toBeFalse();
    expect(ownerBootstrapAllowed({ ...request, requestedEmail: "attacker@example.com", ownerExists: false })).toBeFalse();
  });
});
