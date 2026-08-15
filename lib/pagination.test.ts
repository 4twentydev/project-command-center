import { describe, expect, test } from "bun:test";
import { createPagination, normalizeCount, parseRequestedPage } from "@/lib/pagination";

describe("pagination", () => {
  test("parses one safe positive page from URL search parameters", () => {
    expect(parseRequestedPage("3")).toBe(3);
    expect(parseRequestedPage(["4", "9"])).toBe(4);
    expect(parseRequestedPage("0")).toBe(1);
    expect(parseRequestedPage("2.5")).toBe(1);
    expect(parseRequestedPage("9007199254740992")).toBe(1);
  });

  test("clamps pages and reports the exact visible range", () => {
    expect(createPagination("47", "99", 20)).toEqual({
      page: 3,
      pageSize: 20,
      total: 47,
      totalPages: 3,
      from: 41,
      to: 47,
      hasPrevious: true,
      hasNext: false,
    });
  });

  test("represents empty and malformed counts safely", () => {
    expect(createPagination(undefined, 5, 20)).toMatchObject({ page: 1, total: 0, totalPages: 1, from: 0, to: 0 });
    expect(normalizeCount(-1)).toBe(0);
    expect(normalizeCount("invalid")).toBe(0);
    expect(() => createPagination(1, 1, 0)).toThrow(RangeError);
  });
});
