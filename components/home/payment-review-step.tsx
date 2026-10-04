"use client";

import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ShieldCheck, Loader2 } from "lucide-react";
import { UseFormReturn, useWatch } from "react-hook-form";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookingInput } from "@/lib/schemas/booking.schema";
import type { ParkingZone } from "@/lib/zones";
import { formatDateTime } from "@/lib/utils/formatDateTime";
import { cn } from "@/lib/utils/cn";

type PaymentReviewStepProps = {
  zone: ParkingZone | null;
  form: UseFormReturn<BookingInput>;
  checkoutError?: string | null;
  isSubmitting?: boolean;
  onBack: () => void;
  onPay: () => void;
};

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

export function PaymentReviewStep({
  zone,
  form,
  checkoutError,
  isSubmitting = false,
  onBack,
  onPay,
}: PaymentReviewStepProps) {
  const t = useTranslations("HomePage");
  const locale = useLocale();

  const values = useWatch({ control: form.control });
  const hours = values.hours || 1;
  const hourLabel = hours === 1 ? t("hourUnit") : t("hoursUnit");
  const plate = values.plate?.trim() ?? "";

  const hourlyRate = Number(zone?.hourly_rate ?? 0);
  const additionalFee = Number(zone?.additional_fee ?? 0);
  const subtotal = hourlyRate * hours;
  const total = subtotal + additionalFee;
  const currency = zone?.currency || "SAR";

  const endDate = new Date(Date.now() + hours * 60 * 60 * 1000);

  const payLabel = t("payAmount", {
    amount: `${currency} ${total.toFixed(2)}`,
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex w-full gap-3 flex-col">
        <div className="flex w-full justify-between items-center">
          <h2 className="text-xl font-bold text-foreground md:text-2xl">
            {t("paymentReviewTitle")}
          </h2>
          <Badge
            variant="outline"
            className={cn(
              "shrink-0 gap-1 text-[10px] border-primary-200 bg-primary-50 py-2 text-primary-700 w-auto",
              "dark:border-primary-700 dark:bg-primary-900/50 dark:text-primary-200",
            )}
          >
            <ShieldCheck className="size-4" aria-hidden />
            {t("securePayment")}
          </Badge>
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          {t("paymentReviewDescription")}
        </p>
      </div>

      {checkoutError ? (
        <Alert variant="destructive">{checkoutError}</Alert>
      ) : null}

      <div
        className={cn(
          "rounded-2xl border border-primary-200/80 bg-primary-50/80 p-4 sm:p-5",
          "dark:border-primary-700/60 dark:bg-primary-900/40",
        )}
      >
        <p className="text-sm font-semibold text-primary-700 dark:text-primary-300">
          {t("amountDue")}
        </p>
        <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">
          {currency} {total.toFixed(2)}
        </p>
        <div className="mt-4 space-y-2 border-t border-primary-200/60 pt-4 dark:border-primary-700/50">
          <DetailRow
            label={t("duration")}
            value={`${hours.toFixed(2)} ${hourLabel}`}
          />
          <DetailRow
            label={t("fees")}
            value={`${currency} ${additionalFee.toFixed(2)}`}
          />
          <DetailRow
            label={t("booking")}
            value={t("bookingHoursLine", { count: hours, unit: hourLabel })}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <div className="space-y-3">
          <DetailRow label={t("location")} value={zone?.site_name ?? "—"} />
          <DetailRow
            label={t("zoneLabel")}
            value={zone?.name ?? zone?.id ?? "—"}
          />
          <DetailRow
            label={t("plate-number")}
            value={
              <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs sm:text-sm">
                {plate || "—"}
              </span>
            }
          />
          <DetailRow
            label={t("ends")}
            value={formatDateTime(endDate, locale)}
          />
        </div>
      </div>

      <Button
        type="button"
        className="h-12 w-full rounded-full text-base font-semibold"
        disabled={isSubmitting}
        onClick={onPay}
      >
        {isSubmitting ? (
          <Loader2 className="size-5 animate-spin" aria-hidden />
        ) : (
          payLabel
        )}
      </Button>

      <Button
        type="button"
        variant="link"
        className="w-full text-base hover:text-secondary-600 hover:bg-transparent rounded-full   font-semibold text-secondary-800 "
        disabled={isSubmitting}
        onClick={onBack}
      >
        {t("back")}
      </Button>
    </div>
  );
}
