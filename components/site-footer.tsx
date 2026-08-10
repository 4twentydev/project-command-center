import type { ReactNode } from "react";
import Link from "next/link";
import { brand } from "@/lib/brand";

export function SiteFooter({ children }: { children?: ReactNode }) {
  return <footer className="relative border-t border-border px-5 py-8"><div className="mx-auto grid max-w-7xl gap-5 text-xs text-muted-foreground lg:grid-cols-[auto_1fr] lg:items-center"><div><span>© {new Date().getFullYear()} {brand.name}</span><p className="mt-1 font-mono text-[8px] uppercase tracking-[0.16em] text-foreground/65">{brand.descriptor}</p></div><div className="flex flex-wrap items-center gap-x-5 gap-y-2 lg:justify-self-end">{children ?? <p>{brand.audienceLine}</p>}<Link href="/privacy" className="transition hover:text-foreground">Privacy</Link></div></div></footer>;
}
