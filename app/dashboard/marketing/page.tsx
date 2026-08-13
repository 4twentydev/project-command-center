import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { MarketingOperations } from "@/components/marketing-operations";
import { emptyMarketingWorkspace } from "@/lib/marketing-workspace";
import { getMarketingWorkspace } from "@/lib/marketing-storage";
import { getOwnerSession } from "@/lib/owner-session";

export default async function MarketingPage() {
  const session = await getOwnerSession(await headers());
  if (!session) redirect("/login?next=/dashboard/marketing");
  const result = await getMarketingWorkspace()
    .then(({ workspace, updatedAt }) => ({ workspace, updatedAt, available: true }))
    .catch((error) => { console.error("Marketing workspace unavailable", error); return { workspace: emptyMarketingWorkspace, updatedAt: null, available: false }; });
  return <MarketingOperations initialWorkspace={result.workspace} initialUpdatedAt={result.updatedAt} storageAvailable={result.available} />;
}
