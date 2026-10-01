import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type NotFoundViewProps = {
  title: string;
  description: string;
  logo: ReactNode;
  action: ReactNode;
  className?: string;
  /** Root 404 renders outside locale layout (no site header). */
  variant?: "root" | "locale";
};

export function NotFoundView({
  title,
  description,
  logo,
  action,
  className,
  variant = "locale",
}: NotFoundViewProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center px-6 py-10",
        variant === "root" && "min-h-dvh bg-primary-50",
        className,
      )}
    >
      <div className="flex w-full max-w-88 flex-col items-center gap-8 text-center">
        {logo}

        <div className="space-y-3">
          <p
            className="text-[4.5rem] font-extrabold leading-none tracking-tight text-primary-600"
            aria-hidden
          >
            404
          </p>
          <h1 className="text-lg font-bold text-foreground sm:text-xl">
            {title}
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>

        {action}
      </div>
    </div>
  );
}

export function notFoundHomeButtonClassName() {
  return "inline-flex h-11 min-w-[10rem] items-center justify-center rounded-full bg-primary-500 px-6 text-sm font-bold text-natural-25 transition-colors hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2";
}
