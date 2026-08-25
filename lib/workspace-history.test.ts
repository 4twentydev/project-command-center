import { describe, expect, test } from "bun:test";
import {
  createHistoryState,
  pushHistory,
  undoHistory,
  redoHistory,
} from "@/lib/workspace-history";
import type { Workspace } from "@/lib/workspace";

describe("workspace history (undo/redo engine)", () => {
  const emptyWorkspace: Workspace = {
    projects: [],
    tasks: [],
    activity: [],
    inbox: [],
    notes: [],
    reviews: [],
  };

  const workspaceWithTask: Workspace = {
    ...emptyWorkspace,
    tasks: [
      {
        id: "task-1",
        title: "Initial Task",
        done: false,
        createdAt: "2026-08-24T12:00:00Z",
      },
    ],
  };

  const workspaceWithCompletedTask: Workspace = {
    ...emptyWorkspace,
    tasks: [
      {
        id: "task-1",
        title: "Initial Task",
        done: true,
        completedAt: "2026-08-24T12:05:00Z",
        createdAt: "2026-08-24T12:00:00Z",
      },
    ],
  };

  test("initial state has empty past and future", () => {
    const history = createHistoryState(emptyWorkspace);
    expect(history.past.length).toBe(0);
    expect(history.future.length).toBe(0);
    expect(history.present).toBe(emptyWorkspace);
  });

  test("pushHistory appends previous state to past and clears future", () => {
    let history = createHistoryState(emptyWorkspace);
    history = pushHistory(history, "Added task", workspaceWithTask);

    expect(history.past.length).toBe(1);
    expect(history.past[0].label).toBe("Added task");
    expect(history.past[0].workspace).toBe(emptyWorkspace);
    expect(history.present.tasks.length).toBe(1);
    expect(history.future.length).toBe(0);
  });

  test("undo restores previous workspace and pushes current into future", () => {
    let history = createHistoryState(emptyWorkspace);
    history = pushHistory(history, "Added task", workspaceWithTask);
    history = pushHistory(history, "Completed task", workspaceWithCompletedTask);

    expect(history.past.length).toBe(2);
    expect(history.present.tasks[0].done).toBe(true);

    // Undo 1: Reverts completion
    const undo1 = undoHistory(history);
    expect(undo1.undoneEntry?.label).toBe("Completed task");
    expect(undo1.state.present.tasks[0].done).toBe(false);
    expect(undo1.state.past.length).toBe(1);
    expect(undo1.state.future.length).toBe(1);

    // Undo 2: Reverts addition
    const undo2 = undoHistory(undo1.state);
    expect(undo2.undoneEntry?.label).toBe("Added task");
    expect(undo2.state.present.tasks.length).toBe(0);
    expect(undo2.state.past.length).toBe(0);
    expect(undo2.state.future.length).toBe(2);

    // Undo on empty past is a no-op
    const undo3 = undoHistory(undo2.state);
    expect(undo3.undoneEntry).toBeUndefined();
    expect(undo3.state.present.tasks.length).toBe(0);
  });

  test("redo restores forward workspace and moves state back into past", () => {
    let history = createHistoryState(emptyWorkspace);
    history = pushHistory(history, "Added task", workspaceWithTask);
    history = pushHistory(history, "Completed task", workspaceWithCompletedTask);

    const afterUndo = undoHistory(history).state;
    expect(afterUndo.present.tasks[0].done).toBe(false);

    const redo1 = redoHistory(afterUndo);
    expect(redo1.redoneEntry?.label).toBe("Completed task");
    expect(redo1.state.present.tasks[0].done).toBe(true);
    expect(redo1.state.past.length).toBe(2);
    expect(redo1.state.future.length).toBe(0);
  });

  test("pushing new action after undo discards divergent future", () => {
    let history = createHistoryState(emptyWorkspace);
    history = pushHistory(history, "Added task", workspaceWithTask);
    history = pushHistory(history, "Completed task", workspaceWithCompletedTask);

    // Undo completion
    history = undoHistory(history).state;
    expect(history.future.length).toBe(1);

    // Make new branch of edits
    const divergentWorkspace: Workspace = {
      ...workspaceWithTask,
      tasks: [{ id: "task-2", title: "New Divergent Task", done: false, createdAt: "2026-08-24T12:10:00Z" }],
    };
    history = pushHistory(history, "Created different task", divergentWorkspace);

    expect(history.future.length).toBe(0);
    expect(history.past.length).toBe(2);
    expect(history.present.tasks[0].title).toBe("New Divergent Task");
  });

  test("clamps history past capacity to maxHistory limit", () => {
    let history = createHistoryState(emptyWorkspace);
    for (let i = 1; i <= 60; i++) {
      const nextWs: Workspace = {
        ...emptyWorkspace,
        tasks: [{ id: `task-${i}`, title: `Task ${i}`, done: false, createdAt: "2026-08-24T12:00:00Z" }],
      };
      history = pushHistory(history, `Action ${i}`, nextWs, 50);
    }

    expect(history.past.length).toBe(50);
    expect(history.past[history.past.length - 1].label).toBe("Action 60");
    expect(history.present.tasks[0].title).toBe("Task 60");
  });
});
