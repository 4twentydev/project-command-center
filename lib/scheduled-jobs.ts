import { neon } from "@neondatabase/serverless";
import { archivedInquiryPurgeBefore, workspaceSnapshotRetentionCount } from "@/lib/data-retention";
import { withOperationTimeout } from "@/lib/operational-observability";
import { sendPush, type StoredPushSubscription } from "@/lib/push";
import { createReminderPlan, deliverReminderNotifications } from "@/lib/reminder-delivery";
import { parseWorkspace } from "@/lib/workspace-validation";

function databaseUrl() {
  const value = process.env.DATABASE_URL;
  if (!value) throw new Error("Database unavailable");
  return value;
}

export async function runReminderJob() {
  const sql = neon(databaseUrl());
  const [workspaceRows, subscriptionRows] = await withOperationTimeout(Promise.all([
    sql`SELECT data FROM workspaces WHERE id = 'primary' LIMIT 1`,
    sql`SELECT endpoint, subscription FROM push_subscriptions`,
  ]));
  if (!workspaceRows.length || !subscriptionRows.length) return { ok: true, sent: 0, failed: 0, removed: 0, tasks: 0 };

  const workspace = parseWorkspace(workspaceRows[0].data);
  if (!workspace) throw new Error("Workspace data is invalid");
  const plan = createReminderPlan(workspace);
  if (!plan) return { ok: true, sent: 0, failed: 0, removed: 0, tasks: 0 };

  const result = await deliverReminderNotifications(
    subscriptionRows.map((row) => ({ endpoint: String(row.endpoint), subscription: row.subscription as StoredPushSubscription })),
    plan.notification,
    { send: sendPush, remove: (endpoint) => withOperationTimeout(sql`DELETE FROM push_subscriptions WHERE endpoint = ${endpoint}`) },
  );
  return { ok: result.failed === 0, ...result, tasks: plan.taskCount, date: plan.date };
}

export async function runRetentionJob() {
  const sql = neon(databaseUrl());
  const purgeBefore = archivedInquiryPurgeBefore().toISOString();
  const [inquiries, snapshots] = await withOperationTimeout(Promise.all([
    sql`DELETE FROM contact_inquiries WHERE status = 'archived' AND archived_at < ${purgeBefore}::timestamptz RETURNING id`,
    sql`
      DELETE FROM workspace_snapshots
      WHERE id IN (
        SELECT id FROM workspace_snapshots
        WHERE workspace_id = 'primary'
        ORDER BY created_at DESC, id DESC
        OFFSET ${workspaceSnapshotRetentionCount}
      )
      RETURNING id
    `,
  ]));
  return { ok: true, inquiriesPurged: inquiries.length, snapshotsPurged: snapshots.length };
}
