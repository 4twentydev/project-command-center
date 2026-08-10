import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PasskeyManager } from "@/components/passkey-manager";
import { getOwnerSession } from "@/lib/owner-session";

export default async function AccountPage() {
  const session = await getOwnerSession(await headers());
  if (!session) redirect("/login?next=/account");
  return <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-16"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,color-mix(in_oklab,var(--primary)_16%,transparent),transparent_38%)]" /><div className="relative w-full"><PasskeyManager /></div></main>;
}
