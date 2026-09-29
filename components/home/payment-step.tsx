"use client";

import { useLocale, useTranslations } from "next-intl";
import { AlertTriangle, CheckCircle2, Loader2, Printer } from "lucide-react";
import { useState } from "react";
import { ActiveBookingCountdown } from "@/components/home/active-booking-countdown";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { downloadBookingBill } from "@/lib/api/download-booking-bill";
import { printBookingReceipt } from "@/lib/print-booking-receipt";
import type {
  ActiveBooking,
  BookingQuoteResponse,
  ConfirmBookingResponse,
} from "@/lib/types/zone";

type PaymentStepProps = {
  activeBooking: ActiveBooking | null;
  checkoutResult: BookingQuoteResponse | null;
  confirmResult: ConfirmBookingResponse | null;
  activeBookingError?: string | null;
  onBack: () => void;
};

export function PaymentStep({
  activeBooking,
  confirmResult,
  activeBookingError,
  onBack,
}: PaymentStepProps) {
  const t = useTranslations("HomePage");
  const locale = useLocale();
  const booking = confirmResult?.booking ?? activeBooking;
  const payment = confirmResult?.payment;
  const [isPrinting, setIsPrinting] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);

  async function handlePrintReceipt() {
    if (!booking) {
      return;
    }

    setIsPrinting(true);
    setPrintError(null);

    try {
      await downloadBookingBill(booking.id, booking.plate);
    } catch {
      if (payment) {
        printBookingReceipt({
          booking,
          payment,
          locale,
          brandName: t("title"),
          labels: {
            title: t("receiptTitle"),
            bookingId: t("receiptBookingId"),
            site: t("receiptSite"),
            zone: t("receiptZone"),
            plate: t("plate-number"),
            duration: t("duration"),
            amount: t("total"),
            reference: t("paymentReference"),
            starts: t("receiptStarts"),
            expires: t("receiptExpires"),
            hourUnit: t("hourUnit"),
            hoursUnit: t("hoursUnit"),
            minuteUnit: t("minuteUnit"),
            minutesUnit: t("minutesUnit"),
          },
        });
      } else {
        setPrintError(t("printReceiptError"));
      }
    } finally {
      setIsPrinting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {printError ? (
        <p className="text-sm font-medium text-destructive" role="alert">
          {printError}
        </p>
      ) : null}
      {activeBookingError ? (
        <Alert variant="destructive">{activeBookingError}</Alert>
      ) : null}

      <div className="flex flex-col items-center gap-2 py-2 text-center">
        <CheckCircle2
          className="size-24 text-primary"
          strokeWidth={1.75}
          aria-hidden
        />
        <p className="text-xl font-semibold text-foreground md:text-2xl">
          {t("paymentSuccess")}
        </p>
      </div>
      {activeBooking && !activeBookingError ? (
        <Alert
          variant="warning"
          className="my-4"
          icon={
            <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400" />
          }
          title={t("activeBookingNoticeTitle")}
        >
          <div className="space-y-3">
            <p>{t("activeBookingNotice")}</p>

            <ActiveBookingCountdown expiresAt={activeBooking.expires_at} />
          </div>
        </Alert>
      ) : null}
      <div className="flex w-full flex-col justify-between gap-2 md:flex-row">
        <Button
          type="button"
          variant="outline"
          className="order-2 w-full rounded-full border-2 border-primary font-semibold text-primary hover:text-primary md:order-1 md:w-36"
          onClick={onBack}
        >
          {t("back")}
        </Button>
        <Button
          type="button"
          className="order-1 w-full rounded-full md:order-2 md:w-36"
          disabled={!booking || isPrinting}
          onClick={() => void handlePrintReceipt()}
        >
          {isPrinting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Printer className="size-4" aria-hidden />
          )}
          {t("printReceipt")}
        </Button>
      </div>
    </div>
  );
}
