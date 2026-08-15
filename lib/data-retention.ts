export const workspaceSnapshotRetentionCount = 30;
export const workspaceSnapshotHistoryCount = 10;
export const archivedInquiryRetentionDays = 365;

export function archivedInquiryPurgeBefore(now = new Date()) {
  return new Date(now.getTime() - archivedInquiryRetentionDays * 24 * 60 * 60 * 1000);
}

export function archivedInquiryDeleteAfter(archivedAt: string | Date) {
  const archived = archivedAt instanceof Date ? archivedAt : new Date(archivedAt);
  return new Date(archived.getTime() + archivedInquiryRetentionDays * 24 * 60 * 60 * 1000);
}
