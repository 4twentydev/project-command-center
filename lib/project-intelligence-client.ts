export type ProjectIntelligence = {
  github: null | { available: boolean; private?: boolean; defaultBranch?: string; openIssues?: number; pushedAt?: string; latestCommit?: null | { sha: string; message: string; url: string; date?: string }; pullRequests?: Array<{ number: number; title: string; url: string; draft: boolean; updatedAt: string }>; issues?: Array<{ number: number; title: string; url: string; updatedAt: string }> };
  vercel: null | { reachable: boolean; state: string | null; target?: string | null; createdAt?: number; url: string; checkedAt: string };
  fetchedAt: string;
};

export type ProjectIntelligenceEntry = {
  data?: ProjectIntelligence;
  status: "refreshing" | "fresh" | "stale" | "error";
};

type LinkedProject = { id: string; repo?: string; deployment?: string };
type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validGitHub(value: unknown) {
  if (value === null) return true;
  if (!isRecord(value) || typeof value.available !== "boolean") return false;
  if (value.latestCommit !== undefined && value.latestCommit !== null && (!isRecord(value.latestCommit) || typeof value.latestCommit.sha !== "string" || typeof value.latestCommit.message !== "string" || typeof value.latestCommit.url !== "string")) return false;
  if (value.pullRequests !== undefined && (!Array.isArray(value.pullRequests) || !value.pullRequests.every((item) => isRecord(item) && typeof item.number === "number" && typeof item.title === "string" && typeof item.url === "string" && typeof item.draft === "boolean" && typeof item.updatedAt === "string"))) return false;
  if (value.issues !== undefined && (!Array.isArray(value.issues) || !value.issues.every((item) => isRecord(item) && typeof item.number === "number" && typeof item.title === "string" && typeof item.url === "string" && typeof item.updatedAt === "string"))) return false;
  return true;
}

function validVercel(value: unknown) {
  return value === null || isRecord(value) && typeof value.reachable === "boolean" && (typeof value.state === "string" || value.state === null) && typeof value.url === "string" && typeof value.checkedAt === "string";
}

export function parseProjectIntelligence(value: unknown): ProjectIntelligence | null {
  if (!isRecord(value) || !validGitHub(value.github) || !validVercel(value.vercel) || typeof value.fetchedAt !== "string" || Number.isNaN(Date.parse(value.fetchedAt))) return null;
  return value as ProjectIntelligence;
}

export async function fetchProjectIntelligence(project: LinkedProject, fetcher: Fetcher = fetch) {
  const params = new URLSearchParams();
  if (project.repo) params.set("repo", project.repo);
  if (project.deployment) params.set("deployment", project.deployment);
  const response = await fetcher(`/api/project-status?${params}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Project intelligence request failed");
  const intelligence = parseProjectIntelligence(await response.json());
  if (!intelligence) throw new Error("Project intelligence response was invalid");
  return intelligence;
}

export function markProjectIntelligenceRefreshing(current: Record<string, ProjectIntelligenceEntry>, projectIds: string[]) {
  const next = { ...current };
  for (const id of projectIds) next[id] = { ...current[id], status: "refreshing" };
  return next;
}

export function mergeProjectIntelligenceResults(
  current: Record<string, ProjectIntelligenceEntry>,
  projectIds: string[],
  results: PromiseSettledResult<ProjectIntelligence>[],
) {
  const next = { ...current };
  projectIds.forEach((id, index) => {
    const result = results[index];
    if (result?.status === "fulfilled") next[id] = { data: result.value, status: "fresh" };
    else next[id] = current[id]?.data ? { data: current[id].data, status: "stale" } : { status: "error" };
  });
  return next;
}
