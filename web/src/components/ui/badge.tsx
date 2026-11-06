import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.12em]",
  {
    variants: {
      variant: {
        default: "border-line bg-raised text-muted",
        accent: "border-accent/35 bg-accent/10 text-accent font-medium",
        ok: "border-emerald-600/30 bg-[var(--badge-ok-bg)] text-[var(--badge-ok-text)] dark:border-ok/35 dark:bg-ok/10 dark:text-ok font-semibold",
        danger: "border-red-600/30 bg-[var(--badge-danger-bg)] text-[var(--badge-danger-text)] dark:border-danger/35 dark:bg-danger/10 dark:text-danger font-semibold",
        warn: "border-amber-600/30 bg-[var(--badge-warn-bg)] text-[var(--badge-warn-text)] dark:border-warn/35 dark:bg-warn/10 dark:text-warn font-semibold",
        outline: "border-line bg-transparent text-muted",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
