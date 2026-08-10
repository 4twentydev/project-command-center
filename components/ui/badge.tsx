import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeProps = React.ComponentProps<"span"> & { variant?: "outline" | "secondary" };

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", variant === "secondary" && "border-border bg-secondary text-secondary-foreground", className)} {...props} />;
}
