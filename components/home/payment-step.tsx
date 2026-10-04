"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CalendarX, Copy } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ViewInvoiceButton } from "@/components/home/view-invoice-button";
import { useNow } from "@/lib/hooks/use-now";
import type {
  ActiveBooking,
  BookingQuoteResponse,
  ConfirmBookingResponse,
} from "@/lib/types/zone";
import { formatRemainingDuration } from "@/lib/utils/format-remaining";
import { formatDateTime } from "@/lib/utils/formatDateTime";
import { cn } from "@/lib/utils/cn";

type PaymentStepProps = {
  activeBooking: ActiveBooking | null;
  checkoutResult: BookingQuoteResponse | null;
  confirmResult: ConfirmBookingResponse | null;
  onExtend: () => void;
  onStartBooking: () => void;
};

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3  py-3 text-sm last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-end font-semibold text-foreground">{value}</span>
    </div>
  );
}

export function PaymentStep({
  activeBooking,
  confirmResult,
  onExtend,
  onStartBooking,
}: PaymentStepProps) {
  const t = useTranslations("HomePage");
  const locale = useLocale();
  const booking = confirmResult?.booking ?? activeBooking;
  const payment = confirmResult?.payment;

  const expiresAt = booking?.expires_at;
  const targetMs = useMemo(
    () => (expiresAt ? new Date(expiresAt).getTime() : 0),
    [expiresAt],
  );
  const now = useNow();
  const msLeft = now !== 0 && targetMs > 0 ? Math.max(0, targetMs - now) : null;

  const remainingLine = (() => {
    if (msLeft === null) {
      return "—";
    }
    const totalMinutes = Math.floor(msLeft / 60_000);
    if (totalMinutes < 60) {
      return t("timeRemainingMinutes", { count: totalMinutes });
    }
    const formatted = formatRemainingDuration(msLeft, {
      hoursShort: t("hoursUnit"),
      minutesShort: t("minutesUnit"),
      remainingJoin: t("remainingJoin"),
    });
    return t("timeRemainingDuration", { duration: formatted });
  })();

  async function handleCopyBookingNumber() {
    if (!booking) {
      return;
    }
    try {
      await navigator.clipboard.writeText(String(booking.id));
      toast.success(t("bookingNumberCopied"));
    } catch {
      toast.error(t("bookingNumberCopyFailed"));
    }
  }

  const locationLabel =
    booking?.site_name && booking?.zone_name
      ? t("locationZoneLine", {
          site: booking.site_name,
          zone: booking.zone_name,
        })
      : (booking?.site_name ?? booking?.zone_name ?? "—");

  if (!booking) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-4 py-10 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300">
          <CalendarX className="size-10" aria-hidden />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {t("noBookingTitle")}
        </h2>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          {t("noBookingHint")}
        </p>
        <Button
          type="button"
          className="mt-2 h-12 w-full rounded-full text-base font-semibold"
          onClick={onStartBooking}
        >
          {t("startNewBooking")}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5">
      <div className="flex flex-col items-center gap-2 pt-2 text-center">
        <Image
          src="/images/booking-confirmed.svg"
          alt={t("bookingConfirmedIllustrationAlt")}
          width={220}
          height={160}
          priority
          className="h-auto w-full max-w-55"
        />
        <h2 className="text-2xl font-bold text-primary-700 dark:text-primary-400">
          {t("bookingConfirmedTitle")}
        </h2>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          {t("bookingConfirmedHint")}
        </p>
      </div>

      {expiresAt ? (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {t("timeRemainingLabel")}
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
            {remainingLine}
          </p>
        </div>
      ) : null}

      <div className="rounded-2xl border border-border bg-card px-4 py-1 sm:px-5">
        <DetailRow label={t("plate-number")} value={booking.plate} />
        <DetailRow label={t("location")} value={locationLabel} />
        <DetailRow
          label={t("bookingEndsLabel")}
          value={
            expiresAt
              ? t("bookingEndsAt", {
                  time: formatDateTime(new Date(expiresAt), locale),
                })
              : "—"
          }
        />
        <DetailRow
          label={t("bookingNumber")}
          value={
            <button
              type="button"
              onClick={() => void handleCopyBookingNumber()}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-md font-semibold text-primary-700",
                "hover:text-primary-600 dark:text-primary-400",
              )}
              aria-label={t("copyBookingNumber")}
            >
              <Copy className="size-4 shrink-0" aria-hidden />#{booking.id}
            </button>
          }
        />
      </div>

      <div className="flex flex-col items-center gap-4 pt-1">
        <Button
          type="button"
          className="h-12 w-full rounded-full text-base font-semibold"
          onClick={onExtend}
        >
          {t("extendBooking")}
        </Button>
        <ViewInvoiceButton booking={booking} payment={payment} />
      </div>
    </div>
  );
}
