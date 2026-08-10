"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="grid min-h-screen place-items-center bg-background p-6 text-foreground"><div className="max-w-md text-center"><div className="mx-auto mb-5 grid size-12 place-items-center rounded-full bg-red-500/10 text-red-500"><AlertCircle /></div><h1 className="text-xl font-semibold">Command center interrupted</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Your cloud data is safe. Retry the interface, or reload to use the local offline cache.</p><Button className="mt-6" onClick={reset}><RefreshCw />Try again</Button></div></main>;
}
