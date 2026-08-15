import { describe, expect, test } from "bun:test";
import {
  archivedInquiryPurgeBefore,
  archivedInquiryDeleteAfter,
  archivedInquiryRetentionDays,
  workspaceSnapshotHistoryCount,
  workspaceSnapshotRetentionCount,
} from "@/lib/data-retention";

describe("data retention policy", () => {
  test("keeps more snapshots than are shown in recovery history", () => {
    expect(workspaceSnapshotRetentionCount).toBe(30);
    expect(workspaceSnapshotHistoryCount).toBe(10);
    expect(workspaceSnapshotRetentionCount).toBeGreaterThan(workspaceSnapshotHistoryCount);
  });

  test("purges inquiries only after a full archived retention year", () => {
    const now = new Date("2028-03-01T12:00:00.000Z");
    expect(archivedInquiryRetentionDays).toBe(365);
    expect(archivedInquiryPurgeBefore(now).toISOString()).toBe("2027-03-02T12:00:00.000Z");
    expect(archivedInquiryDeleteAfter("2027-03-02T12:00:00.000Z").toISOString()).toBe(now.toISOString());
  });
});
