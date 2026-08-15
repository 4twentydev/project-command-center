type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export type WorkspaceSnapshotResult =
  | { status: "created"; id: string; createdAt: string }
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
    const result = payload && typeof payload === "object" ? payload as { id?: unknown; createdAt?: unknown } : null;
    if (!result || typeof result.id !== "string" || !/^[1-9]\d*$/.test(result.id) || typeof result.createdAt !== "string" || Number.isNaN(Date.parse(result.createdAt))) return { status: "invalid-response" };
    return { status: "created", id: result.id, createdAt: result.createdAt };
  } catch {
    return { status: "invalid-response" };
  }
}

export type WorkspaceSnapshotRestoreResult =
  | { status: "restored"; workspace: unknown; updatedAt: string; safetySnapshot: { id: string; createdAt: string } }
  | { status: "authentication-required" }
  | { status: "snapshot-not-found" }
  | { status: "snapshot-not-restorable" }
  | { status: "storage-unavailable" }
  | { status: "request-failed" }
  | { status: "invalid-response" };

export async function requestWorkspaceSnapshotRestore(snapshotId: string, fetcher: Fetcher = fetch): Promise<WorkspaceSnapshotRestoreResult> {
  let response: Response;
  try {
    response = await fetcher("/api/workspace", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ snapshotId }),
    });
  } catch {
    return { status: "request-failed" };
  }

  if (response.status === 401 || response.status === 403) return { status: "authentication-required" };
  if (response.status === 404) return { status: "snapshot-not-found" };
  if (response.status === 409) return { status: "snapshot-not-restorable" };
  if (response.status >= 500) return { status: "storage-unavailable" };
  if (!response.ok) return { status: "request-failed" };

  try {
    const payload: unknown = await response.json();
    const result = payload && typeof payload === "object" ? payload as { workspace?: unknown; updatedAt?: unknown; safetySnapshot?: { id?: unknown; createdAt?: unknown } } : null;
    const safetySnapshot = result?.safetySnapshot;
    if (!result || !result.workspace || typeof result.workspace !== "object" || typeof result.updatedAt !== "string" || Number.isNaN(Date.parse(result.updatedAt)) || !safetySnapshot || typeof safetySnapshot.id !== "string" || !/^[1-9]\d*$/.test(safetySnapshot.id) || typeof safetySnapshot.createdAt !== "string" || Number.isNaN(Date.parse(safetySnapshot.createdAt))) return { status: "invalid-response" };
    return { status: "restored", workspace: result.workspace, updatedAt: result.updatedAt, safetySnapshot: { id: safetySnapshot.id, createdAt: safetySnapshot.createdAt } };
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
