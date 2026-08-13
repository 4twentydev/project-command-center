import type { ContentStatus, MarketingActivityType, MarketingFunnelStage, MarketingSource, ProspectSegment } from "@/lib/marketing-plan";
import { contentStatuses, launchWeeks, marketingActivityTypes, marketingFunnelStages, marketingSources, prospectSegments } from "@/lib/marketing-plan";

export type MarketingProspect = {
  id: string;
  company: string;
  website: string;
  contactName: string;
  contactTitle: string;
  email: string;
  phone: string;
  location: string;
  segment: ProspectSegment;
  stage: MarketingFunnelStage;
  source: MarketingSource;
  operationalSignals: string;
  fitScore: number;
  nextAction: string;
  nextActionAt: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type MarketingActivity = {
  id: string;
  prospectId: string | null;
  type: MarketingActivityType;
  outcome: string;
  value: number;
  createdAt: string;
};

export type MarketingContentItem = {
  id: string;
  week: number;
  title: string;
  format: "linkedin-post" | "photo-post" | "case-note" | "collateral";
  status: ContentStatus;
  asset: string;
  cta: string;
  result: string;
  publishAt: string;
  createdAt: string;
  updatedAt: string;
};

export type MarketingWorkspace = {
  campaignStart: string;
  prospects: MarketingProspect[];
  activities: MarketingActivity[];
  content: MarketingContentItem[];
};

export const emptyMarketingWorkspace: MarketingWorkspace = { campaignStart: "", prospects: [], activities: [], content: [] };

export function beginMarketingCampaign(workspace: MarketingWorkspace, dateValue = new Date()) {
  const now = dateValue.toISOString();
  const existingWeeks = new Set(workspace.content.map((item) => item.week));
  const seededContent = launchWeeks.filter((week) => !existingWeeks.has(week.week)).map((week) => ({
    id: crypto.randomUUID(), week: week.week, title: week.content, format: "linkedin-post" as const,
    status: "idea" as const, asset: "", cta: "Book a free 20-minute fit call", result: "", publishAt: "",
    createdAt: now, updatedAt: now,
  }));
  return { ...workspace, campaignStart: now.slice(0, 10), content: [...workspace.content, ...seededContent].toSorted((a, b) => a.week - b.week) };
}

function array(value: unknown) { return Array.isArray(value) ? value : []; }
function text(value: unknown, max = 5000) { return typeof value === "string" ? value.slice(0, max) : ""; }
function date(value: unknown) { const result = text(value, 30); return !result || /^\d{4}-\d{2}-\d{2}(T.*)?$/.test(result) ? result : ""; }
function choice<T extends readonly string[]>(value: unknown, choices: T, fallback: T[number]) { return choices.includes(value as T[number]) ? value as T[number] : fallback; }

export function normalizeMarketingWorkspace(value: unknown): MarketingWorkspace | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  if (!Array.isArray(candidate.prospects) || !Array.isArray(candidate.activities) || !Array.isArray(candidate.content)) return null;
  const prospects = array(candidate.prospects).slice(0, 1000).flatMap((raw) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
    const item = raw as Record<string, unknown>;
    const id = text(item.id, 80); const company = text(item.company, 200).trim();
    if (!id || !company) return [];
    return [{
      id, company, website: text(item.website, 500), contactName: text(item.contactName, 160), contactTitle: text(item.contactTitle, 160),
      email: text(item.email, 320), phone: text(item.phone, 80), location: text(item.location, 200),
      segment: choice(item.segment, prospectSegments, "other"), stage: choice(item.stage, marketingFunnelStages, "target"),
      source: choice(item.source, marketingSources, "direct-outreach"), operationalSignals: text(item.operationalSignals),
      fitScore: Math.max(1, Math.min(5, Number(item.fitScore) || 1)), nextAction: text(item.nextAction, 1000),
      nextActionAt: date(item.nextActionAt), notes: text(item.notes), createdAt: date(item.createdAt) || new Date().toISOString(),
      updatedAt: date(item.updatedAt) || new Date().toISOString(),
    } satisfies MarketingProspect];
  });
  const prospectIds = new Set(prospects.map((prospect) => prospect.id));
  const activities = array(candidate.activities).slice(0, 5000).flatMap((raw) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
    const item = raw as Record<string, unknown>;
    const id = text(item.id, 80); const prospectId = item.prospectId === null || item.prospectId === undefined ? null : text(item.prospectId, 80);
    if (!id || (prospectId !== null && !prospectIds.has(prospectId))) return [];
    return [{ id, prospectId, type: choice(item.type, marketingActivityTypes, "note"), outcome: text(item.outcome), value: Math.max(0, Number(item.value) || 0), createdAt: date(item.createdAt) || new Date().toISOString() } satisfies MarketingActivity];
  });
  const content = array(candidate.content).slice(0, 500).flatMap((raw) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
    const item = raw as Record<string, unknown>; const id = text(item.id, 80); const title = text(item.title, 300).trim();
    if (!id || !title) return [];
    const format = choice(item.format, ["linkedin-post", "photo-post", "case-note", "collateral"] as const, "linkedin-post");
    return [{ id, week: Math.max(1, Math.min(12, Number(item.week) || 1)), title, format, status: choice(item.status, contentStatuses, "idea"), asset: text(item.asset, 1000), cta: text(item.cta, 1000), result: text(item.result, 2000), publishAt: date(item.publishAt), createdAt: date(item.createdAt) || new Date().toISOString(), updatedAt: date(item.updatedAt) || new Date().toISOString() } satisfies MarketingContentItem];
  });
  return { campaignStart: date(candidate.campaignStart), prospects, activities, content };
}
