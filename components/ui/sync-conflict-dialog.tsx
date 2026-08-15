import { CloudDownload, Download, RefreshCw, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type ConflictComparison = { label: string; local: string | number; cloud: string | number };

export function SyncConflictDialog({
  title,
  comparisons,
  cloudUpdatedAt,
  loading,
  resolving,
  error,
  onRetry,
  onUseCloud,
  onKeepLocal,
  onExportLocal,
}: {
  title: string;
  comparisons: ConflictComparison[];
  cloudUpdatedAt: string | null;
  loading: boolean;
  resolving: boolean;
  error: string | null;
  onRetry: () => void;
  onUseCloud: () => void;
  onKeepLocal: () => void;
  onExportLocal: () => void;
}) {
  const cloudReady = !loading && !error;
  return <div className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-background/90 p-4 backdrop-blur-sm"><Card className="my-6 w-full max-w-2xl shadow-2xl"><CardContent className="p-5 sm:p-6"><div className="font-mono text-[9px] uppercase tracking-[0.2em] text-amber-500">Cloud conflict</div><h2 className="mt-2 text-xl font-semibold">{title}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Automatic cloud writes are paused. Your local copy is preserved until you choose which version should continue.</p>
    {loading ? <div role="status" className="mt-6 flex min-h-28 items-center justify-center gap-2 rounded-xl border border-border bg-background/50 text-sm text-muted-foreground"><RefreshCw className="size-4 animate-spin" />Loading the current cloud copy…</div> : error ? <div role="alert" className="mt-6 rounded-xl border border-red-500/25 bg-red-500/5 p-4 text-sm"><p>{error}</p><Button className="mt-4" variant="outline" onClick={onRetry} disabled={resolving}><RefreshCw />Retry cloud read</Button></div> : <><div className="mt-6 overflow-hidden rounded-xl border border-border"><div className="grid grid-cols-[1fr_90px_90px] bg-secondary/60 px-4 py-2 font-mono text-[9px] uppercase tracking-wider text-muted-foreground"><span>Data</span><span className="text-right">Local</span><span className="text-right">Cloud</span></div>{comparisons.map((item) => <div key={item.label} className="grid grid-cols-[1fr_90px_90px] border-t border-border px-4 py-3 text-sm"><span>{item.label}</span><span className="text-right font-medium">{item.local}</span><span className="text-right font-medium">{item.cloud}</span></div>)}</div>{cloudUpdatedAt && <p className="mt-3 text-right font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Cloud updated {new Date(cloudUpdatedAt).toLocaleString()}</p>}</>}
    <div className="mt-6 grid gap-2 sm:grid-cols-3"><Button variant="outline" onClick={onExportLocal} disabled={resolving}><Download />Export local</Button><Button variant="outline" onClick={onUseCloud} disabled={!cloudReady || resolving}><CloudDownload />Use cloud</Button><Button onClick={onKeepLocal} disabled={!cloudReady || resolving}><UploadCloud />{resolving ? "Resolving…" : "Keep local"}</Button></div><p className="mt-3 text-xs leading-5 text-muted-foreground"><strong className="text-foreground">Use cloud</strong> replaces this tab’s local copy. <strong className="text-foreground">Keep local</strong> writes this tab’s copy only if the cloud version shown above has not changed again.</p></CardContent></Card></div>;
}
