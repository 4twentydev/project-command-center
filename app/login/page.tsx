import Link from "next/link";
import { LoginPanel } from "@/components/login-panel";

export default function LoginPage() {
  return <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-16"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_42%)]" /><div className="relative flex w-full flex-col items-center"><Link href="/" className="mb-7 font-mono text-xs font-semibold tracking-[0.28em]">4TWENTY<span className="text-primary">.DEV</span></Link><LoginPanel /><p className="mt-6 max-w-sm text-center text-xs leading-5 text-muted-foreground">Passkeys stay on your device or trusted password manager. 4TWENTY.DEV stores only the public credential.</p></div></main>;
}
