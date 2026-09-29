import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const variantStyles = {
  info: "border-primary/30 bg-primary/10 text-foreground",
  success: "border-primary/30 bg-primary/10 text-foreground",
  warning:
    "border-amber-500/40 bg-amber-500/10 text-foreground dark:border-amber-400/35 dark:bg-amber-400/10",
  destructive: "border-destructive/40 bg-destructive/10 text-destructive",
} as const;

export type AlertVariant = keyof typeof variantStyles;

type AlertProps = {
  variant?: AlertVariant;
  title?: ReactNode;
  children?: ReactNode;
  icon?: ReactNode;
  className?: string;
};

export function Alert({
  variant = "info",
  title,
  children,
  icon,
  className,
}: AlertProps) {
  return (
    <div
      role={variant === "destructive" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm",
        variantStyles[variant],
        className,
      )}
    >
      {icon ? <span className="mt-0.5 shrink-0">{icon}</span> : null}
      <div className="min-w-0 space-y-1">
        {title ? (
          <p className="font-semibold leading-tight">{title}</p>
        ) : null}
        {children ? (
          <div className="leading-relaxed text-muted-foreground">{children}</div>
        ) : null}
      </div>
    </div>
  );
}
