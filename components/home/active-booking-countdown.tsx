"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useNow } from "@/lib/hooks/use-now";
import { formatRemainingDuration } from "@/lib/utils/format-remaining";
import { formatDateTime } from "@/lib/utils/formatDateTime";
import { cn } from "@/lib/utils/cn";

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

type ActiveBookingCountdownProps = {
  expiresAt: string;
  className?: string;
};

export function ActiveBookingCountdown({
  expiresAt,
  className,
}: ActiveBookingCountdownProps) {
  const t = useTranslations("HomePage");
  const locale = useLocale();
  const targetMs = useMemo(() => new Date(expiresAt).getTime(), [expiresAt]);
  const now = useNow();

  const totalSeconds =
    now === 0 ? null : Math.max(0, Math.floor((targetMs - now) / 1000));
  const expired = totalSeconds === 0 && now !== 0;

  const parts = [
    {
      label: t("hoursShort"),
      value: totalSeconds === null ? null : Math.floor(totalSeconds / 3600),
    },
    {
      label: t("minutesShort"),
      value:
        totalSeconds === null ? null : Math.floor((totalSeconds % 3600) / 60),
    },
    {
      label: t("secondsShort"),
      value: totalSeconds === null ? null : totalSeconds % 60,
    },
  ];

  const textLabels = {
    hoursShort: t("hoursShort"),
    minutesShort: t("minutesShort"),
    remainingJoin: t("remainingJoin"),
  };

  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-sm font-medium text-foreground">
        {t("activeBookingRemaining")}:{" "}
        {now === 0 ? (
          <span className="tabular-nums">—</span>
        ) : (
          <span className="tabular-nums font-semibold">
            {formatRemainingDuration(Math.max(0, targetMs - now), textLabels)}
          </span>
        )}
      </p>

      <div className="flex items-stretch justify-start gap-2" dir="ltr">
        {parts.map((part) => (
          <div
            key={part.label}
            className="flex min-w-15 flex-col items-center gap-0.5 rounded-xl border border-border bg-background/80 px-2.5 py-2"
          >
            <span
              className={cn(
                "tabular-nums text-xl font-bold",
                expired ? "text-muted-foreground" : "text-foreground",
              )}
            >
              {part.value === null ? "--" : pad(part.value)}
            </span>
            <span className="text-[10px] font-medium text-muted-foreground">
              {part.label}
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {t("activeBookingExpiresAt")}:{" "}
        <span className="tabular-nums font-medium text-foreground">
          {formatDateTime(new Date(expiresAt), locale)}
        </span>
      </p>

      {expired ? (
        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
          {t("activeBookingExpired")}
        </p>
      ) : null}
    </div>
  );
}
