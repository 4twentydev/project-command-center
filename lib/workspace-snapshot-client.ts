type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export type WorkspaceSnapshotResult =
  | { status: "created"; createdAt: string }
  | { status: "authentication-required" }
  | { status: "workspace-not-saved" }
  | { status: "storage-unavailable" }
  | { status: "request-failed" }
  | { status: "invalid-response" };

export async function requestWorkspaceSnapshot(fetcher: Fetcher = fetch): Promise<WorkspaceSnapshotResult> {
  let response: Response;
  try {
    response = await fetcher("/api/workspace", { method: "POST" });
  } catch {
    return { status: "request-failed" };
  }

  if (response.status === 401 || response.status === 403) return { status: "authentication-required" };
  if (response.status === 409) return { status: "workspace-not-saved" };
  if (response.status >= 500) return { status: "storage-unavailable" };
  if (!response.ok) return { status: "request-failed" };

  try {
    const payload: unknown = await response.json();
    const createdAt = payload && typeof payload === "object" && "createdAt" in payload ? (payload as { createdAt?: unknown }).createdAt : null;
    if (typeof createdAt !== "string" || Number.isNaN(Date.parse(createdAt))) return { status: "invalid-response" };
    return { status: "created", createdAt };
  } catch {
    return { status: "invalid-response" };
  }
}

export function createWorkspaceSnapshotRequester(fetcher: Fetcher = fetch) {
  let pending: Promise<WorkspaceSnapshotResult> | null = null;
  return () => {
    if (pending) return pending;
    pending = requestWorkspaceSnapshot(fetcher).finally(() => { pending = null; });
    return pending;
  };
}
