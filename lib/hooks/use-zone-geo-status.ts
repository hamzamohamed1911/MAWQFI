"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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

export type ZoneGeoStatus = GeoStatus & {
  locating: boolean;
  redetect: () => void;
};

/** GPS read compared to the zone geofence. `redetect` asks for a fresh position. */
export function useZoneGeoStatus(zone: ParkingZone | null): ZoneGeoStatus {
  const [geoResult, setGeoResult] = useState<GeoResult | null>(null);
  const [locating, setLocating] = useState(true);
  const requestRef = useRef(0);

  const readLocation = useCallback((maximumAge = 30_000) => {
    const requestId = ++requestRef.current;
    setLocating(true);
    void locate(12_000, maximumAge).then((result) => {
      if (requestId !== requestRef.current) {
        return;
      }
      setGeoResult(result);
      setLocating(false);
    });
  }, []);

  useEffect(() => {
    readLocation();
    return () => {
      requestRef.current += 1;
    };
  }, [readLocation]);

  return {
    ...statusFrom(zone, geoResult),
    locating,
    redetect: () => readLocation(0),
  };
}
