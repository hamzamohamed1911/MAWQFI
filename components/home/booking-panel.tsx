import { getTranslations } from "next-intl/server";
import { BookingSteps } from "@/components/home/booking-steps";
import { fetchZone } from "@/lib/api/zones";

type BookingPanelProps = {
  qrId: string;
};

export async function BookingPanel({ qrId }: BookingPanelProps) {
  const t = await getTranslations("HomePage");
  let zone = null;
  let zoneError: string | null = null;

  try {
    zone = await fetchZone(qrId);
  } catch {
    zoneError = t("zonesError");
  }

  return <BookingSteps zone={zone} zoneError={zoneError} />;
}
