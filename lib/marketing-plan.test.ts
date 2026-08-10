import { describe, expect, test } from "bun:test";
import { idealCustomerProfile, launchBudget, launchWeeks, marketingFunnelStages, marketingTargets, marketingTemplates, outreachSequence, partnerResources } from "@/lib/marketing-plan";
import { normalizeMarketingWorkspace } from "@/lib/marketing-workspace";

describe("90-day marketing plan", () => {
  test("defines twelve distinct weeks and the approved funnel targets", () => {
    expect(launchWeeks).toHaveLength(12);
    expect(launchWeeks.map((week) => Number(week.week))).toEqual(Array.from({ length: 12 }, (_, index) => index + 1));
    expect(new Set(launchWeeks.map((week) => week.content)).size).toBe(12);
    expect(marketingTargets.ninetyDay.paidClients).toBe(3);
    expect(marketingTargets.ninetyDay.paidAudits).toBe(6);
    expect(marketingFunnelStages).toContain("audit-paid");
    expect(marketingFunnelStages).toContain("won");
  });

  test("keeps launch activity focused and within the monthly budget", () => {
    expect(launchBudget.reduce((sum, item) => sum + item.cap, 0)).toBeLessThanOrEqual(marketingTargets.monthlyBudget);
    expect(idealCustomerProfile.priorities).toContain("CNC, sign, and fabrication shops");
    expect(outreachSequence.at(-1)?.day).toBe(30);
    expect(partnerResources).toHaveLength(4);
    expect(marketingTemplates.fitCallAgenda).toContain("Do not provide the full bottleneck analysis");
    expect(marketingTemplates.shopIntroduction).toContain("do not perform free workflow mapping");
  });
});

describe("marketing workspace validation", () => {
  test("normalizes valid records and removes orphan activity", () => {
    const now = "2026-08-10T12:00:00.000Z";
    const workspace = normalizeMarketingWorkspace({
      campaignStart: "2026-08-10",
      prospects: [{ id: "prospect-1", company: "Example Shop", segment: "job-shop", stage: "contacted", source: "direct-outreach", fitScore: 9, createdAt: now, updatedAt: now }],
      activities: [
        { id: "activity-1", prospectId: "prospect-1", type: "call", outcome: "Conversation scheduled", value: 0, createdAt: now },
        { id: "activity-2", prospectId: "missing", type: "call", outcome: "Orphan", value: 0, createdAt: now },
        { id: "activity-3", prospectId: null, type: "linkedin-comment", outcome: "Useful comment", value: 0, createdAt: now },
      ],
      content: [{ id: "content-1", week: 14, title: "Inventory states", format: "photo-post", status: "draft", createdAt: now, updatedAt: now }],
    });
    expect(workspace).not.toBeNull();
    expect(workspace?.prospects[0].fitScore).toBe(5);
    expect(workspace?.activities).toHaveLength(2);
    expect(workspace?.content[0].week).toBe(12);
  });

  test("rejects incomplete workspace envelopes", () => {
    expect(normalizeMarketingWorkspace({ prospects: [], activities: [] })).toBeNull();
    expect(normalizeMarketingWorkspace(null)).toBeNull();
  });
});
