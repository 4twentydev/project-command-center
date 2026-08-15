import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Pagination } from "@/lib/pagination";

export function PaginationControls({ pagination, previousHref, nextHref, noun }: { pagination: Pagination; previousHref: string | null; nextHref: string | null; noun: string }) {
  return <nav aria-label={`${noun} pagination`} className="mt-6 flex flex-col items-center justify-between gap-3 rounded-lg border border-border bg-card/60 px-4 py-3 sm:flex-row">
    <p className="text-xs text-muted-foreground">Showing {pagination.from}–{pagination.to} of {pagination.total} {noun}</p>
    <div className="flex items-center gap-2">
      {previousHref ? <Button size="sm" variant="outline" asChild><Link href={previousHref}><ArrowLeft />Previous</Link></Button> : <Button size="sm" variant="outline" disabled><ArrowLeft />Previous</Button>}
      <span className="min-w-20 text-center font-mono text-[10px] text-muted-foreground">{pagination.page} / {pagination.totalPages}</span>
      {nextHref ? <Button size="sm" variant="outline" asChild><Link href={nextHref}>Next<ArrowRight /></Link></Button> : <Button size="sm" variant="outline" disabled>Next<ArrowRight /></Button>}
    </div>
  </nav>;
}
