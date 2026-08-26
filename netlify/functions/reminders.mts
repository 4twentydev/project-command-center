import { runReminderJob } from "../../lib/scheduled-jobs";

async function reminders() {
  const result = await runReminderJob();
  console.info(JSON.stringify({ event: "scheduled_job.completed", job: "reminders", ...result }));
}

export default reminders;
