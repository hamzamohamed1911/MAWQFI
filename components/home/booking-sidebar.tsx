"use client";

import type { UseFormReturn } from "react-hook-form";

import { BookingSummary } from "@/components/home/booking-summary";
import { ZoneGeoNotice } from "@/components/home/zone-panel";
import type { GeoStatus } from "@/lib/hooks/use-zone-geo-status";
import type { BookingInput } from "@/lib/schemas/booking.schema";
import type { ParkingZone } from "@/lib/zones";

type BookingSidebarProps = {
  zone: ParkingZone;
  geo: GeoStatus;
  form: UseFormReturn<BookingInput>;
};

/** Desktop: location status above the booking summary. */
export function BookingSidebar({ zone, geo, form }: BookingSidebarProps) {
  return (
    <aside className="hidden flex-col gap-4 lg:sticky lg:top-24 lg:flex">
      <ZoneGeoNotice geo={geo} />
      <BookingSummary zone={zone} form={form} />
    </aside>
  );
}
