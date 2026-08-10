"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { useEffect } from "react";
import type { ConversionEventName } from "@/lib/conversion-analytics";

type EventMetadata = Record<string, string | number | boolean | string[]>;

export function trackConversionEvent(event: ConversionEventName, metadata: EventMetadata | string = {}) {
  const body = JSON.stringify({ event, path: window.location.pathname, metadata: typeof metadata === "string" ? { field: metadata } : metadata });
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics/events", new Blob([body], { type: "application/json" }));
    return;
  }
  void fetch("/api/analytics/events", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true });
}

export function WorkflowAuditViewTracker() {
  useEffect(() => { trackConversionEvent("workflow_audit_view"); }, []);
  return null;
}

export function ConversionViewTracker({ event, field, value }: { event: "service_page_view" | "case_study_view"; field: "service" | "caseStudy"; value: string }) {
  useEffect(() => { trackConversionEvent(event, { [field]: value }); }, [event, field, value]);
  return null;
}

type TrackedLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick"> & {
  href: string;
  event: ConversionEventName;
  metadata?: EventMetadata;
  children: ReactNode;
};

export function TrackedLink({ href, event, metadata, children, ...props }: TrackedLinkProps) {
  const handleClick = () => trackConversionEvent(event, metadata);
  if (href.startsWith("/") || href.startsWith("#")) return <Link href={href} onClick={handleClick} {...props}>{children}</Link>;
  return <a href={href} onClick={handleClick} {...props}>{children}</a>;
}
