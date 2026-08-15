import { describe, expect, test } from "bun:test";
import { getDashboardDueFollowUps } from "@/lib/dashboard-data";

describe("dashboard auxiliary data", () => {
  test("returns a successful due follow-up count", async () => {
    expect(await getDashboardDueFollowUps(async () => 4)).toBe(4);
  });

  test("keeps a legitimate zero distinct from unavailable data", async () => {
    expect(await getDashboardDueFollowUps(async () => 0)).toBe(0);
  });

  test("degrades safely and reports only sanitized context when the query fails", async () => {
    const messages: string[] = [];
    const result = await getDashboardDueFollowUps(
      async () => { throw new Error("postgres://user:secret@example.test/database"); },
      (message) => messages.push(message),
    );

    expect(result).toBeNull();
    expect(messages).toEqual(["Dashboard due follow-up count unavailable"]);
    expect(messages.join(" ")).not.toContain("secret");
  });
});
