"use client";

import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ParkingZone } from "@/lib/zones";

type ZoneCardProps = {
  zone: ParkingZone;
};

export function ZoneCard({ zone }: ZoneCardProps) {
  const t = useTranslations("HomePage");

  return (
    <article className="relative flex max-w-md gap-4 rounded-xl border border-primary-500 bg-card p-4 text-start shadow-sm ring-1 ring-primary-500/20">
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-2">
          <p className="text-sm  text-muted-foreground">{t("parking")}</p>
          <h3 className="text-sm font-extrabold text-foreground">
            {zone.site_name}
          </h3>
          <p className=" text-sm leading-relaxed text-muted-foreground">
            {zone.name || zone.site_name}
          </p>
        </div>
      </div>
      <div
        className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400"
        aria-hidden
      >
        <MapPin className="size-8" strokeWidth={2} />
      </div>
    </article>
  );
}
