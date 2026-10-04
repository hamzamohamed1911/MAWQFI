import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { BookingSteps } from "@/components/home/booking-steps";
import { activateBooking, fetchZone } from "@/lib/api/zones";
import type { ActiveBooking } from "@/lib/types/zone";

type BookingPanelProps = {
  qrId: string;
  locale: string;
  plate?: string;
  zoneParam?: string;
  step?: string;
  hours?: string;
};

export async function BookingPanel({
  qrId,
  locale,
  plate,
  zoneParam,
  step,
  hours,
}: BookingPanelProps) {
  const t = await getTranslations("HomePage");
  let zone = null;
  let zoneError: string | null = null;

  try {
    zone = await fetchZone(qrId);
  } catch {
    zoneError = t("zonesError");
  }

  let activeBooking: ActiveBooking | null = null;
  let activeBookingError: string | null = null;
  const trimmedPlate = plate?.trim();
  const zoneId = zone?.id;

  if (zone && zoneParam !== String(zone.id)) {
    const search = new URLSearchParams();
    search.set("zone", String(zone.id));
    if (trimmedPlate) search.set("plate", trimmedPlate);
    if (step) search.set("step", step);
    if (hours) search.set("hours", hours);
    redirect(`/${locale}/z/${encodeURIComponent(qrId)}?${search.toString()}`);
  }

  if (trimmedPlate && zoneId) {
    try {
      const activeResponse = await activateBooking({
        zone: zoneId,
        plate: trimmedPlate,
      });
      activeBooking = activeResponse.booking ?? null;
    } catch (error: unknown) {
      activeBookingError = error as string | null;
    }
  }
  return (
    <BookingSteps
      zone={zone}
      zoneError={zoneError}
      activeBooking={activeBooking}
      activeBookingError={activeBookingError}
    />
  );
}
