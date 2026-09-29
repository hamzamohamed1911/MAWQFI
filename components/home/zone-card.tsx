"use client";

import { Clock, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatClockTime, formatHourlyRate, isAllDay } from "@/lib/format-time";
import type { ParkingZone } from "@/lib/zones";

type ZoneCardProps = {
  zone: ParkingZone;
};

export function ZoneCard({ zone }: ZoneCardProps) {
  const t = useTranslations("HomePage");
  const allDay = isAllDay(zone.start_time, zone.end_time);
  const rate = formatHourlyRate(zone.hourly_rate);

  return (
    <article className="relative flex max-w-md gap-4 rounded-xl border border-primary-500 bg-card p-4 text-start shadow-sm ring-1 ring-primary-500/20">
      <div
        className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400"
        aria-hidden
      >
        <MapPin className="size-8" strokeWidth={2} />
      </div>

      <div className="min-w-0 flex-1">
        <div>
          <h3 className="text-sm font-extrabold text-foreground">
            {zone.site_name}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {zone.name || zone.site_name}
          </p>
        </div>

        <div className="mt-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Clock className="size-3.5 text-amber-400" />
              {allDay
                ? t("hours24")
                : `${formatClockTime(zone.start_time)} - ${formatClockTime(zone.end_time)}`}
            </p>
            {!allDay ? (
              <p className="mt-2 text-[11px] text-muted-foreground">
                {formatClockTime(zone.start_time)} -{" "}
                {formatClockTime(zone.end_time)}
              </p>
            ) : null}
          </div>

          <div className="shrink-0 text-end">
            <p className="text-lg font-extrabold leading-none text-amber-400">
              {rate}
              <span className="ms-1 text-[11px] font-medium text-muted-foreground">
                {zone.currency} {t("perHour")}
              </span>
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
