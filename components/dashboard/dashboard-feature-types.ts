import type { Workspace } from "@/lib/workspace";

export type ComposerMode = "project" | "task" | "idea" | null;
export type Confirmation = { title: string; message: string; actionLabel: string; onConfirm: () => void };
export type ImportCandidate = { id: string; name: string; description: string; repo: string; deployment?: string; stack: string[]; private: boolean; pushedAt: string; vercelProject?: string };
export type UndoState = { label: string; workspace: Workspace };
