import { describe, expect, test } from "bun:test";
import { ownerEmailMatches } from "@/lib/owner-authorization";

describe("owner authorization policy", () => {
  test("rejects missing and wrong-owner identities", () => {
    expect(ownerEmailMatches(null, "owner@example.test")).toBe(false);
    expect(ownerEmailMatches("other@example.test", "owner@example.test")).toBe(false);
  });

  test("accepts the configured owner case-insensitively", () => {
    expect(ownerEmailMatches("OWNER@EXAMPLE.TEST", "owner@example.test")).toBe(true);
  });
});
