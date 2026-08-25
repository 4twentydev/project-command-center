"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fingerprint, LoaderCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function CommandCenterButton({ className }: { className?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handlePasskeyLaunch(event: React.MouseEvent<HTMLAnchorElement>) {
    // If user holds modifier keys (Ctrl/Cmd/Shift/Alt) to open in new tab, let native Link behavior proceed
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    try {
      const { error } = await authClient.signIn.passkey({
        fetchOptions: {
          onSuccess: () => {
            router.push("/dashboard");
          },
        },
      });

      if (error) {
        // If passkey verification fails or user cancelled, direct to login panel for fallback/recovery
        router.push("/login");
      }
    } catch {
      router.push("/login");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Link
      href="/login"
      onClick={(e) => void handlePasskeyLaunch(e)}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        busy && "opacity-80 pointer-events-none",
        className
      )}
      aria-label="Owner Command Center (Sign in with passkey)"
    >
      {busy ? (
        <LoaderCircle className="size-3.5 animate-spin text-primary" aria-hidden="true" />
      ) : (
        <Fingerprint className="size-3.5 text-primary/80" aria-hidden="true" />
      )}
      <span>Command Center</span>
    </Link>
  );
}
