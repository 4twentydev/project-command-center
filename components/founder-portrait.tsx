import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { founder } from "@/lib/founder";
import { cn } from "@/lib/utils";

export function FounderPortrait({ compact = false, priority = false, className }: { compact?: boolean; priority?: boolean; className?: string }) {
  const filePath = join(process.cwd(), "public", ...founder.portrait.publicPath.split("/").filter(Boolean));
  const hasApprovedPhoto = existsSync(filePath);

  return <figure className={cn("relative", className)}>
    <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-border bg-card">
      {hasApprovedPhoto ? <Image src={founder.portrait.publicPath} alt={founder.portrait.alt} fill sizes={compact ? "(max-width: 768px) 45vw, 280px" : "(max-width: 1024px) 90vw, 420px"} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} className="object-cover object-[center_35%]" /> : <div role="img" aria-label="Neutral placeholder for Brandon York’s approved founder photograph" className="absolute inset-0 grid place-items-center overflow-hidden bg-[linear-gradient(145deg,color-mix(in_oklab,var(--card)_90%,var(--primary)),var(--background))]">
        <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:32px_32px]" />
        <div className="relative text-center"><div className={cn("mx-auto grid rounded-full border border-primary/25 bg-primary/10 text-primary", compact ? "size-16" : "size-24")}><ImageIcon className={cn("m-auto", compact ? "size-5" : "size-7")} aria-hidden="true" /></div><div className="mt-5 font-mono text-[9px] uppercase tracking-[0.22em] text-primary">BY // Yorkstead Systems</div><p className="mt-2 text-xs text-muted-foreground">Approved portrait pending</p></div>
      </div>}
    </div>
    {!hasApprovedPhoto ? <figcaption className="mt-3 text-[10px] leading-4 text-muted-foreground">Founder photo placeholder—no final image is being represented.</figcaption> : null}
  </figure>;
}
