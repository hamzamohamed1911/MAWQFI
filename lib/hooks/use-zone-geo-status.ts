"use client";

import { useEffect, useState } from "react";

import { haversineMeters, locate, type GeoResult } from "@/lib/utils/geo";
import type { ParkingZone } from "@/lib/zones";

export type GeoStatus = {
  state: "pending" | "located" | "failed";
  distanceM: number | null;
  inside: boolean | null;
};

function zoneCenter(zone: ParkingZone | null): { latitude: number; longitude: number } | null {
  const latitude = Number(zone?.latitude);
  const longitude = Number(zone?.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }
  return { latitude, longitude };
}

function statusFrom(zone: ParkingZone | null, geo: GeoResult | null): GeoStatus {
  if (!geo) {
    return { state: "pending", distanceM: null, inside: null };
  }
  if (!geo.ok) {
    return { state: "failed", distanceM: null, inside: null };
  }

  const center = zoneCenter(zone);
  if (!center) {
    return { state: "located", distanceM: null, inside: null };
  }

  const distanceM = haversineMeters(geo.coords, center);
  const radius = zone?.geofence_radius_m ?? 0;
  const tolerance = Math.min(geo.accuracyM || 0, 50);

  return {
    state: "located",
    distanceM,
    inside: radius > 0 ? distanceM <= radius + tolerance : null,
  };
}

/** One GPS read on mount, compared to the zone geofence (informational only). */
export function useZoneGeoStatus(zone: ParkingZone | null): GeoStatus {
  const [geoResult, setGeoResult] = useState<GeoResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    void locate().then((result) => {
      if (!cancelled) {
        setGeoResult(result);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return statusFrom(zone, geoResult);
}
