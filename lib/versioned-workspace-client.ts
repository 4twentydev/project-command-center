type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export type VersionedWorkspaceRead<T> =
  | { status: "loaded"; workspace: T | null; updatedAt: string | null }
  | { status: "error" };

export type VersionedWorkspaceSave =
  | { status: "saved"; updatedAt: string | null }
  | { status: "conflict" }
  | { status: "error" };

export async function readVersionedWorkspace<T>(
  endpoint: string,
  parse: (value: unknown) => T | null,
  fetcher: Fetcher = fetch,
): Promise<VersionedWorkspaceRead<T>> {
  try {
    const response = await fetcher(endpoint, { cache: "no-store" });
    if (!response.ok) return { status: "error" };
    const payload: unknown = await response.json();
    if (!payload || typeof payload !== "object" || !("workspace" in payload)) return { status: "error" };
    const value = (payload as { workspace?: unknown }).workspace;
    const workspace = value === null ? null : parse(value);
    if (value !== null && !workspace) return { status: "error" };
    const updatedAt = (payload as { updatedAt?: unknown }).updatedAt;
    return { status: "loaded", workspace, updatedAt: typeof updatedAt === "string" ? updatedAt : null };
  } catch {
    return { status: "error" };
  }
}

export async function saveVersionedWorkspace(
  endpoint: string,
  workspace: unknown,
  expectedVersion: string | null,
  fetcher: Fetcher = fetch,
): Promise<VersionedWorkspaceSave> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (expectedVersion) headers["X-Workspace-Version"] = expectedVersion;
  try {
    const response = await fetcher(endpoint, { method: "PUT", headers, body: JSON.stringify(workspace) });
    if (response.status === 409) return { status: "conflict" };
    if (!response.ok) return { status: "error" };
    const payload: unknown = await response.json();
    const updatedAt = payload && typeof payload === "object" && "updatedAt" in payload ? (payload as { updatedAt?: unknown }).updatedAt : null;
    return { status: "saved", updatedAt: typeof updatedAt === "string" ? updatedAt : null };
  } catch {
    return { status: "error" };
  }
}
