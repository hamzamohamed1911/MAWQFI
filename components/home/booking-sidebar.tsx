"use client";

import type { UseFormReturn } from "react-hook-form";

import { BookingSummary } from "@/components/home/booking-summary";
import type { BookingInput } from "@/lib/schemas/booking.schema";
import type { ParkingZone } from "@/lib/zones";

type BookingSidebarProps = {
  zone: ParkingZone;
  form: UseFormReturn<BookingInput>;
};

/** Desktop booking summary beside the step form. */
export function BookingSidebar({ zone, form }: BookingSidebarProps) {
  return (
    <aside className="hidden lg:sticky lg:top-24 lg:block">
      <BookingSummary zone={zone} form={form} />
    </aside>
  );
}
