import type { Workspace } from "@/lib/workspace";

export type HistoryEntry = {
  label: string;
  workspace: Workspace;
  timestamp: number;
};

export type WorkspaceHistoryState = {
  past: HistoryEntry[];
  present: Workspace;
  future: HistoryEntry[];
  lastAction?: { label: string; type: "mutate" | "undo" | "redo" };
};

export function createHistoryState(initial: Workspace): WorkspaceHistoryState {
  return {
    past: [],
    present: initial,
    future: [],
  };
}

export function pushHistory(
  state: WorkspaceHistoryState,
  label: string,
  newWorkspace: Workspace,
  maxHistory = 50
): WorkspaceHistoryState {
  return {
    past: [...state.past, { label, workspace: state.present, timestamp: Date.now() }].slice(-maxHistory),
    present: newWorkspace,
    future: [],
    lastAction: { label, type: "mutate" },
  };
}

export function undoHistory(state: WorkspaceHistoryState): {
  state: WorkspaceHistoryState;
  undoneEntry?: HistoryEntry;
} {
  if (state.past.length === 0) {
    return { state };
  }
  const previous = state.past[state.past.length - 1];
  const newPast = state.past.slice(0, -1);
  return {
    state: {
      past: newPast,
      present: previous.workspace,
      future: [{ label: previous.label, workspace: state.present, timestamp: Date.now() }, ...state.future],
      lastAction: { label: `Undid: ${previous.label}`, type: "undo" },
    },
    undoneEntry: previous,
  };
}

export function redoHistory(state: WorkspaceHistoryState): {
  state: WorkspaceHistoryState;
  redoneEntry?: HistoryEntry;
} {
  if (state.future.length === 0) {
    return { state };
  }
  const next = state.future[0];
  const newFuture = state.future.slice(1);
  return {
    state: {
      past: [...state.past, { label: next.label, workspace: state.present, timestamp: Date.now() }],
      present: next.workspace,
      future: newFuture,
      lastAction: { label: `Redid: ${next.label}`, type: "redo" },
    },
    redoneEntry: next,
  };
}
