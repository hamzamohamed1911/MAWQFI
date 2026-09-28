import { useLocale, useTranslations } from "next-intl";
import { UseFormReturn, useWatch } from "react-hook-form";

import { BookingInput } from "@/lib/schemas/booking.schema";
import { ParkingZone } from "@/lib/zones";
import { formatDateTime } from "@/lib/utils/formatDateTime";

type BookingSummaryProps = {
  form: UseFormReturn<BookingInput>;
  zone: ParkingZone | null;
};

export function BookingSummary({ form, zone }: BookingSummaryProps) {
  const t = useTranslations("HomePage");
  const locale = useLocale();

  const values = useWatch({
    control: form.control,
  });

  const hours = values.hours || 1;
  const hourLabel = hours === 1 ? t("hourUnit") : t("hoursUnit");

  const hourlyRate = Number(zone?.hourly_rate ?? 0);
  const additionalFee = Number(zone?.additional_fee ?? 0);

  const subtotal = hourlyRate * hours;
  const total = subtotal + additionalFee;

  const currency = zone?.currency || "SAR";

  const startDate = new Date();

  const endDate = new Date(startDate.getTime() + hours * 60 * 60 * 1000);

  return (
    <aside className="rounded-2xl bg-card p-4 text-start text-card-foreground md:shadow-xl shadow-sm sm:p-6 lg:sticky lg:top-24">
      {/* Header */}
      <h2 className="text-sm font-extrabold text-foreground">
        {t("summaryTitle")}
      </h2>

      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        {t("summaryDescription")}
      </p>

      <div className="mt-5 space-y-5">
        {/* Zone */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground">
            {zone?.site_name || "-"}
          </h3>

          <p className="mt-1 text-sm font-semibold text-foreground">
            {zone?.name || "-"}
          </p>
        </div>

        {/* Selected Time */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold text-foreground">
            {t("selectedTime")}
          </h3>

          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t("duration")}
              </span>

              <span className="text-sm font-semibold">
                {hours} {hourLabel}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">
                {t("timeFrom", { time: formatDateTime(startDate, locale) })}
              </p>

              <p className="text-sm text-muted-foreground">
                {t("timeTo", { time: formatDateTime(endDate, locale) })}
              </p>
            </div>
          </div>
        </div>

        {/* Cost */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold text-foreground">{t("cost")}</h3>

          <div className="mt-3 space-y-2">
            {/* Hourly Rate */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("hourlyRate")}</span>

              <span className="font-medium">
                {hourlyRate.toFixed(2)} {currency}
              </span>
            </div>

            {/* Duration Cost */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {hours} {hourLabel}
              </span>

              <span className="font-medium">
                {subtotal.toFixed(2)} {currency}
              </span>
            </div>

            {/* Additional Fee */}
            {additionalFee > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("additionalFee")}
                </span>

                <span className="font-medium">
                  {additionalFee.toFixed(2)} {currency}
                </span>
              </div>
            )}

            {/* Total */}
            <div className="flex items-center justify-between border-t pt-3">
              <span className="font-bold text-foreground">{t("total")}</span>

              <span className="text-lg font-extrabold text-foreground">
                {total.toFixed(2)} {currency}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
