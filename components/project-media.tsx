"use client";

/* eslint-disable @next/next/no-img-element -- Next.js getImageProps powers responsive art direction inside picture. */
import { getImageProps } from "next/image";
import { Maximize2, MonitorUp, X } from "lucide-react";
import { useRef, useState } from "react";
import type { ProjectMedia, ProjectMediaPlaceholder, ProjectScreenshotMedia } from "@/lib/project-media";
import { cn } from "@/lib/utils";

type ProjectMediaProps = {
  media: ProjectMedia;
  projectTitle: string;
  variant?: "preview" | "detail";
};

function MediaPlaceholder({ media, projectTitle, unavailable = false }: { media: ProjectMediaPlaceholder; projectTitle: string; unavailable?: boolean }) {
  return <figure><div role="img" aria-label={`${projectTitle}: ${media.description}`} className="relative grid aspect-video min-h-44 place-items-center overflow-hidden rounded-xl border border-dashed border-primary/25 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--primary)_8%,transparent),transparent_55%)] p-6 text-center"><div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:28px_28px]" /><div className="relative max-w-sm"><div className="mx-auto grid size-11 place-items-center rounded-xl border border-primary/20 bg-background/70 text-primary"><MonitorUp className="size-5" /></div><div className="mt-4 font-mono text-[9px] uppercase tracking-[0.22em] text-primary">{unavailable ? "Media unavailable" : "Verified media pending"}</div><p className="mt-2 text-sm font-medium text-foreground">{media.label}</p><p className="mt-2 text-xs leading-5 text-muted-foreground">{media.requestedAsset}</p></div></div><figcaption className="mt-3 text-xs leading-5 text-muted-foreground">{media.caption}</figcaption></figure>;
}

function ResponsiveScreenshot({ media, className, onError }: { media: ProjectScreenshotMedia; className?: string; onError: () => void }) {
  const sizes = media.layout === "phone" ? "(max-width: 767px) calc(100vw - 40px), 384px" : "(max-width: 767px) calc(100vw - 40px), (max-width: 1279px) calc(100vw - 64px), 1152px";
  const desktop = getImageProps({ src: media.desktop.src, alt: media.alt, width: media.desktop.width, height: media.desktop.height, sizes, quality: 82 });
  if (!media.mobile) return <img {...desktop.props} alt={media.alt} className={cn("h-auto w-full object-cover", className)} loading="lazy" decoding="async" onError={onError} />;

  const mobile = getImageProps({ src: media.mobile.src, alt: media.alt, width: media.mobile.width, height: media.mobile.height, sizes, quality: 78 });
  return <picture><source media="(min-width: 768px)" srcSet={desktop.props.srcSet} /><img {...mobile.props} alt={media.alt} className={cn("h-auto w-full object-cover", className)} loading="lazy" decoding="async" onError={onError} /></picture>;
}

function MissingMedia({ media, projectTitle }: { media: ProjectMedia; projectTitle: string }) {
  return <MediaPlaceholder projectTitle={projectTitle} unavailable media={{ id: `${media.id}-missing`, type: "placeholder", label: media.label, caption: media.caption, description: media.description, requestedAsset: "The configured file could not be loaded. Check its path and replace it with a verified project asset." }} />;
}

export function ProjectMediaFrame({ media, projectTitle, variant = "detail" }: ProjectMediaProps) {
  const [failed, setFailed] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  if (media.type === "placeholder") return <MediaPlaceholder media={media} projectTitle={projectTitle} />;
  if (failed) return <MissingMedia media={media} projectTitle={projectTitle} />;

  if (media.type === "video") {
    if (variant === "preview") {
      if (!media.poster) return <MediaPlaceholder projectTitle={projectTitle} media={{ id: `${media.id}-poster`, type: "placeholder", label: `${media.label} preview`, caption: media.caption, description: media.description, requestedAsset: "Add a verified poster image before showing this demonstration on a selected-work card." }} />;
      const poster = getImageProps({ src: media.poster.src, alt: `${projectTitle}: ${media.label} video poster`, width: media.poster.width, height: media.poster.height, sizes: "(max-width: 767px) calc(100vw - 40px), 420px", quality: 80 });
      return <figure><div className="relative overflow-hidden rounded-xl border border-border bg-black"><img {...poster.props} alt={`${projectTitle}: ${media.label} video poster`} className="aspect-video h-auto w-full object-cover" loading="lazy" decoding="async" onError={() => setFailed(true)} /><span className="absolute bottom-3 left-3 rounded-md border border-white/15 bg-black/75 px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.18em] text-white">Demo in project profile</span></div><figcaption className="mt-3 text-xs leading-5 text-muted-foreground">{media.caption}</figcaption></figure>;
    }
    const posterSrc = media.poster ? getImageProps({ src: media.poster.src, alt: "", width: media.poster.width, height: media.poster.height, sizes: "100vw", quality: 80 }).props.src : undefined;
    return <figure><div className="overflow-hidden rounded-xl border border-border bg-black"><video className="aspect-video w-full bg-black object-contain" controls muted playsInline preload="none" poster={posterSrc} aria-label={`${projectTitle}: ${media.description}`} onError={() => setFailed(true)}><source src={media.src} type={media.mimeType} />{media.captionsSrc ? <track default kind="captions" src={media.captionsSrc} srcLang="en" label="English" /> : null}Your browser does not support embedded video.</video></div><figcaption className="mt-3 text-xs leading-5 text-muted-foreground"><span className="font-medium text-foreground/85">{media.label}.</span> {media.caption}</figcaption></figure>;
  }

  const canExpand = variant === "detail" && media.expandable;
  return <figure className={cn(media.featured && "lg:col-span-2", media.layout === "phone" && "mx-auto w-full max-w-sm")}><div className="group/media relative overflow-hidden rounded-xl border border-border bg-card"><ResponsiveScreenshot media={media} onError={() => setFailed(true)} />{canExpand ? <button type="button" onClick={() => dialogRef.current?.showModal()} className="absolute bottom-3 right-3 inline-flex h-9 items-center gap-2 rounded-lg border border-white/15 bg-black/75 px-3 text-xs font-medium text-white backdrop-blur transition hover:bg-black focus-visible:outline-white" aria-label={`Expand ${media.label}`}><Maximize2 className="size-3.5" />Expand</button> : null}</div><figcaption className="mt-3 text-xs leading-5 text-muted-foreground"><span className="font-medium text-foreground/85">{media.label}.</span> {media.caption}</figcaption>{canExpand ? <dialog ref={dialogRef} aria-label={`${projectTitle}: ${media.label}`} className="m-auto max-h-[92vh] w-[min(94vw,1440px)] rounded-xl border border-border bg-background p-3 text-foreground shadow-2xl backdrop:bg-black/80"><div className="mb-3 flex items-center justify-between gap-4 px-1"><p className="text-xs text-muted-foreground">{media.description}</p><form method="dialog"><button type="submit" className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-card" aria-label="Close expanded media"><X className="size-4" /></button></form></div><div className="max-h-[80vh] overflow-auto rounded-lg"><ResponsiveScreenshot media={media} className="object-contain" onError={() => dialogRef.current?.close()} /></div></dialog> : null}</figure>;
}

export function ProjectMediaGallery({ media, projectTitle }: { media: ProjectMedia[]; projectTitle: string }) {
  return <div className={cn("grid gap-6", media.length > 1 && "lg:grid-cols-2")}>{media.map((item) => <ProjectMediaFrame key={item.id} media={item} projectTitle={projectTitle} />)}</div>;
}
