"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CalendarX, Copy, Info, Loader2, RefreshCw } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { submitBookingReturn } from "@/lib/api/zones";
import { readStoredCheckout } from "@/lib/booking-checkout-session";
import type { ParkingZone } from "@/lib/zones";
import { ViewInvoiceButton } from "@/components/home/view-invoice-button";
import { useNow } from "@/lib/hooks/use-now";
import type {
  ActiveBooking,
  BookingQuoteResponse,
  ConfirmBookingResponse,
  PaymentResult,
} from "@/lib/types/zone";
import { formatRemainingDuration } from "@/lib/utils/format-remaining";
import { formatDateTime } from "@/lib/utils/formatDateTime";
import { cn } from "@/lib/utils/cn";

type TapReturnState =
  | { status: "idle" }
  | { status: "pending" }
  | { status: "ok"; booking: ActiveBooking; payment: PaymentResult }
  | { status: "failed"; hours: number | null };

type PaymentStepProps = {
  activeBooking: ActiveBooking | null;
  checkoutResult: BookingQuoteResponse | null;
  confirmResult: ConfirmBookingResponse | null;
  zone?: ParkingZone | null;
  requestPlate?: string | null;
  onExtend: () => void;
  onStartBooking: () => void;
  onRetry?: () => void;
  checkoutId?: string;
  tapId?: string;
};

function DetailRow({
  label,
  value,
  labelClassName,
  className,
}: {
  label: string;
  value: ReactNode;
  labelClassName?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 py-3 text-sm last:border-b-0",
        className,
      )}
    >
      <span className={cn("text-muted-foreground", labelClassName)}>
        {label}
      </span>
      <span className="text-end font-semibold text-foreground">{value}</span>
    </div>
  );
}

export function PaymentStep({
  activeBooking,
  confirmResult,
  zone,
  requestPlate,
  onExtend,
  onStartBooking,
  onRetry,
  checkoutId,
  tapId,
}: PaymentStepProps) {
  const t = useTranslations("HomePage");

  const checkout = checkoutId?.trim() ?? "";
  const tap = tapId?.trim() ?? "";
  const isTapReturn = checkout.length > 0 && tap.length > 0;

  const sentReturnKey = useRef<string | null>(null);
  const [tapReturn, setTapReturn] = useState<TapReturnState>(
    isTapReturn ? { status: "pending" } : { status: "idle" },
  );

  useEffect(() => {
    if (!isTapReturn) {
      return;
    }

    const key = `${checkout}|${tap}`;
    if (sentReturnKey.current === key) {
      return;
    }
    sentReturnKey.current = key;

    void submitBookingReturn({
      checkout_id: checkout,
      tap_id: tap,
    }).then((result) => {
      if (result.ok) {
        setTapReturn({
          status: "ok",
          booking: result.data.booking,
          payment: result.data.payment,
        });
        return;
      }

      const hours = readStoredCheckout()?.booking.hours;
      setTapReturn({
        status: "failed",
        hours: typeof hours === "number" && hours > 0 ? hours : null,
      });
    });
  }, [checkout, isTapReturn, tap]);

  const locale = useLocale();
  const booking =
    tapReturn.status === "ok"
      ? tapReturn.booking
      : isTapReturn
        ? null
        : (confirmResult?.booking ?? activeBooking);
  const payment =
    tapReturn.status === "ok" ? tapReturn.payment : confirmResult?.payment;

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

  if (tapReturn.status === "pending") {
    return (
      <div className="mx-auto flex w-full max-w-lg justify-center py-16">
        <Loader2 className="size-8 animate-spin text-primary-600" aria-hidden />
      </div>
    );
  }

  if (tapReturn.status === "failed") {
    const requestLocation =
      zone?.site_name && zone?.name
        ? t("locationZoneLine", { site: zone.site_name, zone: zone.name })
        : (zone?.site_name ?? zone?.name ?? "—");
    const plate = requestPlate?.trim() || "—";
    const duration = tapReturn.hours
      ? t("paymentFailedDuration", { count: tapReturn.hours * 60 })
      : "—";

    return (
      <div className="mx-auto flex w-full max-w-lg flex-col gap-5">
        <div className="flex flex-col items-center gap-2 pt-2 text-center">
          <Image
            src="/images/failedPayment.svg"
            alt={t("paymentFailedIllustrationAlt")}
            width={168}
            height={137}
            priority
            className="h-auto w-42"
          />
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
            {t("paymentFailedTitle")}
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            {t("paymentFailedHint")}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:bg-red-950/40 dark:text-red-300">
          <Info className="size-4 shrink-0" aria-hidden />
          <span>{t("paymentFailedBanner")}</span>
        </div>

        <div className="rounded-2xl border border-border bg-card px-4 py-4 sm:px-5">
          <h3 className="text-start text-sm font-semibold text-primary-700 dark:text-primary-400">
            {t("paymentFailedDetailsTitle")}
          </h3>
          <div className="mt-4 flex flex-col gap-4">
            <DetailRow
              label={t("paymentFailedPlate")}
              value={plate}
              className="py-0"
              labelClassName="font-medium text-primary-700 dark:text-primary-400"
            />
            <DetailRow
              label={t("paymentFailedLocation")}
              value={requestLocation}
              className="py-0"
              labelClassName="font-medium text-primary-700 dark:text-primary-400"
            />
            <DetailRow
              label={t("paymentFailedDurationLabel")}
              value={duration}
              className="py-0"
              labelClassName="font-medium text-primary-700 dark:text-primary-400"
            />
          </div>
        </div>

        <Button
          type="button"
          className="h-12 w-full rounded-full text-base font-semibold"
          onClick={onRetry ?? onStartBooking}
        >
          {t("paymentFailedRetry")}
          <RefreshCw className="size-4" aria-hidden />
        </Button>
      </div>
    );
  }

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
