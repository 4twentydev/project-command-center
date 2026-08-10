import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Settings } from "lucide-react";
import { Dashboard } from "@/components/dashboard";
import { getOwnerSession } from "@/lib/owner-session";

export default async function DashboardPage() {
  const session = await getOwnerSession(await headers());
  if (!session) redirect("/login?next=/dashboard");
  return <><Dashboard /><Link href="/account" className="fixed right-4 top-4 z-50 grid size-9 place-items-center rounded-lg border border-border bg-card/90 text-muted-foreground shadow-lg backdrop-blur transition hover:text-foreground" aria-label="Account and passkeys"><Settings className="size-4" /></Link></>;
}
