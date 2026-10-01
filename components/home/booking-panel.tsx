import { getTranslations } from "next-intl/server";
import { BookingSteps } from "@/components/home/booking-steps";
import { activateBooking, fetchZone } from "@/lib/api/zones";
import type { ActiveBooking } from "@/lib/types/zone";

type BookingPanelProps = {
  qrId: string;
  plate?: string;
};

export async function BookingPanel({ qrId, plate }: BookingPanelProps) {
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
