import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BellRing, ClipboardCheck, Inbox, Settings } from "lucide-react";
import { Dashboard } from "@/components/dashboard";
import { getOwnerSession } from "@/lib/owner-session";
import { countDueFollowUps } from "@/lib/contact-inquiries";

export default async function DashboardPage() {
  const session = await getOwnerSession(await headers());
  if (!session) redirect("/login?next=/dashboard");
  const dueFollowUps = await countDueFollowUps();
  return <><Dashboard />{dueFollowUps > 0 && <Link href="/dashboard/leads?due=today" className="fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-card px-3 py-2 text-xs text-amber-400 shadow-lg backdrop-blur lg:bottom-4"><BellRing className="size-4" />Follow up today · {dueFollowUps}</Link>}<Link href="/dashboard/consultations" className="fixed right-24 top-4 z-50 grid size-9 place-items-center rounded-lg border border-border bg-card/90 text-muted-foreground shadow-lg backdrop-blur transition hover:text-foreground" aria-label="Consultation playbooks"><ClipboardCheck className="size-4" /></Link><Link href="/dashboard/leads" className="fixed right-14 top-4 z-50 grid size-9 place-items-center rounded-lg border border-border bg-card/90 text-muted-foreground shadow-lg backdrop-blur transition hover:text-foreground" aria-label="Client leads"><Inbox className="size-4" /></Link><Link href="/account" className="fixed right-4 top-4 z-50 grid size-9 place-items-center rounded-lg border border-border bg-card/90 text-muted-foreground shadow-lg backdrop-blur transition hover:text-foreground" aria-label="Account and passkeys"><Settings className="size-4" /></Link></>;
}
