'use client';

import * as React from "react";
import { rolePerspectives } from "@/lib/platform";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Eye, EyeOff, UserCheck, Shield } from "lucide-react";

export function PlatformRoleViewer() {
  const [activeRoleId, setActiveRoleId] = React.useState(rolePerspectives[0].id);

  const currentRole = rolePerspectives.find((r) => r.id === activeRoleId) || rolePerspectives[0];

  return (
    <div className="space-y-6">
      {/* Role Switcher Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4 font-mono text-xs">
        {rolePerspectives.map((role) => (
          <button
            key={role.id}
            onClick={() => setActiveRoleId(role.id)}
            className={`rounded-lg px-3.5 py-2 transition text-left ${
              activeRoleId === role.id
                ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {role.roleTitle}
          </button>
        ))}
      </div>

      {/* Role Perspective Card */}
      <Card className="border-border bg-card/80 shadow-md">
        <CardContent className="space-y-6 p-6 sm:p-8 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                <UserCheck className="size-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground tracking-tight">{currentRole.roleTitle}</h3>
                <p className="text-muted-foreground text-xs mt-0.5">{currentRole.operatingFocus}</p>
              </div>
            </div>
            <Badge variant="secondary" className="font-mono text-xs bg-primary/20 text-primary border-primary/30 shrink-0">
              Role-Scoped Interface
            </Badge>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <span className="text-[10px] uppercase text-muted-foreground block font-bold mb-1">
              Ergonomic Interface Design
            </span>
            <p className="text-foreground text-sm leading-relaxed">{currentRole.interfaceView}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* What They See */}
            <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/[0.03] p-4">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase">
                <Eye className="size-4 shrink-0" />
                <span>What This Role Sees & Controls</span>
              </div>
              <ul className="space-y-2 text-foreground/90">
                {currentRole.whatTheySee.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="size-3.5 text-primary mt-0.5 shrink-0" />
                    <span className="text-xs leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What Is Filtered Out */}
            <div className="space-y-3 rounded-lg border border-border/80 bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-muted-foreground font-bold text-xs uppercase">
                <EyeOff className="size-4 shrink-0" />
                <span>What Is Filtered Out For Clarity</span>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {currentRole.whatIsHidden}
              </p>
              <div className="pt-3 border-t border-border/60 text-[10px] text-muted-foreground/80 flex items-center gap-1.5">
                <Shield className="size-3 text-primary" />
                <span>Protected by server-side capability matrix</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
