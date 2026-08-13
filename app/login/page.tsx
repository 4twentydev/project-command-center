import { BrandMark } from "@/components/brand-mark";
import { LoginPanel } from "@/components/login-panel";
import { brand } from "@/lib/brand";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const requestedPath = (await searchParams).next;
  const privateDestinations = ["/dashboard", "/dashboard/leads", "/dashboard/consultations", "/dashboard/marketing", "/dashboard/marketing/one-sheet", "/account"] as const;
  const nextPath = privateDestinations.find((path) => path === requestedPath) ?? "/dashboard";
  return <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-16"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_42%)]" /><div className="relative flex w-full flex-col items-center"><BrandMark showDescriptor={false} className="mb-7" /><LoginPanel nextPath={nextPath} allowSetup={process.env.ALLOW_OWNER_SIGNUP === "true"} /><p className="mt-6 max-w-sm text-center text-xs leading-5 text-muted-foreground">Passkeys stay on your device or trusted password manager. {brand.name} stores only the public credential.</p></div></main>;
}
