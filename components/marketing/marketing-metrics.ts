import { addDaysToDateKey, dateKeyInTimeZone, daysBetweenDateKeys, isValidDateKey } from "@/lib/date-time";
import type { MarketingContentItem, MarketingProspect, MarketingWorkspace } from "@/lib/marketing-workspace";

export function newProspect(): MarketingProspect {
  const now = new Date().toISOString();
  return { id: crypto.randomUUID(), company: "", website: "", contactName: "", contactTitle: "", email: "", phone: "", location: "", segment: "cnc-sign-fabrication", stage: "target", source: "direct-outreach", operationalSignals: "", fitScore: 3, nextAction: "", nextActionAt: "", notes: "", createdAt: now, updatedAt: now };
}

export function newContentItem(week: number): MarketingContentItem {
  const now = new Date().toISOString();
  return { id: crypto.randomUUID(), week, title: "", format: "linkedin-post", status: "idea", asset: "", cta: "Book a free 20-minute fit call", result: "", publishAt: "", createdAt: now, updatedAt: now };
}

function weekBounds(campaignStart: string, week: number) {
  if (!isValidDateKey(campaignStart)) return null;
  const start = addDaysToDateKey(campaignStart, (week - 1) * 7);
  const end = addDaysToDateKey(start, 7);
  return { start, end };
}

function inWeek(value: string, campaignStart: string, week: number, timeZone: string) {
  const bounds = weekBounds(campaignStart, week);
  if (!bounds || !value) return false;
  const instant = new Date(value);
  const dateKey = isValidDateKey(value) ? value : Number.isNaN(instant.getTime()) ? "" : dateKeyInTimeZone(instant, timeZone);
  return dateKey >= bounds.start && dateKey < bounds.end;
}

export function campaignWeek(campaignStart: string, today: string) {
  if (!isValidDateKey(campaignStart)) return 1;
  return Math.max(1, Math.min(12, Math.floor(daysBetweenDateKeys(campaignStart, today) / 7) + 1));
}

export function scoreFor(workspace: MarketingWorkspace, week: number, timeZone: string) {
  const activities = workspace.activities.filter((activity) => inWeek(activity.createdAt, workspace.campaignStart, week, timeZone));
  return {
    accounts: workspace.prospects.filter((prospect) => inWeek(prospect.createdAt, workspace.campaignStart, week, timeZone)).length,
    outreach: activities.filter((item) => ["call", "voicemail", "email", "linkedin"].includes(item.type)).length,
    conversations: activities.filter((item) => item.type === "conversation").length,
    fitCalls: activities.filter((item) => item.type === "fit-call").length,
    visits: activities.filter((item) => item.type === "visit").length,
    comments: activities.filter((item) => item.type === "linkedin-comment").length,
    paidAudits: activities.filter((item) => item.type === "audit-paid").length,
    paidClients: activities.filter((item) => item.type === "client-won").length,
    bookedRevenue: activities.filter((item) => ["audit-paid", "client-won"].includes(item.type)).reduce((sum, item) => sum + item.value, 0),
    posts: workspace.content.filter((item) => item.status === "published" && inWeek(item.publishAt || item.updatedAt, workspace.campaignStart, week, timeZone)).length,
  };
}

export type MarketingScore = ReturnType<typeof scoreFor>;
