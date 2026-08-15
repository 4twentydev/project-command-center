import { describe, expect, test } from "bun:test";
import { normalizeLeadSummary } from "@/lib/contact-inquiries";

describe("contact inquiry summaries", () => {
  test("normalizes database aggregate counts", () => {
    expect(normalizeLeadSummary({ open_count: 7, due_count: "3", won_count: 2 })).toEqual({
      open: 7,
      due: 3,
      won: 2,
    });
  });

  test("falls back safely for missing or invalid aggregate values", () => {
    expect(normalizeLeadSummary({ open_count: -1, due_count: 1.5, won_count: "invalid" })).toEqual({
      open: 0,
      due: 0,
      won: 0,
    });
  });
});
