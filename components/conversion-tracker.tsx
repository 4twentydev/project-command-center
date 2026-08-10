"use client";

import { useEffect } from "react";
import type { ConversionEventName } from "@/lib/conversion-analytics";

export function trackConversionEvent(event: ConversionEventName, field?: string) {
  const body = JSON.stringify({ event, path: window.location.pathname, field });
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
