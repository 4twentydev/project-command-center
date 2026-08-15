import { describe, expect, test } from "bun:test";
import { isValidDateValue, isValidEmailAddress, normalizeHTTPSURL, uniqueById, validUUID } from "@/lib/semantic-validation";

describe("semantic validation", () => {
  test("rejects impossible calendar dates and malformed timestamps", () => {
    expect(isValidDateValue("2024-02-29")).toBeTrue();
    expect(isValidDateValue("2026-02-29")).toBeFalse();
    expect(isValidDateValue("2026-08-10T12:30:00.000Z")).toBeTrue();
    expect(isValidDateValue("2026-02-30T12:30:00.000Z")).toBeFalse();
    expect(isValidDateValue("2026-08-10Tanything")).toBeFalse();
  });

  test("accepts operational email addresses and rejects ambiguous forms", () => {
    expect(isValidEmailAddress("alex+shop@example.com")).toBeTrue();
    expect(isValidEmailAddress("alex@example")).toBeFalse();
    expect(isValidEmailAddress(".alex@example.com")).toBeFalse();
    expect(isValidEmailAddress("alex..shop@example.com")).toBeFalse();
    expect(isValidEmailAddress(`${"a".repeat(181)}@example.com`, 180)).toBeFalse();
  });

  test("requires structurally valid UUIDs", () => {
    expect(validUUID("c90a2d2e-04d7-4ee4-b3b7-a77ad5254814")).toBe("c90a2d2e-04d7-4ee4-b3b7-a77ad5254814");
    expect(validUUID("------------------------------------")).toBeNull();
    expect(validUUID("1234567890abcdef1234567890abcdef1234")).toBeNull();
  });

  test("keeps only credential-free HTTPS links", () => {
    expect(normalizeHTTPSURL("https://example.com/project")).toBe("https://example.com/project");
    expect(normalizeHTTPSURL("http://example.com/project")).toBeUndefined();
    expect(normalizeHTTPSURL("https://user:secret@example.com/project")).toBeUndefined();
    expect(normalizeHTTPSURL(`https://example.com/${"a".repeat(500)}`)).toBeUndefined();
  });

  test("keeps the first record for each duplicate identifier", () => {
    expect(uniqueById([{ id: "one", value: 1 }, { id: "one", value: 2 }, { id: "two", value: 3 }])).toEqual([
      { id: "one", value: 1 },
      { id: "two", value: 3 },
    ]);
  });
});
