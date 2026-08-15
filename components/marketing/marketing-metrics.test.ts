import { describe, expect, test } from "bun:test";
import { campaignWeek, newContentItem, newProspect, scoreFor } from "@/components/marketing/marketing-metrics";

describe("marketing operations metrics", () => {
  test("bounds the active campaign week", () => {
    expect(campaignWeek("", "2026-08-15")).toBe(1);
    expect(campaignWeek("2026-08-10", "2026-08-10")).toBe(1);
    expect(campaignWeek("2026-08-10", "2026-08-17")).toBe(2);
    expect(campaignWeek("2026-01-01", "2026-08-15")).toBe(12);
  });

  test("scores only activity, prospects, and published content inside the selected week", () => {
    const prospect = { ...newProspect(), id: "prospect-1", createdAt: "2026-08-11T15:00:00.000Z" };
    const content = { ...newContentItem(1), id: "content-1", status: "published" as const, publishAt: "2026-08-12" };
    const score = scoreFor({
      campaignStart: "2026-08-10",
      prospects: [prospect, { ...prospect, id: "prospect-2", createdAt: "2026-08-18T15:00:00.000Z" }],
      activities: [
        { id: "call", prospectId: prospect.id, type: "call", outcome: "Reached", value: 0, createdAt: "2026-08-11T16:00:00.000Z" },
        { id: "conversation", prospectId: prospect.id, type: "conversation", outcome: "Qualified", value: 0, createdAt: "2026-08-12T16:00:00.000Z" },
        { id: "audit", prospectId: prospect.id, type: "audit-paid", outcome: "Booked", value: 750, createdAt: "2026-08-13T16:00:00.000Z" },
        { id: "later", prospectId: prospect.id, type: "client-won", outcome: "Won", value: 5000, createdAt: "2026-08-18T16:00:00.000Z" },
      ],
      content: [content, { ...content, id: "content-2", status: "draft", publishAt: "2026-08-13" }],
    }, 1, "America/Denver");

    expect(score).toMatchObject({ accounts: 1, outreach: 1, conversations: 1, paidAudits: 1, paidClients: 0, bookedRevenue: 750, posts: 1 });
  });
});
