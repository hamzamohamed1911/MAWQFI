"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FileText, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { printBookingBillFromApi } from "@/lib/api/download-booking-bill";
import {
  paymentFromBooking,
  printBookingReceipt,
} from "@/lib/print-booking-receipt";
import type { ActiveBooking, PaymentResult } from "@/lib/types/zone";

type ViewInvoiceButtonProps = {
  booking: ActiveBooking | null;
  payment?: PaymentResult;
};

/** Prints the API bill, falling back to a locally rendered receipt. */
export function ViewInvoiceButton({ booking, payment }: ViewInvoiceButtonProps) {
  const t = useTranslations("HomePage");
  const locale = useLocale();
  const [isPrinting, setIsPrinting] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);

  async function handleViewInvoice() {
    if (!booking) {
      return;
    }

    setIsPrinting(true);
    setPrintError(null);

    const receiptLabels = {
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
    };

    try {
      await printBookingBillFromApi(booking.id, booking.plate);
    } catch {
      try {
        printBookingReceipt({
          booking,
          payment: payment ?? paymentFromBooking(booking),
          locale,
          brandName: t("title"),
          labels: receiptLabels,
        });
      } catch {
        setPrintError(t("printReceiptError"));
      }
    } finally {
      setIsPrinting(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        type="button"
        variant="link"
        className="h-auto gap-2 p-0 text-base font-semibold text-secondary-800"
        disabled={!booking || isPrinting}
        onClick={() => void handleViewInvoice()}
      >
        {isPrinting ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <FileText className="size-4" aria-hidden />
        )}
        {t("viewInvoice")}
      </Button>
      {printError ? (
        <p className="text-sm font-medium text-destructive" role="alert">
          {printError}
        </p>
      ) : null}
    </div>
  );
}
