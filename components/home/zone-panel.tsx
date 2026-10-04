"use client";

import { AlertTriangle, Loader2, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

import { Alert } from "@/components/ui/alert";
import type { GeoStatus } from "@/lib/hooks/use-zone-geo-status";
import { formatDistanceMeters } from "@/lib/utils/format-distance";

export function ZoneGeoNotice({ geo }: { geo: GeoStatus }) {
  const t = useTranslations("HomePage");

  const distanceLabel =
    geo.distanceM !== null
      ? t("geoDistance", {
          distance: formatDistanceMeters(geo.distanceM, {
            metersShort: t("metersShort"),
            kilometersShort: t("kilometersShort"),
          }),
        })
      : null;

  if (geo.state === "pending") {
    return (
      <Alert
        variant="info"
        icon={<Loader2 className="size-4 animate-spin" aria-hidden />}
        title={t("geoChecking")}
      />
    );
  }

  if (geo.state === "failed") {
    return (
      <Alert
        variant="warning"
        icon={<AlertTriangle className="size-5" aria-hidden />}
        title={t("geoDeniedTitle")}
      >
        {t("geoDeniedBody")}
      </Alert>
    );
  }

  if (geo.inside === false) {
    return (
      <Alert
        variant="warning"
        icon={<AlertTriangle className="size-5" aria-hidden />}
        title={t("geoOutsideTitle")}
      >
        <p>{t("geoOutsideBody")}</p>
        {distanceLabel ? (
          <p className="mt-1 font-medium tabular-nums text-foreground">
            {distanceLabel}
          </p>
        ) : null}
      </Alert>
    );
  }

  if (geo.inside === true) {
    return (
      <Alert
        variant="success"
        icon={<MapPin className="size-5" aria-hidden />}
        title={t("geoInside")}
      >
        {distanceLabel ? (
          <span className="font-medium tabular-nums">{distanceLabel}</span>
        ) : null}
      </Alert>
    );
  }

  return null;
}
