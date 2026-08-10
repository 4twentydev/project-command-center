import Link from "next/link";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function BrandMark({ showDescriptor = true, className }: { showDescriptor?: boolean; className?: string }) {
  return <Link href="/" aria-label={`${brand.name} — ${brand.descriptor}`} className={cn("inline-flex min-w-0 items-center gap-4", className)}>
    <span className="shrink-0 font-mono text-xs font-semibold tracking-[0.24em]">{brand.wordmark}<span className="text-primary">{brand.domainSuffix}</span></span>
    {showDescriptor ? <span className="hidden max-w-56 border-l border-border pl-4 font-mono text-[8px] uppercase leading-4 tracking-[0.16em] text-muted-foreground xl:block">{brand.descriptor}</span> : null}
  </Link>;
}
