import { runRetentionJob } from "../../lib/scheduled-jobs";

async function retention() {
  const result = await runRetentionJob();
  console.info(JSON.stringify({ event: "scheduled_job.completed", job: "retention", ...result }));
}

export default retention;
