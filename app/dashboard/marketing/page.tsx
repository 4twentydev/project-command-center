import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { MarketingOperations } from "@/components/marketing-operations";
import { emptyMarketingWorkspace } from "@/lib/marketing-workspace";
import { getMarketingWorkspace, getWorkspaceTimeZone } from "@/lib/marketing-storage";
import { getOwnerSession } from "@/lib/owner-session";
import { defaultTimeZone } from "@/lib/date-time";

export default async function MarketingPage() {
  const session = await getOwnerSession(await headers());
  if (!session) redirect("/login?next=/dashboard/marketing");
  const [result, timeZone] = await Promise.all([
    getMarketingWorkspace()
      .then(({ workspace, updatedAt }) => ({ workspace, updatedAt, available: true }))
      .catch((error) => { console.error("Marketing workspace unavailable", error); return { workspace: emptyMarketingWorkspace, updatedAt: null, available: false }; }),
    getWorkspaceTimeZone().catch(() => defaultTimeZone),
  ]);
  return <MarketingOperations initialWorkspace={result.workspace} initialUpdatedAt={result.updatedAt} storageAvailable={result.available} timeZone={timeZone} />;
}
