import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BellOff, BellRing } from "lucide-react";
import { Dashboard } from "@/components/dashboard";
import { getOwnerSession } from "@/lib/owner-session";
import { getDashboardDueFollowUps } from "@/lib/dashboard-data";

export default async function DashboardPage() {
  const session = await getOwnerSession(await headers());
  if (!session) redirect("/login?next=/dashboard");
  const dueFollowUps = await getDashboardDueFollowUps();
  return (
    <>
      <Dashboard />
      {dueFollowUps === null ? (
        <Link href="/dashboard/leads" className="fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground shadow-lg backdrop-blur lg:bottom-4">
          <BellOff className="size-4" />Follow-up count unavailable
        </Link>
      ) : dueFollowUps > 0 ? (
        <Link href="/dashboard/leads?due=today" className="fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-card px-3 py-2 text-xs text-amber-400 shadow-lg backdrop-blur lg:bottom-4">
          <BellRing className="size-4" />Follow up today · {dueFollowUps}
        </Link>
      ) : null}
    </>
  );
}

