import { getTranslations } from "next-intl/server";
import { BookingSteps } from "@/components/home/booking-steps";
import { activateBooking, fetchZone } from "@/lib/api/zones";
import type {
  ActivateBookingErrorResponse,
  ActivateBookingResponse,
} from "@/lib/types/zone";

type BookingPanelProps = {
  qrId: string;
  plate?: string;
  zoneId?: string;
};

function getActivateBookingErrorMessage(error: unknown): string | null {
  const detail = (error as ActivateBookingErrorResponse).detail;

  return typeof detail === "string" && detail.length > 0 ? detail : null;
}

export async function BookingPanel({
  qrId,
  plate,
  zoneId,
}: BookingPanelProps) {
  const t = await getTranslations("HomePage");
  let zone = null;
  let zoneError: string | null = null;

  try {
    zone = await fetchZone(qrId);
  } catch {
    zoneError = t("zonesError");
  }

  let activeBooking: ActivateBookingResponse | null = null;
  let activeBookingError: string | null = null;
  const trimmedPlate = plate?.trim();
  const parsedZoneId = zoneId ? Number(zoneId) : undefined;
  const resolvedZoneId =
    parsedZoneId !== undefined && !Number.isNaN(parsedZoneId)
      ? parsedZoneId
      : zone?.id;

  if (trimmedPlate && resolvedZoneId) {
    try {
      activeBooking = await activateBooking({
        zone: resolvedZoneId,
        plate: trimmedPlate,
      });
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
