"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import type { GeoStatus } from "@/lib/hooks/use-zone-geo-status";
import { formatDistanceMeters } from "@/lib/utils/format-distance";

type ZoneLocationGateProps = {
  geo: GeoStatus;
  locating: boolean;
  onContinue: () => void;
  onRedetect: () => void;
};

export function ZoneLocationGate({
  geo,
  locating,
  onContinue,
  onRedetect,
}: ZoneLocationGateProps) {
  const t = useTranslations("HomePage");
  const distance =
    geo.distanceM !== null
      ? formatDistanceMeters(geo.distanceM, {
          metersShort: t("metersShort"),
          kilometersShort: t("kilometersShort"),
        })
      : null;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-2 py-6 text-center sm:py-10">
      <img
        src="/images/Locationsearch.svg"
        alt=""
        width={235}
        height={230}
        className="h-auto w-52 sm:w-60"
      />

      <h2 className="mt-6 text-lg font-bold text-foreground">
        {t("geoOutsideTitle")}
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {t("geoOutsideBody")}
      </p>
      {distance ? (
        <p className="mt-4 text-sm text-foreground">
          {t("geoDistance", { distance })}
        </p>
      ) : null}

      <Button
        type="button"
        className="mt-8 h-12 w-full rounded-full text-base font-semibold"
        onClick={onContinue}
      >
        {t("geoContinue")}
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="mt-2 h-11 w-full rounded-full text-base font-semibold text-foreground hover:bg-transparent"
        disabled={locating}
        onClick={onRedetect}
      >
        {locating ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : null}
        {t("geoRedetect")}
      </Button>
    </div>
  );
}
