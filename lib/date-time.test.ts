import { describe, expect, test } from "bun:test";
import { addDaysToDateKey, dateKeyInTimeZone, daysBetweenDateKeys, isValidDateKey, isValidTimeZone, normalizeTimeZone } from "@/lib/date-time";

describe("timezone-aware calendar dates", () => {
  test("keeps Denver evening activity on the local day after UTC rolls over", () => {
    const instant = new Date("2026-08-16T00:30:00.000Z");
    expect(dateKeyInTimeZone(instant, "America/Denver")).toBe("2026-08-15");
    expect(dateKeyInTimeZone(instant, "Asia/Tokyo")).toBe("2026-08-16");
  });

  test("returns the same civil date across the spring DST transition", () => {
    expect(dateKeyInTimeZone(new Date("2026-03-08T08:30:00.000Z"), "America/Denver")).toBe("2026-03-08");
    expect(dateKeyInTimeZone(new Date("2026-03-08T09:30:00.000Z"), "America/Denver")).toBe("2026-03-08");
  });

  test("validates IANA zones and falls back safely", () => {
    expect(isValidTimeZone("America/Denver")).toBe(true);
    expect(isValidTimeZone("Not/A_Zone")).toBe(false);
    expect(normalizeTimeZone("Not/A_Zone")).toBe("America/Denver");
  });

  test("performs civil-date arithmetic without DST-sized days", () => {
    expect(addDaysToDateKey("2024-02-28", 1)).toBe("2024-02-29");
    expect(addDaysToDateKey("2026-03-08", 1)).toBe("2026-03-09");
    expect(daysBetweenDateKeys("2026-03-07", "2026-03-09")).toBe(2);
  });

  test("rejects impossible civil dates", () => {
    expect(isValidDateKey("2026-02-29")).toBe(false);
    expect(isValidDateKey("2026-13-01")).toBe(false);
    expect(isValidDateKey("2026-12-01")).toBe(true);
  });
});
