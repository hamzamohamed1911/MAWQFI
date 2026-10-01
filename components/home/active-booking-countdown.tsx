"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useNow } from "@/lib/hooks/use-now";
import { formatDateTime } from "@/lib/utils/formatDateTime";
import { cn } from "@/lib/utils/cn";
import type { ActiveBooking } from "@/lib/types/zone";

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

type ActiveBookingCountdownProps = {
  activeBooking: ActiveBooking;
  className?: string;
};

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex w-full items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-end font-semibold text-foreground">{value}</span>
    </div>
  );
}

export function ActiveBookingCountdown({
  activeBooking,
  className,
}: ActiveBookingCountdownProps) {
  const expiresAt = activeBooking.expires_at;
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

  const locationLine = t("locationZoneLine", {
    site: activeBooking.site_name,
    zone: activeBooking.zone_name,
  });

  return (
    <div className={cn("space-y-3", className)}>
      <div
        className={cn(
          "space-y-3 rounded-3xl border border-border bg-card px-4 py-3 sm:px-5 sm:py-4",
          "dark:border-primary-800/40 dark:bg-card",
        )}
      >
        <SummaryRow label={t("currentBookingLabel")} value={locationLine} />
        <SummaryRow
          label={t("currentEndTimeLabel")}
          value={formatDateTime(new Date(expiresAt), locale)}
        />
      </div>

      <div
        className="grid w-full grid-cols-3 gap-2"
        dir="ltr"
        aria-label={t("activeBookingRemaining")}
      >
        {parts.map((part) => (
          <div
            key={part.label}
            className="flex w-full min-w-0 flex-col items-center gap-0.5 rounded-xl border border-border bg-background/80 px-2.5 py-2"
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

      {expired ? (
        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
          {t("activeBookingExpired")}
        </p>
      ) : null}
    </div>
  );
}
