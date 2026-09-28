"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
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
};

export function PaymentStep({
  activeBooking,
  confirmResult,
  activeBookingError,
}: PaymentStepProps) {
  const t = useTranslations("HomePage");
  const booking = confirmResult?.booking ?? activeBooking;
  const payment = confirmResult?.payment;

  return (
    <div className="flex flex-col gap-4">
      {activeBookingError ? (
        <p className="text-sm font-medium text-destructive" role="alert">
          {activeBookingError}
        </p>
      ) : null}

      <div className="flex flex-col items-center gap-2 py-2 text-center">
        <CheckCircle2
          className="size-24 text-primary"
          strokeWidth={1.75}
          aria-hidden
        />
        <p className="md:text-2xl text-xl font-semibold text-foreground">
          {t("paymentSuccess")}
        </p>
      </div>

      <div className="flex justify-end">
        <Button type="button" className="w-full rounded-full md:w-36">
          <Printer className="size-4" aria-hidden />
          {t("printReceipt")}
        </Button>
      </div>
    </div>
  );
}
