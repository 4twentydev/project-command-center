"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Fingerprint, KeyRound, LoaderCircle, ShieldCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function LoginPanel() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "setup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function signInWithPasskey() {
    setBusy(true); setMessage("");
    const { error } = await authClient.signIn.passkey({
      fetchOptions: { onSuccess: () => router.push("/dashboard") },
    });
    if (error) setMessage(error.message ?? "The passkey could not be verified.");
    setBusy(false);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    if (mode === "setup") {
      const { error } = await authClient.signUp.email({ email, password, name: "4twenty" });
      if (error) setMessage(error.message ?? "The owner account could not be created.");
      else router.push("/account?enroll=1");
    } else {
      const { error } = await authClient.signIn.email({ email, password });
      if (error) setMessage(error.message ?? "Those recovery credentials were not accepted.");
      else router.push("/dashboard");
    }
    setBusy(false);
  }

  return <Card className="w-full max-w-md border-border/70 bg-card/85 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl"><CardContent className="p-7 sm:p-8">
    <div className="mb-7 flex items-start justify-between gap-4"><div><div className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary">Secure operator access</div><h1 className="mt-2 text-2xl font-semibold tracking-tight">Command Center</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Use Windows Hello or another saved passkey.</p></div><div className="grid size-11 shrink-0 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary"><ShieldCheck className="size-5" /></div></div>
    <Button className="h-12 w-full text-sm" onClick={() => void signInWithPasskey()} disabled={busy}><Fingerprint className="size-5" />Continue with a passkey</Button>
    <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.16em] text-muted-foreground"><span className="h-px flex-1 bg-border" />Recovery access<span className="h-px flex-1 bg-border" /></div>
    <form onSubmit={submit} className="space-y-3"><label className="block"><span className="mb-1.5 block text-xs text-muted-foreground">Owner email</span><input required type="email" autoComplete="username webauthn" value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" /></label><label className="block"><span className="mb-1.5 block text-xs text-muted-foreground">{mode === "setup" ? "Create recovery password" : "Recovery password"}</span><input required minLength={12} type="password" autoComplete={mode === "setup" ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" /></label>{message && <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">{message}</p>}<Button variant="outline" className="h-11 w-full" disabled={busy}>{busy ? <LoaderCircle className="animate-spin" /> : <KeyRound />}{mode === "setup" ? "Create owner account" : "Use recovery login"}</Button></form>
    <button className="mt-5 w-full text-center text-xs text-muted-foreground transition hover:text-foreground" onClick={() => { setMode(mode === "login" ? "setup" : "login"); setMessage(""); }}>{mode === "login" ? "First visit? Create the owner account" : "Already configured? Return to sign in"}</button>
  </CardContent></Card>;
}
