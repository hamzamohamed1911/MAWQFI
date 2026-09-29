import { getTranslations } from "next-intl/server";
import { BookingSteps } from "@/components/home/booking-steps";
import { getActivateBookingErrorMessage } from "@/lib/api/booking-errors";
import {
  activateBooking,
  fetchZone,
  resolveActiveBooking,
} from "@/lib/api/zones";
import type { ActiveBooking } from "@/lib/types/zone";

type BookingPanelProps = {
  qrId: string;
  plate?: string;
  zoneId?: string;
};

export async function BookingPanel({ qrId, plate, zoneId }: BookingPanelProps) {
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
  const parsedZoneId = zoneId ? Number(zoneId) : undefined;
  const resolvedZoneId =
    parsedZoneId !== undefined && !Number.isNaN(parsedZoneId)
      ? parsedZoneId
      : zone?.id;

  if (trimmedPlate && resolvedZoneId) {
    try {
      const activeResponse = await activateBooking({
        zone: resolvedZoneId,
        plate: trimmedPlate,
      });
      activeBooking = resolveActiveBooking(activeResponse);
    } catch (error) {
      activeBookingError =
        getActivateBookingErrorMessage(error) ?? t("activeBookingError");
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
