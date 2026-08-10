"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Fingerprint, LoaderCircle, LogOut, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Passkey = { id: string; name?: string | null; createdAt?: Date | string | null };

export function PasskeyManager() {
  const router = useRouter();
  const [keys, setKeys] = useState<Passkey[]>([]); const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  async function load() { const result = await authClient.passkey.listUserPasskeys(); setKeys((result.data ?? []) as Passkey[]); }
  useEffect(() => { let active = true; void authClient.passkey.listUserPasskeys().then((result) => { if (active) setKeys((result.data ?? []) as Passkey[]); }); return () => { active = false; }; }, []);
  async function add() { setBusy(true); setMessage(""); const { error } = await authClient.passkey.addPasskey({ name: keys.length ? "Backup passkey" : "Primary passkey" }); if (error) setMessage(error.message ?? "Passkey enrollment failed."); else { setMessage("Passkey added. You can now use it from the login screen."); await load(); } setBusy(false); }
  async function remove(id: string) { if (keys.length < 2) { setMessage("Add a backup passkey before removing your only passkey."); return; } setBusy(true); const { error } = await authClient.passkey.deletePasskey({ id }); if (error) setMessage(error.message ?? "Passkey removal failed."); else await load(); setBusy(false); }
  return <div className="w-full max-w-2xl space-y-4"><Card className="border-border/70"><CardContent className="p-6 sm:p-8"><div className="flex items-start justify-between gap-4"><div><div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">Identity control</div><h1 className="mt-2 text-2xl font-semibold">Your passkeys</h1><p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">Make Windows Hello your primary key, then add your phone or password manager as a recovery key.</p></div><div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><ShieldCheck /></div></div><div className="mt-7 space-y-2">{keys.length ? keys.map((key) => <div key={key.id} className="flex items-center gap-3 rounded-xl border border-border bg-background/60 p-3"><div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary"><Fingerprint className="size-4" /></div><div className="min-w-0 flex-1"><div className="text-sm font-medium">{key.name || "Passkey"}</div><div className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{key.createdAt ? `Added ${new Date(key.createdAt).toLocaleDateString()}` : "Registered credential"}</div></div><Button variant="ghost" size="icon" onClick={() => void remove(key.id)} disabled={busy} aria-label="Remove passkey"><Trash2 /></Button></div>) : <div className="grid min-h-28 place-items-center rounded-xl border border-dashed border-border text-center text-sm text-muted-foreground">No passkey enrolled yet.</div>}</div>{message && <p className="mt-4 rounded-lg border border-border bg-secondary px-3 py-2 text-xs text-muted-foreground">{message}</p>}<div className="mt-6 flex flex-col gap-2 sm:flex-row"><Button onClick={() => void add()} disabled={busy}>{busy ? <LoaderCircle className="animate-spin" /> : <Plus />}Add passkey</Button><Button variant="outline" asChild><a href="/dashboard">Continue to dashboard</a></Button><Button variant="ghost" className="sm:ml-auto" onClick={() => void authClient.signOut({ fetchOptions: { onSuccess: () => router.push("/") } })}><LogOut />Sign out</Button></div></CardContent></Card></div>;
}
