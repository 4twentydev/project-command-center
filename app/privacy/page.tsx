import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Database, Eye, Mail, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { TrackedLink } from "@/components/conversion-tracker";
import { SiteFooter } from "@/components/site-footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { brand, brandMailto } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Privacy",
  description: `How ${brand.name} handles contact submissions and privacy-conscious conversion analytics.`,
  alternates: { canonical: "/privacy" },
  openGraph: { title: `Privacy · ${brand.name}`, description: "How contact submissions and first-party conversion events are handled.", url: "/privacy", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${brand.name} — ${brand.descriptor}` }] },
  twitter: { card: "summary_large_image", title: `Privacy · ${brand.name}`, description: "How contact submissions and first-party conversion events are handled.", images: ["/opengraph-image"] },
};

const sections = [
  { icon: Mail, title: "Information you submit", body: "Contact and workflow-audit forms may collect your name, business, email, optional phone number, current tools, workflow details, desired outcome, and other information you choose to provide. Do not submit passwords, customer records, financial records, proprietary drawings, or production files." },
  { icon: Eye, title: "First-party conversion measurement", body: "The site records a limited event name, public page path, and non-identifying context such as a service or project slug. A network address may be converted into a salted one-way hash for rate limiting and aggregate event counting. The raw address is not stored in the analytics table, and the site does not create an advertising profile." },
  { icon: Database, title: "Storage and service providers", body: "Submissions and conversion events are stored in the project’s private database. Vercel hosts the application, Neon provides database infrastructure, and Resend may deliver inquiry notifications when configured. These providers process only the information needed to operate the service." },
  { icon: ShieldCheck, title: "Use, retention, and choices", body: "Information is used to respond to inquiries, evaluate fit, manage follow-up, protect the forms from abuse, and understand which public paths produce useful conversations. Conversion events are designed for a 90-day retention window. Inquiry records are kept only as needed for communication, project administration, and applicable obligations. You can request access, correction, or deletion by email." },
];

export default function PrivacyPage() {
  return <main className="min-h-screen overflow-hidden"><div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_72%_0%,color-mix(in_oklab,var(--primary)_15%,transparent),transparent_38%)]" /><header className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8"><BrandMark /><div className="flex items-center gap-2"><ThemeToggle /><Link href="/" className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs text-muted-foreground transition hover:text-foreground"><ArrowLeft className="size-3.5" aria-hidden="true" />Home</Link></div></header><article className="relative mx-auto max-w-5xl px-5 pb-24 pt-16 sm:px-8 sm:pt-24"><header className="max-w-3xl"><div className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary">Privacy · updated August 10, 2026</div><h1 className="mt-4 text-5xl font-semibold leading-[.95] tracking-[-0.055em] sm:text-7xl">Useful measurement without surveillance.</h1><p className="mt-7 text-base leading-8 text-muted-foreground sm:text-lg">{brand.name} collects only what is needed to respond to real project inquiries, protect the contact channels, and understand which pages lead to useful conversations.</p></header><div className="mt-16 border-y border-border">{sections.map(({ icon: Icon, title, body }, index) => <section key={title} className="grid gap-5 border-t border-border py-7 first:border-t-0 sm:grid-cols-[52px_190px_1fr]"><span className="font-mono text-[9px] text-primary">0{index + 1}</span><h2 className="flex items-start gap-2 text-sm font-medium"><Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />{title}</h2><p className="max-w-3xl text-sm leading-7 text-muted-foreground">{body}</p></section>)}</div><section className="mt-10 rounded-xl border border-primary/25 bg-primary/10 p-6 sm:p-8"><h2 className="text-xl font-semibold">Questions or a privacy request?</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Contact Brandon directly. Include enough information to identify the relevant inquiry, but do not send sensitive records by ordinary email.</p><TrackedLink href={brandMailto} event="email_link_click" metadata={{ placement: "privacy" }} className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground"><Mail className="size-4" aria-hidden="true" />{brand.email}</TrackedLink></section></article><SiteFooter /></main>;
}
